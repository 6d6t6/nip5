// build.js — Cloudflare Pages build step
// Reads KV and generates /.well-known/nostr.json

const fs = require("fs");

async function main() {
  const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
  const KV_ID = process.env.CF_KV_NAMESPACE_ID;
  const API_TOKEN = process.env.CF_KV_API_TOKEN;

  const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_ID}`;

  // List keys
  const listRes = await fetch(`${BASE}/keys`, {
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`
    }
  });

  const listJson = await listRes.json();

  if (!listJson.success) {
    console.error("KV list failed:", listJson);
    process.exit(1);
  }

  const names = {};

  // Fetch each value
  for (const item of listJson.result) {
    const keyName = item.name;

    const valRes = await fetch(`${BASE}/values/${keyName}`, {
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`
      }
    });

    const npub = await valRes.text();
    names[keyName] = npub;
  }

  // Ensure directory exists
  fs.mkdirSync(".well-known", { recursive: true });

  // Write nostr.json
  fs.writeFileSync(
    ".well-known/nostr.json",
    JSON.stringify({ names }, null, 2)
  );

  console.log("nostr.json generated successfully");
}

main();
