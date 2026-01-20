export async function onRequestPost({ request }) {
  const headers = {};
  for (const [k, v] of request.headers.entries()) {
    headers[k] = v;
  }

  const buf = await request.arrayBuffer();
  const raw = new TextDecoder().decode(buf);

  return new Response(JSON.stringify({
    method: request.method,
    headers,
    rawBody: raw,
    rawLength: raw.length
  }, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
