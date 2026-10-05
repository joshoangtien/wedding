/* =========================================================
   SERVER THIỆP CƯỚI
   - Phục vụ trang web tĩnh (index.html, style.css, script.js, images/, music.mp3)
   - Sổ lưu bút: ghi lời chúc vào data/wishes.txt và đọc ra cho trang
   Chạy:  node server.js   (mặc định cổng 5700, đổi bằng biến PORT)
   Không cần cài thêm thư viện nào.
   ========================================================= */
const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const PORT = Number(process.env.PORT) || 5700;
const HOST = process.env.HOST || "0.0.0.0"; // để 127.0.0.1 nếu chỉ cho Nginx truy cập
const IS_PROD = process.env.NODE_ENV === "production";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const WISH_FILE = path.join(DATA_DIR, "wishes.txt");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg",
  ".woff2": "font/woff2",
};

// Những file/thư mục không cho tải trực tiếp từ trình duyệt
const BLOCKED = new Set(["data", "logs", "deploy", "node_modules", "server.js", "package.json", "ecosystem.config.js", "deploy.sh", "DEPLOY.md"]);

/* ---------------- File lời chúc ----------------
   Mỗi dòng 1 lời chúc, các cột ngăn cách bằng " | ":
   thời gian | họ tên | tham dự | số người | lời chúc
   Dòng bắt đầu bằng # là ghi chú. Muốn ẩn lời chúc nào thì xoá dòng đó. */
const HEADER =
  "# SỔ LƯU BÚT — mỗi dòng 1 lời chúc\n" +
  "# thời gian | họ tên | tham dự | số người | lời chúc\n" +
  "# Muốn ẩn lời chúc nào thì xoá dòng đó rồi lưu file.\n";

async function ensureFile() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  if (!fs.existsSync(WISH_FILE)) await fsp.writeFile(WISH_FILE, HEADER, "utf8");
}

// Bỏ xuống dòng và ký tự "|" để không làm vỡ định dạng file
const clean = (s, max) =>
  String(s ?? "").replace(/[\r\n\t]+/g, " ").replace(/\|/g, "/").replace(/\s{2,}/g, " ").trim().slice(0, max);

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function readWishes() {
  await ensureFile();
  const text = await fsp.readFile(WISH_FILE, "utf8");
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const [time, name, attend, guests, ...rest] = l.split(" | ");
      return { time, name, attend, guests, text: rest.join(" | ") };
    })
    .filter((w) => w.name && w.text)
    .reverse(); // mới nhất lên đầu
}

// Chống spam đơn giản: mỗi IP tối đa 1 lời chúc / 15 giây
const lastPost = new Map();

/* ---------------- Tiện ích HTTP ---------------- */
function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": TYPES[".json"], "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

function readBody(req, limit = 4096) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new Error("too large")); req.destroy(); }
      else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === "/") rel = "/index.html";
  const file = path.normalize(path.join(ROOT, rel));
  const first = path.relative(ROOT, file).split(path.sep)[0];

  if (!file.startsWith(ROOT + path.sep) || first.startsWith(".") || BLOCKED.has(first)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const stat = await fsp.stat(file);
    if (!stat.isFile()) throw new Error("not file");
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": IS_PROD && /\.(jpe?g|png|webp|gif|svg|mp3|m4a|ogg|woff2|ico)$/i.test(file) ? "public, max-age=604800" : "no-cache",
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Không tìm thấy");
  }
}

/* ---------------- Router ---------------- */
const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split("?")[0];

  try {
    if (urlPath === "/api/wishes" && req.method === "GET") {
      const wishes = await readWishes();
      // Chỉ trả tên + lời chúc + thời gian, không lộ thông tin tham dự
      return sendJSON(res, 200, wishes.map(({ time, name, text }) => ({ time, name, text })));
    }

    if (urlPath === "/api/wishes" && req.method === "POST") {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;
      const now = Date.now();
      if (now - (lastPost.get(ip) || 0) < 15000) {
        return sendJSON(res, 429, { error: "Bạn gửi nhanh quá, đợi vài giây rồi thử lại nhé." });
      }

      let body;
      try { body = JSON.parse(await readBody(req)); }
      catch { return sendJSON(res, 400, { error: "Dữ liệu không hợp lệ." }); }

      const name = clean(body.name, 60);
      const attend = body.attend === "no" ? "Không thể đến" : "Sẽ đến dự";
      const guests = clean(body.guests, 20) || "1 người";
      const text =
        clean(body.message, 300) ||
        (body.attend === "no" ? "Tiếc quá không đến được, chúc hai bạn thật hạnh phúc!" : "Mình sẽ đến chung vui cùng hai bạn!");

      if (!name) return sendJSON(res, 400, { error: "Vui lòng nhập họ tên." });

      await ensureFile();
      const time = stamp();
      await fsp.appendFile(WISH_FILE, `${time} | ${name} | ${attend} | ${guests} | ${text}\n`, "utf8");
      lastPost.set(ip, now);
      console.log(`[Lời chúc] ${name}: ${text}`);
      return sendJSON(res, 201, { time, name, text });
    }

    if (urlPath.startsWith("/api/")) return sendJSON(res, 404, { error: "Not found" });
    if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405).end();

    await serveStatic(req, res, urlPath);
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: "Lỗi máy chủ, thử lại sau nhé." });
  }
});

// Báo lỗi rõ ràng khi không mở được cổng (bị chiếm, không có quyền...)
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") console.error(`[LỖI] Cổng ${PORT} đang bị chương trình khác dùng. Kiểm tra: sudo ss -ltnp | grep :${PORT}`);
  else if (err.code === "EACCES") console.error(`[LỖI] Không có quyền mở cổng ${PORT}.`);
  else console.error("[LỖI] Server:", err);
  process.exit(1);
});

ensureFile()
  .then(() => {
    server.listen(PORT, HOST, () => {
      console.log(`Thiệp cưới đang chạy tại: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
      console.log(`Lời chúc được lưu ở: ${WISH_FILE}`);
      if (process.send) process.send("ready"); // báo cho pm2 biết app đã sẵn sàng
    });
  })
  .catch((err) => {
    console.error(`[LỖI] Không tạo/ghi được ${WISH_FILE}:`, err.code || err);
    if (err.code === "EACCES") console.error(`      Thư mục data/ không có quyền ghi. Sửa: sudo chown -R $(whoami) ${DATA_DIR}`);
    process.exit(1);
  });

// Tắt êm khi pm2 restart/stop để không cắt ngang lúc đang ghi file
function shutdown(signal) {
  console.log(`Nhận ${signal}, đang tắt server...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
