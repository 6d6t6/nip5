export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  if (name) {
    const username = name.toLowerCase().trim();
    const pubkey = await env.NIP5_KV.get(username);
    if (!pubkey) return json({ names: {} });
    return json({ names: { [username]: pubkey } });
  }

  const list = await env.NIP5_KV.list();
  const names = {};
  for (const key of list.keys) {
    const val = await env.NIP5_KV.get(key.name);
    if (val) names[key.name] = val;
  }
  return json({ names });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
