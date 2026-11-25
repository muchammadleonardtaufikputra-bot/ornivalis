// ornivalis-stats — penghitung kunjungan + buku pesan untuk website ORNIVALIS.
// ---------------------------------------------------------------------------
// CARA DEPLOY (Cloudflare dashboard, ~5 menit):
// 1. Buka dash.cloudflare.com -> Workers & Pages -> Create -> Create Worker
//    -> beri nama "ornivalis-stats" -> Deploy.
// 2. Edit code: hapus isi worker, paste seluruh file ini -> Deploy.
// 3. Buat KV: Storage & Databases -> KV -> Create namespace "ORNIVALIS_STATS".
// 4. Bind KV ke worker: buka worker -> Settings -> Variables -> Add binding
//    -> Variable name: ORNIVALIS_STATS, KV namespace: ORNIVALIS_STATS -> Deploy.
// 5. Tambah password: Settings -> Variables -> Add variable (secret):
//    ORNIVALIS_STATS_PASSWORD = password untuk melihat statistik dan
//    menghapus pesan (boleh sama dengan password statistik linktree).
// 6. URL worker jadi https://ornivalis-stats.<subdomain-kamu>.workers.dev/
//    — halaman ORNIVALIS sudah dipasang ke alamat itu.
// ---------------------------------------------------------------------------
// PRIVASI: IP pengunjung tidak pernah disimpan. Yang disimpan hanya hash
// IP + tanggal (untuk menghitung pengunjung unik harian), negara/kota
// kasar dari Cloudflare, perangkat, browser, dan sumber kunjungan.
// Nama pengunjung tidak bisa diketahui — mereka tidak login.
// Pesan buku tamu bersifat PUBLIK: nama dan isi pesan tampil di halaman
// untuk semua orang. Jangan tulis data pribadi yang sensitif di sana.

const MAX_LOG = 200; // simpan 200 kunjungan terakhir
const MAX_MESSAGES = 100; // simpan 100 pesan terakhir
const DEDUPE_TTL = 600; // 10 menit: refresh dalam jangka ini tidak dihitung lagi
const MSG_COOLDOWN_TTL = 60; // 60 detik: satu pengunjung max 1 pesan per menit

const dayStr = (d) => d.toISOString().slice(0, 10);

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseUA(ua) {
  ua = ua || "";
  let device = "Desktop";
  if (/iPad/i.test(ua)) device = "iPad";
  else if (/iPhone|iPod/i.test(ua)) device = "iPhone";
  else if (/Android/i.test(ua)) device = "Android";
  else if (/Mobile|Phone/i.test(ua)) device = "HP";
  let browser = "Lainnya";
  if (/Instagram/i.test(ua)) browser = "Instagram";
  else if (/WhatsApp/i.test(ua)) browser = "WhatsApp";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua)) browser = "Safari";
  return { device, browser };
}

function sourceFrom(ref) {
  if (!ref) return "Langsung";
  try {
    const h = new URL(ref).hostname.toLowerCase();
    if (h.includes("instagram.com")) return "Instagram";
    if (h.includes("facebook.com")) return "Facebook";
    if (h.includes("tiktok.com")) return "TikTok";
    if (h.includes("google.")) return "Google";
    if (h.includes("github.io") || h.includes("github.com")) return "GitHub";
    return h;
  } catch {
    return "Langsung";
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://muchammadleonardtaufikputra-bot.github.io",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Vary": "Origin",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", ...corsHeaders() },
  });
}

