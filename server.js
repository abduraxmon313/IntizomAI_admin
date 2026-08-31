/**
 * IntizomAI pitch deck — zero-dependency static file server.
 * Designed for Railway (binds to 0.0.0.0 and process.env.PORT).
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, status, body, headers) {
  res.writeHead(status, headers || {});
  res.end(body);
}

const server = http.createServer((req, res) => {
  try {
    // Only GET/HEAD
    if (req.method !== "GET" && req.method !== "HEAD") {
      return send(res, 405, "Method Not Allowed");
    }

    // Parse + normalize path, block traversal
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath === "/" || urlPath === "") urlPath = "/index.html";

    let filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
      return send(res, 403, "Forbidden");
    }

    fs.stat(filePath, (err, stat) => {
      // Directory -> index.html
      if (!err && stat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
          // SPA-ish fallback: serve index.html for unknown routes
          return fs.readFile(path.join(ROOT, "index.html"), (e2, home) => {
            if (e2) return send(res, 404, "Not Found");
            send(res, 200, home, { "Content-Type": MIME[".html"] });
          });
        }
        const ext = path.extname(filePath).toLowerCase();
        const type = MIME[ext] || "application/octet-stream";
        const cache =
          ext === ".html"
            ? "no-cache"
            : "public, max-age=3600";
        send(res, 200, req.method === "HEAD" ? undefined : data, {
          "Content-Type": type,
          "Cache-Control": cache,
        });
      });
    });
  } catch (e) {
    send(res, 500, "Internal Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`IntizomAI pitch deck running on http://0.0.0.0:${PORT}`);
});
