export async function onRequestPost({ request, env }) {
  try {
    // Always works in Pages Functions
    const buf = await request.arrayBuffer();
    const raw = new TextDecoder().decode(buf);
    const body = JSON.parse(raw);

    let { username, pubkey } = body;

    if (!username || !pubkey) {
      return json({ error: "Missing fields" }, 400);
    }

    username = username.toLowerCase().trim();

    if (!/^[a-z0-9_]{1,30}$/.test(username)) {
      return json({ error: "Invalid username" }, 400);
    }

    if (!(pubkey.startsWith("npub") || /^[0-9a-fA-F]{64}$/.test(pubkey))) {
      return json({ error: "Invalid pubkey format" }, 400);
    }

    const existing = await env.NIP5_KV.get(username);
    if (existing) {
      return json({ error: "Username already taken" }, 409);
    }

    await env.NIP5_KV.put(username, pubkey);

    return json({ success: true, username });

  } catch (err) {
    return json({ error: "Bad request" }, 400);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
