// build.js
// Runs during Pages build

const API = process.env.CF_PAGES_INTERNAL_KV_ENDPOINT;
const KV_TOKEN = process.env.CF_PAGES_INTERNAL_TOKEN;

async function main() {
  // Query KV directly from Pages build environment
  const res = await fetch(`${API}/NIP5_KV/list`, {
    headers: { "Authorization": `Bearer ${KV_TOKEN}` }
  });

  const list = await res.json();
  const names = {};

  for (const key of list.keys) {
    const v = await fetch(`${API}/NIP5_KV/get/${key.name}`, {
      headers: { "Authorization": `Bearer ${KV_TOKEN}` }
    });
    names[key.name] = await v.text();
  }

  const fs = require("fs");
  fs.mkdirSync(".well-known", { recursive: true });

  fs.writeFileSync(
    ".well-known/nostr.json",
    JSON.stringify({ names }, null, 2)
  );

  console.log("nostr.json generated");
}

main();