async function getJSON(env, key, fallback) {
  try {
    return JSON.parse((await env.ORNIVALIS_STATS.get(key)) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

async function pushLog(env, entry) {
  const log = await getJSON(env, "log", []);
  log.unshift(entry);
  await env.ORNIVALIS_STATS.put("log", JSON.stringify(log.slice(0, MAX_LOG)));
}

async function handleTrack(req, env) {
  try {
    await req.json();
  } catch {
    // body boleh kosong — kunjungan tetap dicatat
  }
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  const hash = (await sha256Hex(ip + "|" + dayStr(new Date()))).slice(0, 16);
  const cf = req.cf || {};
  const ua = req.headers.get("User-Agent") || "";
  const { device, browser } = parseUA(ua);
  const source = sourceFrom(req.headers.get("Referer") || "");
  const entry = {
    t: Date.now(),
    country: cf.country || "-",
    city: cf.city || "-",
    device,
    browser,
    source,
  };

  // Abaikan kalau hash yang sama sudah tercatat < 10 menit.
  const seenKey = "seen:" + hash;
  if (await env.ORNIVALIS_STATS.get(seenKey)) return json({ ok: true, counted: false });
  await env.ORNIVALIS_STATS.put(seenKey, "1", { expirationTtl: DEDUPE_TTL });

  const total = (parseInt((await env.ORNIVALIS_STATS.get("total")) || "0", 10) || 0) + 1;
  await env.ORNIVALIS_STATS.put("total", String(total));

  const dk = "d:" + dayStr(new Date());
  const day = await getJSON(env, dk, { views: 0, uniques: [] });
  day.views += 1;
  if (!day.uniques.includes(hash)) day.uniques.push(hash);
  await env.ORNIVALIS_STATS.put(dk, JSON.stringify(day), { expirationTtl: 60 * 60 * 24 * 40 });

  await pushLog(env, entry);
  return json({ ok: true, counted: true, total });
}

async function handleCount(env) {
  const total = parseInt((await env.ORNIVALIS_STATS.get("total")) || "0", 10) || 0;
  const day = await getJSON(env, "d:" + dayStr(new Date()), { views: 0, uniques: [] });
  return json({ total, today: day.views, todayUniques: day.uniques.length });
}

async function handlePostMessage(req, env) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (name.length < 2 || name.length > 50) {
    return json({ error: "Nama wajib diisi (2-50 karakter)." }, 400);
  }
  if (message.length < 1 || message.length > 500) {
    return json({ error: "Pesan wajib diisi (maksimal 500 karakter)." }, 400);
  }

  // Cooldown anti-spam: 1 pesan per menit per pengunjung (berdasar hash IP).
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  const hash = (await sha256Hex(ip + "|msg")).slice(0, 16);
  const coolKey = "msgseen:" + hash;
  if (await env.ORNIVALIS_STATS.get(coolKey)) {
    return json({ error: "Tunggu sebentar sebelum mengirim pesan lagi." }, 429);
  }
  await env.ORNIVALIS_STATS.put(coolKey, "1", { expirationTtl: MSG_COOLDOWN_TTL });

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const entry = { id, name, message, t: Date.now() };
  const messages = await getJSON(env, "messages", []);
  messages.unshift(entry);
  await env.ORNIVALIS_STATS.put("messages", JSON.stringify(messages.slice(0, MAX_MESSAGES)));
  return json({ ok: true, id });
}

async function handleGetMessages(env) {
  const messages = await getJSON(env, "messages", []);
  return json({ messages: messages.slice(0, 50) });
}

async function handleDeleteMessage(req, env) {
  const url = new URL(req.url);
  const key = req.headers.get("X-Admin-Key") || url.searchParams.get("key") || "";
  if (!env.ORNIVALIS_STATS_PASSWORD || key !== env.ORNIVALIS_STATS_PASSWORD) {
    return json({ error: "unauthorized" }, 401);
  }
  const id = url.searchParams.get("id") || "";
  if (!id) return json({ error: "missing_id" }, 400);
  const messages = await getJSON(env, "messages", []);
  const kept = messages.filter((m) => m.id !== id);
  if (kept.length === messages.length) return json({ error: "not_found" }, 404);
  await env.ORNIVALIS_STATS.put("messages", JSON.stringify(kept));
  return json({ ok: true, removed: 1 });
}

async function handleStats(req, env) {
  const url = new URL(req.url);
  const key = req.headers.get("X-Admin-Key") || url.searchParams.get("key") || "";
  if (!env.ORNIVALIS_STATS_PASSWORD || key !== env.ORNIVALIS_STATS_PASSWORD) {
    return json({ error: "unauthorized" }, 401);
  }
  const total = parseInt((await env.ORNIVALIS_STATS.get("total")) || "0", 10) || 0;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 86400000);
    const v = await getJSON(env, "d:" + dayStr(d), { views: 0, uniques: [] });
    days.push({ date: dayStr(d), views: v.views, uniques: v.uniques.length });
  }
  const log = await getJSON(env, "log", []);
  const messages = await getJSON(env, "messages", []);
  return json({ total, days, recent: log.slice(0, 50), messagesTotal: messages.length, messages: messages.slice(0, 50) });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
    if (url.pathname === "/track" && req.method === "POST") return handleTrack(req, env);
    if (url.pathname === "/count") return handleCount(env);
    if (url.pathname === "/messages" && req.method === "POST") return handlePostMessage(req, env);
    if (url.pathname === "/messages" && req.method === "GET") return handleGetMessages(env);
    if (url.pathname === "/messages" && req.method === "DELETE") return handleDeleteMessage(req, env);
    if (url.pathname === "/stats") return handleStats(req, env);
    return json({
      ok: true,
      service: "ornivalis-stats",
      endpoints: [
        "POST /track",
        "GET /count",
        "POST /messages",
        "GET /messages",
        "DELETE /messages?id=...&key=...",
        "GET /stats?key=...",
      ],
    });
  },
};
