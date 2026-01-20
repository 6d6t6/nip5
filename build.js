import fs from "fs"
import fetch from "node-fetch"

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID
const API_TOKEN = process.env.CF_API_TOKEN

async function main() {
  // list KV keys
  const listResp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/keys`,
    { headers: { Authorization: `Bearer ${API_TOKEN}` } }
  )
  const listData = await listResp.json()

  const names = {}

  for (const key of listData.result) {
    const valResp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${key.name}`,
      { headers: { Authorization: `Bearer ${API_TOKEN}` } }
    )
    const npub = await valResp.text()
    names[key.name] = npub
  }

  // ensure directory exists
  fs.mkdirSync("./dist/.well-known", { recursive: true })

  // write nostr.json
  fs.writeFileSync(
    "./dist/.well-known/nostr.json",
    JSON.stringify({ names }, null, 2)
  )

  console.log("Generated /.well-known/nostr.json")
}

main()
