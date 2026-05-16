// Vercel serverless function that wraps the built TanStack Start server.
// Converts the Node req/res into a Web Request and pipes back the Response.
import { Readable } from "node:stream";
import server from "../dist/server/server.js";

export const config = {
  // Use Node.js runtime — the built server depends on node:async_hooks (h3 v2).
  runtime: "nodejs20.x",
};

function buildRequest(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `${proto}://${host}`).toString();

  const method = req.method ?? "GET";
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, String(value));
    }
  }

  const init = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function sendResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  if (!response.body) {
    res.end();
    return;
  }
  const nodeStream = Readable.fromWeb(response.body);
  nodeStream.pipe(res);
}

export default async function handler(req, res) {
  try {
    const request = buildRequest(req);
    const response = await server.fetch(request, {}, {});
    await sendResponse(res, response);
  } catch (error) {
    console.error("[vercel handler]", error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
}
