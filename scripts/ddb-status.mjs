// Live backend dashboard for the VibeCurve DynamoDB table.
// Run with:  npm run db:status   (loads creds from .env.local)
import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const region = process.env.VC_AWS_REGION;
const accessKeyId = process.env.VC_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.VC_AWS_SECRET_ACCESS_KEY;
const TableName = process.env.VC_DDB_TABLE || "VibeCurve";

if (!region || !accessKeyId || !secretAccessKey) {
  console.error("Missing VC_AWS_* creds in .env.local");
  process.exit(1);
}

const client = new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } });
const doc = DynamoDBDocumentClient.from(client);

const fmtTime = (ms) => {
  const r = Math.max(0, ms - Date.now());
  const h = Math.floor(r / 3.6e6);
  const m = Math.floor((r % 3.6e6) / 6e4);
  return `${h}h ${m}m`;
};
const bar = (n, max = 5) => "▰".repeat(Math.min(n, max)) + "▱".repeat(Math.max(0, max - n));

async function main() {
  // ── table metadata ──
  const desc = await client.send(new DescribeTableCommand({ TableName }));
  const t = desc.Table;

  // ── live scan ──
  let items = [];
  let ExclusiveStartKey;
  do {
    const r = await doc.send(new ScanCommand({ TableName, ExclusiveStartKey }));
    items = items.concat(r.Items ?? []);
    ExclusiveStartKey = r.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  const curves = items.filter((i) => String(i.SK).startsWith("CURVE#"));
  const metas = items.filter((i) => i.SK === "META");
  const members = items.filter((i) => String(i.SK).startsWith("MEMBER#"));
  const messages = items.filter((i) => String(i.SK).startsWith("MSG#"));
  const realMembers = members.filter((m) => !m.ambient);
  const users = new Set(curves.map((c) => c.userId));
  const now = Date.now();

  const rooms = metas
    .map((m) => {
      const rid = String(m.PK).replace("ROOM#", "");
      const mem = members.filter((x) => x.PK === m.PK);
      const msg = messages.filter((x) => x.PK === m.PK);
      return {
        rid,
        sig: m.signature,
        real: mem.filter((x) => !x.ambient).length,
        ambient: mem.filter((x) => x.ambient).length,
        msgs: msg.length,
        expiresAt: m.expiresAt,
        active: m.expiresAt > now,
      };
    })
    .sort((a, b) => (a.rid < b.rid ? 1 : -1));

  const activeRooms = rooms.filter((r) => r.active).length;

  const line = "─".repeat(60);
  console.log(`\n  🌊  VibeCurve · Backend Dashboard`);
  console.log(line);
  console.log(`  Table        ${TableName}  (${region})`);
  console.log(`  Status       ${t.TableStatus}   ·   Billing ${t.BillingModeSummary?.BillingMode ?? "—"}`);
  console.log(`  Streams      ${t.StreamSpecification?.StreamEnabled ? t.StreamSpecification.StreamViewType : "off"}`);
  console.log(`  GSI          ${(t.GlobalSecondaryIndexes ?? []).map((g) => `${g.IndexName}:${g.IndexStatus}`).join(", ") || "—"}`);
  console.log(line);
  console.log(`  Live items   ${items.length}`);
  console.log(`  Curves       ${curves.length}   ·   Unique souls ${users.size}`);
  console.log(`  Rooms        ${rooms.length}   (${activeRooms} active · ${rooms.length - activeRooms} past)`);
  console.log(`  Members      ${realMembers.length} real  +  ${members.length - realMembers.length} ambient`);
  console.log(`  Messages     ${messages.length}`);
  console.log(line);
  console.log(`  Recent rooms`);
  if (rooms.length === 0) {
    console.log(`    (none yet — draw a day to create one)`);
  } else {
    for (const r of rooms.slice(0, 8)) {
      const dot = r.active ? "🟢" : "⚪";
      console.log(
        `    ${dot} ${r.rid.padEnd(22)} ${String(r.sig).padEnd(6)} ` +
          `👥 ${bar(r.real + r.ambient)} ${r.real}+${r.ambient}a  💬 ${String(r.msgs).padStart(3)}  ` +
          `${r.active ? "⏳ " + fmtTime(r.expiresAt) : "burned"}`,
      );
    }
  }
  console.log(line + "\n");
}

main().catch((e) => {
  console.error("dashboard error:", e.name, e.message);
  process.exit(1);
});
