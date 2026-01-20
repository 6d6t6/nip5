export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    let { username, pubkey } = body;

    if (!username || !pubkey) {
      return jsonResponse({ error: "Missing fields" }, 400);
    }

    username = username.toLowerCase().trim();

    if (!/^[a-z0-9_]{1,30}$/.test(username)) {
      return jsonResponse({ error: "Invalid username" }, 400);
    }

    if (!(pubkey.startsWith("npub") || /^[0-9a-fA-F]{64}$/.test(pubkey))) {
      return jsonResponse({ error: "Invalid pubkey format" }, 400);
    }

    const existing = await env.NIP5_KV.get(username);
    if (existing) {
      return jsonResponse({ error: "Username already taken" }, 409);
    }

    await env.NIP5_KV.put(username, pubkey);

    return jsonResponse({ success: true, username });

  } catch (err) {
    return jsonResponse({ error: "Bad request" }, 400);
  }
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
