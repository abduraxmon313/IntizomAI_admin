/**
 * IntizomAI pitch deck — Node.js server with mini admin panel.
 *
 * Public site is served as static files. The logo is stored in PostgreSQL
 * (Railway `DATABASE_URL`) so it can be replaced from `/admin` without a
 * redeploy — every visitor (including "outsiders") sees the same logo.
 *
 * Endpoints
 *   GET  /                    → index.html (public site)
 *   GET  /admin               → admin.html (mini panel)
 *   GET  /logo                → raw logo bytes (or default placeholder SVG)
 *   GET  /api/logo            → { logo: <dataURL|null>, updatedAt }
 *   GET  /api/admin/me        → { authed, dbReady }
 *   POST /api/admin/login     → { password } → sets admin_token cookie
 *   POST /api/admin/logout    → clears cookie
 *   POST /api/admin/logo      → { dataUrl } → stores in DB (auth required)
 *   DELETE /api/admin/logo    → removes logo from DB (auth required)
 *
 * Env
 *   PORT              — HTTP port (Railway sets this)
 *   DATABASE_URL      — PostgreSQL connection string (Railway plugin)
 *   ADMIN_PASSWORD    — password for /admin (default: "intizom2026")
 *   SESSION_SECRET    — HMAC secret for the auth cookie (auto-generated if unset)
 *   PGSSL             — set to "false" to disable SSL (local dev)
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");

// ────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "intizom2026";
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const DATABASE_URL = process.env.DATABASE_URL || "";
const MAX_LOGO_BYTES = 4 * 1024 * 1024; // 4 MB

// ────────────────────────────────────────────────────────────
// Database
// ────────────────────────────────────────────────────────────
let pool = null;
let dbReady = false;

if (DATABASE_URL) {
  const useSsl =
    process.env.PGSSL !== "false" && !/sslmode=disable/i.test(DATABASE_URL);
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 5,
  });
  pool
    .query(
      `CREATE TABLE IF NOT EXISTS site_assets (
         key        TEXT PRIMARY KEY,
         mime       TEXT NOT NULL,
         data       BYTEA NOT NULL,
         updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
       );`
    )
    .then(() => {
      dbReady = true;
      console.log("[db] ready — site_assets table ensured");
    })
    .catch((e) => {
      console.error("[db] init failed:", e.message);
    });
} else {
  console.warn(
    "[db] DATABASE_URL is not set — logo upload disabled, placeholder used"
  );
}

// ────────────────────────────────────────────────────────────
// Sessions (signed cookie)
// ────────────────────────────────────────────────────────────
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(value) {
  const mac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(value)
    .digest("hex")
    .slice(0, 32);
  return value + "." + mac;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const value = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(value)
    .digest("hex")
    .slice(0, 32);
  if (mac.length !== expected.length) return false;
  const ok = crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  if (!ok) return false;
  const parts = value.split(":");
  const ts = parseInt(parts[0], 10);
  if (!ts || Date.now() - ts > SESSION_TTL_MS) return false;
  return true;
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const out = {};
  raw.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) {
      const k = p.slice(0, i).trim();
      const v = p.slice(i + 1).trim();
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
  });
  return out;
}

function isAuthed(req) {
  const c = parseCookies(req);
  return verifyToken(c.admin_token);
}

function issueTokenCookie() {
  const token = sign(Date.now() + ":admin");
  return `admin_token=${encodeURIComponent(
    token
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(
    SESSION_TTL_MS / 1000
  )}`;
}

// ────────────────────────────────────────────────────────────
// HTTP helpers
// ────────────────────────────────────────────────────────────
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
  if (body === undefined || body === null) res.end();
  else res.end(body);
}

function json(res, status, obj, extraHeaders) {
  const headers = Object.assign(
    { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    extraHeaders || {}
  );
  send(res, status, JSON.stringify(obj), headers);
}

function readJson(req, limit = 6 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        req.destroy();
        reject(new Error("payload too large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// Default placeholder SVG when no logo has been uploaded.
const PLACEHOLDER_SVG = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1749e0"/>
      <stop offset="1" stop-color="#7cc4ff"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <text x="32" y="42" text-anchor="middle" font-family="Manrope,Segoe UI,sans-serif"
        font-weight="800" font-size="26" fill="#fff" letter-spacing="-1">IA</text>
</svg>`,
  "utf8"
);

async function getLogoRow() {
  if (!dbReady) return null;
  try {
    const q = await pool.query(
      "SELECT mime, data, updated_at FROM site_assets WHERE key='logo' LIMIT 1"
    );
    return q.rows[0] || null;
  } catch (e) {
    console.error("[db] read logo failed:", e.message);
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// Route handlers
// ────────────────────────────────────────────────────────────
async function handleLogo(req, res) {
  // Public raw-image endpoint used by <img src="/logo">.
  const row = await getLogoRow();
  if (row) {
    const etag = '"' + new Date(row.updated_at).getTime() + '"';
    if (req.headers["if-none-match"] === etag) {
      return send(res, 304, null, { ETag: etag });
    }
    return send(res, 200, row.data, {
      "Content-Type": row.mime,
      "Cache-Control": "public, max-age=30, must-revalidate",
      ETag: etag,
    });
  }
  // Fallback placeholder — still 200 so no broken image icons ever appear.
  return send(res, 200, PLACEHOLDER_SVG, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=30, must-revalidate",
    "X-Logo": "placeholder",
  });
}

async function handleApi(req, res, urlPath) {
  // ---- GET /api/logo (public, returns dataURL) ----
  if (req.method === "GET" && urlPath === "/api/logo") {
    const row = await getLogoRow();
    if (!row) return json(res, 200, { logo: null, updatedAt: null });
    return json(res, 200, {
      logo: `data:${row.mime};base64,${row.data.toString("base64")}`,
      mime: row.mime,
      updatedAt: row.updated_at,
    });
  }

  // ---- GET /api/admin/me ----
  if (req.method === "GET" && urlPath === "/api/admin/me") {
    return json(res, 200, {
      authed: isAuthed(req),
      dbReady,
    });
  }

  // ---- POST /api/admin/login ----
  if (req.method === "POST" && urlPath === "/api/admin/login") {
    let body;
    try {
      body = await readJson(req);
    } catch {
      return json(res, 400, { ok: false, error: "invalid body" });
    }
    const password = String(body.password || "");
    // constant-time compare
    const a = Buffer.from(password);
    const b = Buffer.from(ADMIN_PASSWORD);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) return json(res, 401, { ok: false, error: "noto'g'ri parol" });
    return json(res, 200, { ok: true }, { "Set-Cookie": issueTokenCookie() });
  }

  // ---- POST /api/admin/logout ----
  if (req.method === "POST" && urlPath === "/api/admin/logout") {
    return json(
      res,
      200,
      { ok: true },
      { "Set-Cookie": "admin_token=; Path=/; HttpOnly; Max-Age=0" }
    );
  }

  // ---- POST /api/admin/logo ----
  if (req.method === "POST" && urlPath === "/api/admin/logo") {
    if (!isAuthed(req))
      return json(res, 401, { ok: false, error: "not authorized" });
    if (!dbReady)
      return json(res, 503, {
        ok: false,
        error: "PostgreSQL ulanmagan — DATABASE_URL sozlang",
      });
    let body;
    try {
      body = await readJson(req);
    } catch (e) {
      return json(res, 413, { ok: false, error: "juda katta fayl" });
    }
    const dataUrl = String(body.dataUrl || "");
    const m = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/.exec(dataUrl);
    if (!m) return json(res, 400, { ok: false, error: "noto'g'ri format" });
    const mime = m[1];
    if (!/^image\//.test(mime))
      return json(res, 400, { ok: false, error: "faqat rasm fayli" });
    let data;
    try {
      data = Buffer.from(m[2], "base64");
    } catch {
      return json(res, 400, { ok: false, error: "base64 xato" });
    }
    if (!data.length)
      return json(res, 400, { ok: false, error: "bo'sh fayl" });
    if (data.length > MAX_LOGO_BYTES)
      return json(res, 400, {
        ok: false,
        error: `fayl ${MAX_LOGO_BYTES / 1024 / 1024} MB dan katta`,
      });
    try {
      await pool.query(
        `INSERT INTO site_assets(key, mime, data, updated_at)
         VALUES ('logo', $1, $2, NOW())
         ON CONFLICT (key) DO UPDATE
           SET mime = EXCLUDED.mime,
               data = EXCLUDED.data,
               updated_at = NOW();`,
        [mime, data]
      );
      return json(res, 200, { ok: true, size: data.length, mime });
    } catch (e) {
      console.error("[db] save logo failed:", e.message);
      return json(res, 500, { ok: false, error: "saqlab bo'lmadi" });
    }
  }

  // ---- DELETE /api/admin/logo ----
  if (req.method === "DELETE" && urlPath === "/api/admin/logo") {
    if (!isAuthed(req))
      return json(res, 401, { ok: false, error: "not authorized" });
    if (!dbReady)
      return json(res, 503, { ok: false, error: "PostgreSQL ulanmagan" });
    try {
      await pool.query("DELETE FROM site_assets WHERE key='logo'");
      return json(res, 200, { ok: true });
    } catch (e) {
      return json(res, 500, { ok: false, error: "o'chirib bo'lmadi" });
    }
  }

  return json(res, 404, { error: "not found" });
}

// ────────────────────────────────────────────────────────────
// Static file serving
// ────────────────────────────────────────────────────────────
function serveStatic(req, res, urlPath) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method Not Allowed");
  }

  let target = urlPath;
  if (target === "/" || target === "") target = "/index.html";
  // Pretty URL for the admin panel
  if (target === "/admin" || target === "/admin/") target = "/admin.html";

  let filePath = path.normalize(path.join(ROOT, target));
  if (!filePath.startsWith(ROOT)) return send(res, 403, "Forbidden");

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, "index.html");
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        // SPA-ish fallback for unknown paths → index.html
        return fs.readFile(path.join(ROOT, "index.html"), (e2, home) => {
          if (e2) return send(res, 404, "Not Found");
          send(res, 200, home, { "Content-Type": MIME[".html"] });
        });
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      const cache = ext === ".html" ? "no-cache" : "public, max-age=3600";
      send(res, 200, req.method === "HEAD" ? undefined : data, {
        "Content-Type": type,
        "Cache-Control": cache,
      });
    });
  });
}

// ────────────────────────────────────────────────────────────
// Main server
// ────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

    if (urlPath === "/logo") return await handleLogo(req, res);
    if (urlPath.startsWith("/api/")) return await handleApi(req, res, urlPath);
    return serveStatic(req, res, urlPath);
  } catch (e) {
    console.error("[server] unhandled:", e);
    send(res, 500, "Internal Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`IntizomAI pitch deck running on http://0.0.0.0:${PORT}`);
  console.log(`admin panel:   /admin  (password via ADMIN_PASSWORD env)`);
  console.log(`logo storage:  ${dbReady ? "PostgreSQL" : "PostgreSQL (waiting…)"}`);
});
