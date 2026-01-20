export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  if (name) {
    const username = name.toLowerCase().trim();
    const pubkey = await env.NIP5_KV.get(username);

    if (!pubkey) {
      return jsonResponse({ names: {} });
    }

    return jsonResponse({
      names: {
        [username]: pubkey
      }
    });
  }

  // Full directory (optional)
  const list = await env.NIP5_KV.list();
  const names = {};

  for (const key of list.keys) {
    const val = await env.NIP5_KV.get(key.name);
    if (val) names[key.name] = val;
  }

  return jsonResponse({ names });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    }
  });
}
