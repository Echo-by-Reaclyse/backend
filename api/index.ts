import type { IncomingMessage, ServerResponse } from "http";
import app from "../src/app.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Buffer the full body from the stream before handing to Hono.
  // Vercel's node runtime may partially consume the IncomingMessage stream;
  // reading it here first ensures Hono always gets a complete body.
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", resolve);
    req.on("error", reject);
  });

  const body = Buffer.concat(chunks);
  const host = req.headers.host ?? "localhost";
  const url = `https://${host}${req.url ?? "/"}`;
  const method = req.method ?? "GET";

  const request = new Request(url, {
    method,
    headers: req.headers as HeadersInit,
    body: method !== "GET" && method !== "HEAD" && body.length > 0 ? body : undefined,
  });

  const response = await app.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
