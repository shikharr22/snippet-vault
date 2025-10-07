import IORedis, { Redis } from "ioredis";
import { Queue, Worker, JobsOptions } from "bullmq";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "./mongodb";
import { Db } from "mongodb";
import Redlock from "redlock";
import { verifyAccessCookies } from "./auth";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const QUEUE_PREFIX = process.env.QUEUE_PREFIX || "snippet_vault";
const DATABASE_NAME = process.env.DATABASE_NAME || "snippet_vault_db";

// keep singletons across module reloads (Next dev)
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var __infra__: any;
}
if (!global.__infra__) global.__infra__ = {};

// Singleton redlock instance using ioredis client
if (!global.__infra__.redlock) {
  const client = getRedis();
  const clientsArray = [client as unknown as any];

  global.__infra__.redlock = new Redlock(clientsArray, {
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 200,
  });
}
export const redlock: Redlock = global.__infra__.redlock;

/** Acquire a distributed lock on a resource using Redlock */
export async function acquireLock(resource: string, ttlMs: number) {
  // Returns a Lock object if successful
  return await redlock.acquire([resource], ttlMs);
}

/** Release a distributed lock safely, ignoring LockError if already expired */
export async function releaseLock(lock: any) {
  try {
    await lock.release(); // Redlock v5+ uses release()
  } catch (err: any) {
    // Ignore lock errors if already expired
    if (err?.name !== "LockError") throw err;
  }
}

export function getRedis(): Redis {
  if (!global.__infra__.redis) {
    global.__infra__.redis = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
    global.__infra__.redis.on("error", (error: Error) => {
      // add more sophisticated logging as needed
      console.error("Redis error:", error);
    });
  }
  return global.__infra__.redis as Redis;
}

/** Get or create a queue (for adding jobs) */
export function getQueue(name = "default"): Queue {
  if (!global.__infra__.queues) global.__infra__.queues = {};
  if (!global.__infra__.queues[name]) {
    const redis = getRedis();
    const queue = new Queue(name, { connection: redis, prefix: QUEUE_PREFIX });
    global.__infra__.queues[name] = queue;
  }
  return global.__infra__.queues[name] as Queue;
}

/** Enqueue a job (with default retry/backoff) */
export async function enqueueJob(
  queueName: string,
  jobName: string,
  payload: any,
  opts?: JobsOptions
) {
  const q = getQueue(queueName);
  const defaultOpts: JobsOptions = {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
  };
  return q.add(jobName, payload, opts ?? defaultOpts);
}

/** Create a worker to process jobs from the queue */
export function createWorker(
  queueName: string,
  processor: (job: any) => Promise<any>,
  opts?: { concurrency?: number }
) {
  const redis = getRedis();
  const concurrency = opts?.concurrency ?? 4;
  const worker = new Worker(queueName, async (job) => processor(job), {
    connection: redis,
    concurrency,
    prefix: QUEUE_PREFIX,
  });

  worker.on("error", (err) =>
    console.error(`[worker:${queueName}] error`, err)
  );
  worker.on("failed", (job: any, err) =>
    console.error(`[worker:${queueName}] failed ${job.id}`, err)
  );
  worker.on("completed", (job) => {
    // optionally log or metrics
  });

  return worker;
}

// Step 1: cache helpers
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const redis = getRedis();
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    // corrupt value — remove and return null
    await redis.del(key);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds = 300
): Promise<void> {
  const redis = getRedis();
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

// Step 2: withCacheLock (cache-aside + simple lock)
/**
 * Distributed cache-aside with Redlock for stampede protection.
 * Acquires a lock on 'locks:' + key, fetches and caches if lock acquired, else polls cache.
 * Prevents accidental deletes and ensures only one fetcher populates cache at a time.
 */
export async function withCacheLock<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { ttlSeconds?: number; lockTtlSeconds?: number; pollRetries?: number }
): Promise<T> {
  const ttl = opts?.ttlSeconds ?? 300;
  const lockTtlMs = (opts?.lockTtlSeconds ?? 10) * 1000;
  const lockResource = `locks:${key}`;

  // Fast path: return cached value if present
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    console.log("fetched from cache", key);
    // Cache hit
    return cached;
  }

  let lock: any = null;
  try {
    // Try to acquire distributed lock
    lock = await acquireLock(lockResource, lockTtlMs);
  } catch (err: any) {
    // If lock not acquired, Redlock will retry per config, else throw
    // If Redis unreachable, fallback to direct fetch
    if (err?.name === "LockError" || err?.message?.includes("ECONNREFUSED")) {
      lock = null;
    } else {
      throw err;
    }
  }

  if (lock) {
    try {
      // We hold the lock: fetch and cache
      const value = await fetcher();
      await cacheSet(key, value, ttl);
      return value;
    } finally {
      console.log("fetched from db", key);
      // Always release lock
      await releaseLock(lock);
    }
  } else {
    // Someone else is fetching: poll cache
    const retries = opts?.pollRetries ?? 8;
    for (let i = 0; i < retries; i++) {
      await new Promise((res) => setTimeout(res, 100 * (i + 1)));
      const v = await cacheGet<T>(key);
      if (v !== null) return v;
    }
    // Fallback: fetch directly and cache
    const fallback = await fetcher();
    await cacheSet(key, fallback, ttl);
    return fallback;
  }
}

export function handleError(err: any) {
  console.error("infra error:", err);
  const status =
    err?.statusCode ||
    err?.status ||
    (err?.message === "UNAUTHORIZED" ? 401 : 500);
  const body = { error: err?.message || "internal_error" };
  return NextResponse.json(body, { status });
}

// replace existing requireAuth with this implementation
export function requireAuth(req: NextRequest) {
  try {
    console.log(req);
    // verifyAccessCookies will throw if token missing/invalid
    const decoded = verifyAccessCookies(req);
    // decoded usually contains the JWT payload — return it for route handlers
    return decoded;
  } catch (error) {
    console.error(error);
  }
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = await client.db(DATABASE_NAME);

  return db;
}
