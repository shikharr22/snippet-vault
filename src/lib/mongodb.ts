import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URL as string; // Use environment variable
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>;
}

// Use global variable to maintain a single connection in dev mode (Hot Reloading)
if (!global?._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

// eslint-disable-next-line prefer-const
clientPromise = global._mongoClientPromise;

export default clientPromise;
