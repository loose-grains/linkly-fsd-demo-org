import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function sendJson(
  res: ServerResponse,
  status: number,
  payload: unknown
): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const PUBLIC_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public"
);

export async function sendStatic(
  res: ServerResponse,
  urlPath: string
): Promise<boolean> {
  const relative = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");
  if (relative.includes("..")) {
    return false;
  }
  const filePath = path.join(PUBLIC_DIR, relative);
  try {
    const body = await readFile(filePath);
    res.statusCode = 200;
    res.setHeader("content-type", contentTypeFor(filePath));
    res.end(body);
    return true;
  } catch {
    return false;
  }
}

function contentTypeFor(filePath: string): string {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}
