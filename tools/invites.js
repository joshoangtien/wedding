#!/usr/bin/env node
/* =========================================================
   QUẢN LÝ KHÁCH MỜI
   npm run links                              → in tất cả link (theo nhóm + từng khách)
   npm run add -- "Chú Ba & gia đình" nha-trai → thêm khách, in link riêng
   npm run remove -- chu-ba-a7k               → xoá khách
   npm run report                             → thống kê xác nhận tham dự
   ========================================================= */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "config", "invites.json");
const WISHES = path.join(ROOT, "data", "wishes.txt");

const load = () => JSON.parse(fs.readFileSync(CONFIG, "utf8"));
const save = (cfg) => fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + "\n", "utf8");
const base = (cfg) => (cfg.baseUrl || "http://localhost:5700").replace(/\/$/, "");

function slugify(s) {
  return s
    .split("&")[0] // "Chú Ba & gia đình" → "chu-ba"
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-").slice(0, 3).join("-")
    .slice(0, 24) || "khach";
}

function uniqueCode(cfg, name) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let code;
  do {
    const tail = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    code = `${slugify(name)}-${tail}`;
  } while (cfg.guests?.[code] || cfg.groups?.[code]);
  return code;
}

function eventSummary(cfg, keys) {
  return keys.map((k) => {
    const e = cfg.events[k];
    return e ? `${e.title} ${e.time} ${e.date.split("-").reverse().join("/")}` : `(thiếu sự kiện "${k}")`;
  }).join(", ");
}

const [cmd, ...args] = process.argv.slice(2);
const cfg = load();

if (cmd === "links" || !cmd) {
  console.log("\n=== LINK THEO NHÓM (gửi chung, không ghi tên) ===");
  for (const [key, g] of Object.entries(cfg.groups)) {
    const url = key === cfg.defaultGroup ? `${base(cfg)}/` : `${base(cfg)}/${key}`;
    console.log(`\n• ${g.label || key}${key === cfg.defaultGroup ? " (mặc định)" : ""}\n  ${url}\n  Sự kiện: ${eventSummary(cfg, g.events)}`);
  }
  const guests = Object.entries(cfg.guests || {});
  console.log(`\n=== LINK TỪNG KHÁCH (ghi tên riêng) — ${guests.length} khách ===`);
  for (const [code, g] of guests) {
    const group = cfg.groups[g.group];
    if (!group) console.log(`\n[!] ${g.name}: nhóm "${g.group}" không tồn tại`);
    else console.log(`\n• ${g.name}  [${group.label || g.group}]\n  ${base(cfg)}/${code}`);
  }
  console.log();
} else if (cmd === "add") {
  const [name, group] = args;
  if (!name || !group) {
    console.error('Cách dùng: npm run add -- "Tên khách" <mã-nhóm>');
    console.error("Các nhóm hiện có: " + Object.keys(cfg.groups).join(", "));
    process.exit(1);
  }
  if (!cfg.groups[group]) {
    console.error(`Không có nhóm "${group}". Các nhóm: ${Object.keys(cfg.groups).join(", ")}`);
    process.exit(1);
  }
  const code = uniqueCode(cfg, name);
  cfg.guests = cfg.guests || {};
  cfg.guests[code] = { name, group };
  save(cfg);
  console.log(`\nĐã thêm: ${name} [${cfg.groups[group].label || group}]`);
  console.log(`Sự kiện: ${eventSummary(cfg, cfg.groups[group].events)}`);
  console.log(`Link:    ${base(cfg)}/${code}\n`);
} else if (cmd === "remove") {
  const [code] = args;
  if (!cfg.guests?.[code]) {
    console.error(`Không tìm thấy khách có mã "${code}"`);
    process.exit(1);
  }
  const { name } = cfg.guests[code];
  delete cfg.guests[code];
  save(cfg);
  console.log(`Đã xoá: ${name} (${code})`);
} else if (cmd === "report") {
  if (!fs.existsSync(WISHES)) {
    console.log("Chưa có xác nhận nào.");
    process.exit(0);
  }
  const rows = fs.readFileSync(WISHES, "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
  const stats = {};
  for (const line of rows) {
    const cols = line.split(" | ");
    const group = cols.length >= 6 ? cols[4].split(" · ")[0] : "Không rõ nhóm";
    const coming = cols[2] === "Sẽ đến dự";
    const people = parseInt(cols[3], 10) || 1;
    const s = (stats[group] ||= { replies: 0, coming: 0, people: 0, no: 0, names: [] });
    s.replies++;
    if (coming) { s.coming++; s.people += people; s.names.push(`${cols[1]} (${people})`); }
    else s.no++;
  }
  let total = 0;
  console.log("\n=== THỐNG KÊ XÁC NHẬN THAM DỰ ===");
  for (const [group, s] of Object.entries(stats)) {
    total += s.people;
    console.log(`\n• ${group}: ${s.replies} phản hồi — ${s.coming} sẽ đến (~${s.people} người), ${s.no} không đến`);
    if (s.names.length) console.log("  " + s.names.join(", "));
  }
  console.log(`\nTỔNG DỰ KIẾN: ~${total} người  (mục "4 người trở lên" tính là 4)\n`);
} else {
  console.error(`Lệnh không hợp lệ: ${cmd}. Dùng: links | add | remove | report`);
  process.exit(1);
}
