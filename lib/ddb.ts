import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * DynamoDB DocumentClient + config detection.
 *
 * Credentials use custom VC_AWS_* env names (NOT the standard AWS_* names),
 * because Vercel's serverless runtime is itself on AWS Lambda and already sets
 * AWS_ACCESS_KEY_ID / AWS_REGION to Vercel's own values — using those would
 * point us at the wrong account. We pass our credentials explicitly instead.
 *
 *   VC_AWS_REGION, VC_AWS_ACCESS_KEY_ID, VC_AWS_SECRET_ACCESS_KEY, VC_DDB_TABLE
 *
 * When these aren't set, `ddbConfigured` is false and lib/store.ts transparently
 * falls back to the in-memory store (local dev without AWS still works).
 */

const region = process.env.VC_AWS_REGION;
const accessKeyId = process.env.VC_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.VC_AWS_SECRET_ACCESS_KEY;

export const TABLE = process.env.VC_DDB_TABLE || "VibeCurve";
export const ddbConfigured = Boolean(region && accessKeyId && secretAccessKey);

let cached: DynamoDBDocumentClient | null = null;

export function doc(): DynamoDBDocumentClient {
  if (cached) return cached;
  const client = new DynamoDBClient({
    region,
    credentials:
      accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });
  cached = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
  return cached;
}
