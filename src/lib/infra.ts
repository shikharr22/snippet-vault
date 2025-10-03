import IORedis, { Redis } from "ioredis";
import { Queue, Worker, JobsOptions } from "bullmq";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessCookies } from "./utils";
import clientPromise from "./mongodb";
import { Db } from "mongodb";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const QUEUE_PREFIX = process.env.QUEUE_PREFIX || "snippet_vault";
const DATABASE_NAME = process.env.DATABASE_NAME || "snippet_vault_db";

// keep singletons across module reloads (Next dev)
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var __infra__: any;
}
if (!global.__infra__) global.__infra__ = {};

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
export async function withCacheLock<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { ttlSeconds?: number; lockTtlSeconds?: number; pollRetries?: number }
): Promise<T> {
  const ttl = opts?.ttlSeconds ?? 300;
  const lockKey = `lock:${key}`;
  const redis = getRedis();

  // fast path
  const cached = await cacheGet<T>(key);

  if (cached !== null) {
    return cached;
  }

  // try to acquire lock
  const got = await redis.set(
    lockKey,
    "1",
    "NX",
    "EX",
    opts?.lockTtlSeconds ?? 10
  );
  if (got) {
    try {
      const value = await fetcher();
      await cacheSet(key, value, ttl);
      return value;
    } finally {
      // remove lock proactively
      await redis.del(lockKey);
    }
  } else {
    // someone else is fetching, poll briefly
    const retries = opts?.pollRetries ?? 8;
    for (let i = 0; i < retries; i++) {
      await new Promise((res) => setTimeout(res, 100 * (i + 1)));
      const v = await cacheGet<T>(key);
      if (v !== null) return v;
    }
    // fallback: fetch directly to avoid blocking forever
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
    // verifyAccessCookies will throw if token missing/invalid
    const decoded = verifyAccessCookies(req);
    // decoded usually contains the JWT payload — return it for route handlers
    return decoded;
  } catch (err: any) {
    // Normalize into an Error with statusCode so handleError can map to 401
    const message = err?.message ?? "UNAUTHORIZED";
    const e = new Error(message);
    // common convention used in this project: statusCode property read by handleError
    (e as any).statusCode = 401;
    throw e;
  }
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = await client.db(DATABASE_NAME);

  return db;
}
