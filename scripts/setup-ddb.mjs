// One-time provisioning of the VibeCurve DynamoDB table (playbook §10.1):
// single table, PK/SK, GSI1 for shape-bucket matching, Streams on, TTL on `ttl`.
// Run with:  npm run setup:ddb   (loads creds from .env.local)
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTimeToLiveCommand,
  DescribeTimeToLiveCommand,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";

const region = process.env.VC_AWS_REGION;
const accessKeyId = process.env.VC_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.VC_AWS_SECRET_ACCESS_KEY;
const TableName = process.env.VC_DDB_TABLE || "VibeCurve";

if (!region || !accessKeyId || !secretAccessKey) {
  console.error(
    "Missing creds. Set VC_AWS_REGION, VC_AWS_ACCESS_KEY_ID, VC_AWS_SECRET_ACCESS_KEY in .env.local",
  );
  process.exit(1);
}

const client = new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } });

async function ensureTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName }));
    console.log(`✓ Table "${TableName}" already exists in ${region}.`);
    return;
  } catch (e) {
    if (e.name !== "ResourceNotFoundException") throw e;
  }
  console.log(`Creating table "${TableName}" in ${region}…`);
  await client.send(
    new CreateTableCommand({
      TableName,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" },
        { AttributeName: "GSI1PK", AttributeType: "S" },
        { AttributeName: "GSI1SK", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" },
        { AttributeName: "SK", KeyType: "RANGE" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "GSI1",
          KeySchema: [
            { AttributeName: "GSI1PK", KeyType: "HASH" },
            { AttributeName: "GSI1SK", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
      ],
      StreamSpecification: { StreamEnabled: true, StreamViewType: "NEW_AND_OLD_IMAGES" },
    }),
  );
  console.log("Waiting for table to become ACTIVE…");
  await waitUntilTableExists({ client, maxWaitTime: 180 }, { TableName });
  console.log("✓ Table is ACTIVE.");
}

async function ensureTtl() {
  const ttl = await client.send(new DescribeTimeToLiveCommand({ TableName }));
  const status = ttl.TimeToLiveDescription?.TimeToLiveStatus;
  if (status === "ENABLED" || status === "ENABLING") {
    console.log("✓ TTL already configured on `ttl`.");
    return;
  }
  await client.send(
    new UpdateTimeToLiveCommand({
      TableName,
      TimeToLiveSpecification: { Enabled: true, AttributeName: "ttl" },
    }),
  );
  console.log("✓ TTL enabled on `ttl`.");
}

await ensureTable();
await ensureTtl();
console.log("\nDone — GSI1 ready · Streams NEW_AND_OLD_IMAGES · TTL on `ttl`.");
