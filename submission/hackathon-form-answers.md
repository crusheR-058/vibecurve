# VibeCurve — Hackathon submission form answers

## Which database did you use? (Select all that apply)

- [ ] Amazon Aurora
- [ ] Amazon Aurora DSQL
- [x] **Amazon DynamoDB**   ✅ select this one only

VibeCurve uses **Amazon DynamoDB exclusively** as its primary back end — a single-table
design accessed from Next.js serverless API routes via the AWS SDK v3 DocumentClient.
Do **not** tick Aurora or Aurora DSQL: the project doesn't use them, and your proof
screenshot must match what you check.

**Why DynamoDB fits the product:** every room, curve and message carries a `ttl`
attribute set to local midnight, so DynamoDB TTL auto-reaps them — the database itself
implements the product's signature "midnight burn." Matching is a single `GSI1` query
(shape-bucket / affinity), and the "last seat" join race is closed with a conditional
`UpdateItem`. Permanent profiles are the one item type written **without** a TTL.

---

## Architecture diagram (required)

Upload **`architecture-diagram.png`** (or `.pdf`) from this folder. Both are accepted
(allowed: pdf, ppt, pptx, png, jpg, jpeg; max 35 MB — this file is well under).

It shows: Browser/PWA → Vercel (Next.js front end + serverless API routes, on AWS
Lambda) → Amazon DynamoDB (single table, GSI1 matching, Streams, TTL), with Google
OAuth via NextAuth and peer-to-peer WebRTC audio (only SDP/ICE signaling touches the DB).

---

## Upload a screenshot proving your AWS database usage (required)

You need a screenshot from **your own AWS account / Vercel** (I can't capture it for you).
Strongest-to-acceptable options — pick one (or combine into one image):

**Best — AWS Console showing the live DynamoDB table:**
1. Sign in to the AWS Console → **DynamoDB → Tables → `VibeCurve`**.
2. Capture the **Overview / General information** panel — table name `VibeCurve`,
   partition key `PK`, sort key `SK`, item count, and Region.
3. Bonus credibility (optional second capture): the **Indexes** tab showing **`GSI1`**,
   and **Additional settings** showing **TTL = Enabled (attribute `ttl`)** and
   **DynamoDB stream = On**. These match the diagram exactly.
4. Even better: **Explore table items** showing real `ROOM#…`, `USER#…`, `CURVE#…` rows.

**Also acceptable:**
- **Vercel → Project → Settings → Environment Variables** showing `VC_AWS_REGION`,
  `VC_AWS_ACCESS_KEY_ID`, `VC_AWS_SECRET_ACCESS_KEY`, `VC_DDB_TABLE` configured
  (mask the secret value).
- Output of `npm run db:status` (the live backend dashboard) in a terminal, alongside
  the AWS Console tab.

Tip: make sure the table name in the screenshot (`VibeCurve`) is legible — judges
cross-check it against the diagram and the checked database.

---

## OPTIONAL bonus-points content

Post the content in `aws-builders-post.md`, then paste its public URL(s) into the form.
It already contains the required "created for this hackathon" disclosure, and use
**#H0Hackathon** when you share it on social media.
