/* =========================================================
   CẤU HÌNH — sửa ngày giờ cưới ở đây
   ========================================================= */
const WEDDING_DATE = new Date("2026-10-18T11:00:00+07:00");

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);

/* =========================================================
   BỘ MINH HOẠ SEN (SVG)
   ========================================================= */
// Gradient dùng chung cho mọi hình vẽ
document.body.insertAdjacentHTML(
  "afterbegin",
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="gpb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d9e6d3"/><stop offset=".45" stop-color="#f5f7ef"/><stop offset="1" stop-color="#f0d8d9"/></linearGradient>
    <linearGradient id="gpm" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e3ede0"/><stop offset=".5" stop-color="#fbfbf6"/><stop offset="1" stop-color="#f3dfdf"/></linearGradient>
    <linearGradient id="gpf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ecf3e8"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#f6e6e5"/></linearGradient>
    <linearGradient id="gbud" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#dfe9d9"/><stop offset=".55" stop-color="#fbfaf4"/><stop offset="1" stop-color="#eccdd1"/></linearGradient>
    <radialGradient id="gl" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#a8c8a3"/><stop offset=".55" stop-color="#6e9b78"/><stop offset="1" stop-color="#3d6a53"/></radialGradient>
    <linearGradient id="glu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c5443"/><stop offset="1" stop-color="#4c7a5f"/></linearGradient>
    <linearGradient id="gpod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfd294"/><stop offset="1" stop-color="#6b976b"/></linearGradient>
  </defs></svg>`
);

const n1 = (v) => +v.toFixed(1);

// Đường cong mượt khép kín qua các điểm (Catmull-Rom → Bezier)
function smooth(pts) {
  const n = pts.length;
  let d = `M${n1(pts[0][0])},${n1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${n1(c1[0])},${n1(c1[1])} ${n1(c2[0])},${n1(c2[1])} ${n1(p2[0])},${n1(p2[1])}`;
  }
  return d + "Z";
}

const petalPath = (L, W) =>
  `M0,0 C${-W},${n1(-L * 0.35)} ${n1(-W * 0.62)},${n1(-L * 0.82)} 0,${-L} C${n1(W * 0.62)},${n1(-L * 0.82)} ${W},${n1(-L * 0.35)} 0,0Z`;

const place = (x, y, r = 0, s = 1) => `translate(${x},${y}) rotate(${r}) scale(${s})`;

/* Bông sen nở */
function flower({ x = 0, y = 0, s = 1, r = 0, delay = 0 } = {}) {
  const back = [[-84, 66, 23], [84, 66, 23], [-62, 84, 28], [62, 84, 28]];
  const mid = [[-38, 98, 31], [38, 98, 31]];
  const front = [[-19, 104, 30], [19, 104, 30], [0, 112, 30]];
  let i = 0;
  const petal = ([a, L, W], grad) => {
    const d = (delay + i++ * 0.07).toFixed(2);
    return `<g class="petal" style="--r:${a}deg;--d:${d}s">
      <path class="pe" d="${petalPath(L, W)}" fill="url(#${grad})"/>
      <path class="vein" d="M0,-4 Q${a > 0 ? 1.5 : -1.5},${n1(-L * 0.5)} 0,${n1(-L * 0.9)} M0,-6 Q${n1(-W * 0.4)},${n1(-L * 0.45)} ${n1(-W * 0.2)},${n1(-L * 0.8)} M0,-6 Q${n1(W * 0.4)},${n1(-L * 0.45)} ${n1(W * 0.2)},${n1(-L * 0.8)}"/>
    </g>`;
  };
  const stamens = Array.from({ length: 13 }, (_, k) => {
    const t = (k / 12 - 0.5) * 2.4;
    const x1 = n1(Math.sin(t) * 13), x2 = n1(Math.sin(t) * 19), y2 = n1(-15 - Math.cos(t) * 10);
    return `<path d="M${x1},-14 L${x2},${y2}" stroke="#d6c07a" stroke-width=".9"/><circle cx="${x2}" cy="${y2}" r="1.3" fill="#e0c46a"/>`;
  }).join("");
  const center = `<g class="grow c" style="--d:${(delay + 0.5).toFixed(2)}s">${stamens}
      <ellipse cx="0" cy="-14" rx="13" ry="4.5" fill="#d7e2ad" stroke="#9eb27a" stroke-width=".6"/></g>`;

  return `<g transform="${place(x, y, r, s)}">
    ${back.map((p) => petal(p, "gpb")).join("")}
    ${mid.map((p) => petal(p, "gpm")).join("")}
    ${center}
    ${front.map((p) => petal(p, "gpf")).join("")}
  </g>`;
}

/* Lá sen (nhìn nghiêng, mép gợn sóng, có gân) */
function leaf({ x = 0, y = 0, R = 100, r = 0, tilt = 0.42, delay = 0 } = {}) {
  const N = 44, pts = [];
  for (let k = 0; k < N; k++) {
    const t = (k / N) * Math.PI * 2;
    const w = 1 + 0.035 * Math.sin(t * 7 + R) + 0.02 * Math.sin(t * 13 + 1);
    pts.push([Math.cos(t) * R * w, Math.sin(t) * R * tilt * w]);
  }
  const c = [R * 0.05, R * tilt * 0.14];
  let veins = "";
  for (let k = 0; k < N; k += 3) {
    const [px, py] = pts[k];
    veins += `M${n1(c[0])},${n1(c[1])} Q${n1((c[0] + px) / 2 + py * 0.08)},${n1((c[1] + py) / 2)} ${n1(px * 0.93)},${n1(py * 0.93)} `;
  }
  return `<g transform="${place(x, y, r)}"><g class="grow c" style="--d:${delay}s">
    <path d="${smooth(pts.map(([a, b]) => [a * 0.97, b]))}" transform="translate(0,${n1(R * 0.09)})" fill="url(#glu)"/>
    <path d="${smooth(pts)}" fill="url(#gl)" stroke="#3a6650" stroke-opacity=".35" stroke-width=".8"/>
    <path class="leaf-vein" d="${veins}"/>
    <ellipse cx="${n1(c[0])}" cy="${n1(c[1])}" rx="${n1(R * 0.05)}" ry="${n1(R * 0.03)}" fill="#b7d3a8"/>
  </g></g>`;
}

/* Nụ sen */
function bud({ x = 0, y = 0, s = 1, r = 0, delay = 0 } = {}) {
  return `<g transform="${place(x, y, r, s)}"><g class="grow" style="--d:${delay}s">
    <path class="pe" d="M0,0 C-20,-12 -17,-52 0,-80 C17,-52 20,-12 0,0Z" fill="url(#gbud)"/>
    <path class="pe" d="M0,0 C-25,-12 -25,-44 -9,-66 C-12,-40 -8,-16 0,0Z" fill="url(#gpb)"/>
    <path class="pe" d="M0,0 C25,-12 25,-44 9,-66 C12,-40 8,-16 0,0Z" fill="url(#gpb)"/>
    <path class="vein" d="M0,-4 Q-2,-40 0,-74 M-14,-8 Q-17,-34 -9,-60 M14,-8 Q17,-34 9,-60"/>
    <path d="M-10,1 Q0,-10 10,1 Q0,6 -10,1Z" fill="#628d70"/>
  </g></g>`;
}

/* Đài sen */
function pod({ x = 0, y = 0, s = 1, r = 0, delay = 0 } = {}) {
  const holes = [[0, -35], [-9, -36.5], [9, -36.5], [-16, -33.5], [16, -33.5], [-6, -31], [6, -31], [0, -39], [-12, -38.5], [12, -38.5]]
    .map(([hx, hy]) => `<ellipse cx="${hx}" cy="${hy}" rx="2.3" ry="1.25" fill="#7a9656"/>`).join("");
  return `<g transform="${place(x, y, r, s)}"><g class="grow" style="--d:${delay}s">
    <path d="M-24,-34 C-22,-20 -8,-8 -3,0 L3,0 C8,-8 22,-20 24,-34Z" fill="url(#gpod)"/>
    <ellipse cx="0" cy="-34" rx="24" ry="8" fill="#d2dea8" stroke="#8ea671" stroke-width=".8"/>
    ${holes}
  </g></g>`;
}

/* Cuống sen (vẽ dần) */
const stem = (d, delay = 0) =>
  `<path class="stem" pathLength="1" style="--d:${delay}s" d="${d}"/><path class="stem hl" pathLength="1" style="--d:${delay}s" d="${d}"/>`;

const sway = (origin, dur, inner) => `<g class="sway" style="transform-origin:${origin};--sd:${dur}s">${inner}</g>`;

/* Cành sen lớn: hoa + nụ + đài + lá */
function branch() {
  const o = "70px 640px";
  return `<svg class="art" viewBox="0 0 420 640" aria-hidden="true">
    ${sway(o, 7, stem("M72,640 C100,560 220,500 288,456", 0) + leaf({ x: 290, y: 452, R: 104, r: -6, delay: 0.7 }))}
    ${sway(o, 6.2, stem("M74,640 C130,520 260,380 328,286", 0.1) + pod({ x: 328, y: 286, r: 32, delay: 0.9 }))}
    ${sway(o, 5.8, stem("M66,640 C50,480 60,330 82,212", 0.15) + bud({ x: 82, y: 212, s: 0.95, r: 6, delay: 1 }))}
    ${sway(o, 6.6, stem("M70,640 C80,500 150,380 180,252", 0.05) + flower({ x: 180, y: 252, s: 1.08, r: 12, delay: 1.1 }))}
    ${sway(o, 5.4, stem("M70,640 C80,600 110,570 130,550", 0.2) + leaf({ x: 132, y: 548, R: 58, r: 10, delay: 0.8 }))}
  </svg>`;
}

/* Nhánh sen nhỏ */
function sprig() {
  const o = "40px 300px";
  return `<svg class="art" viewBox="0 0 260 300" aria-hidden="true">
    ${sway(o, 6.5, stem("M42,300 C70,270 140,240 180,222", 0) + leaf({ x: 184, y: 218, R: 70, r: -4, delay: 0.5 }))}
    ${sway(o, 5.6, stem("M38,300 C30,240 32,190 44,150", 0.1) + bud({ x: 44, y: 150, s: 0.6, r: 4, delay: 0.8 }))}
    ${sway(o, 6, stem("M40,300 C50,230 90,170 112,128", 0.05) + flower({ x: 112, y: 128, s: 0.8, r: 14, delay: 0.9 }))}
  </svg>`;
}

/* Cảnh ao sen trong khung vòm */
function pond() {
  return `<svg class="art" viewBox="-150 -170 300 240" aria-hidden="true">
    <g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1">
      <ellipse cx="0" cy="48" rx="120" ry="12"/><ellipse cx="0" cy="48" rx="80" ry="7"/>
    </g>
    ${leaf({ x: -92, y: 40, R: 72, r: 6, delay: 0.3 })}
    ${leaf({ x: 96, y: 48, R: 80, r: -4, delay: 0.4 })}
    ${sway("-62px 50px", 5.5, stem("M-62,50 Q-66,30 -60,4", 0.2) + bud({ x: -60, y: 4, s: 0.7, r: -8, delay: 0.9 }))}
    ${sway("70px 50px", 6.2, stem("M70,50 Q74,34 70,14", 0.2) + pod({ x: 70, y: 14, s: 0.7, r: 14, delay: 0.9 }))}
    ${leaf({ x: 0, y: 58, R: 64, r: 0, delay: 0.5 })}
    ${flower({ x: 0, y: 46, s: 1.25, delay: 1 })}
  </svg>`;
}

/* Lá sen đơn (làm hình mờ nền) */
const leafSolo = () => `<svg class="art" viewBox="-130 -60 260 130" aria-hidden="true">${leaf({ R: 120 })}</svg>`;

/* Sen nét mảnh */
function lineLotus() {
  const paths = [
    "M0,0 C-10,-14 -10,-34 0,-48 C10,-34 10,-14 0,0",
    "M0,0 C-14,-6 -26,-20 -30,-38 C-16,-32 -6,-18 0,0",
    "M0,0 C14,-6 26,-20 30,-38 C16,-32 6,-18 0,0",
    "M0,0 C-18,0 -40,-8 -50,-22 C-34,-22 -14,-12 0,0",
    "M0,0 C18,0 40,-8 50,-22 C34,-22 14,-12 0,0",
    "M-46,8 Q-23,14 0,8 Q23,2 46,8",
  ];
  return `<svg class="art line-art" viewBox="-60 -56 120 72" aria-hidden="true">
    ${paths.map((d, k) => `<path pathLength="1" style="--n:${k}" d="${d}"/>`).join("")}
    <circle pathLength="1" style="--n:6" cx="-55" cy="8" r="1.4"/><circle pathLength="1" style="--n:6" cx="55" cy="8" r="1.4"/>
  </svg>`;
}

const ART = { branch, sprig, pond, leaf: leafSolo, line: lineLotus };
document.querySelectorAll("[data-art]").forEach((el) => {
  el.innerHTML = ART[el.dataset.art]();
});
document.querySelectorAll(".seal-art .art").forEach((a) => a.classList.add("bloom"));

/* =========================================================
   RÈM CỬA
   ========================================================= */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const curtain = document.getElementById("curtain");
const STRIPS = 8;
curtain.querySelectorAll(".drape").forEach((drape, side) => {
  for (let i = 0; i < STRIPS; i++) {
    const s = document.createElement("div");
    s.className = "strip";
    s.style.setProperty("--i", side ? STRIPS - i : i);
    drape.appendChild(s);
  }
});

let opened = false;
function openCurtain() {
  if (opened) return;
  opened = true;
  window.scrollTo(0, 0);
  playMusic();
  curtain.classList.add("opening");

  setTimeout(() => {
    curtain.classList.add("open");
    document.body.classList.add("revealed");
    petalBurst();
  }, 450);

  setTimeout(() => {
    document.querySelectorAll('[data-bloom-on="open"] .art').forEach((a) => a.classList.add("bloom"));
  }, 1200);

  setTimeout(() => curtain.classList.add("gone"), 2900);
  setTimeout(() => {
    curtain.remove();
    document.body.classList.remove("locked");
  }, 4400);
}
curtain.addEventListener("click", openCurtain);
curtain.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCurtain(); }
});

/* =========================================================
   CANVAS: CÁNH SEN RƠI + PHẤN HOA
   ========================================================= */
const fx = document.getElementById("fx");
const ctx = fx.getContext("2d");
let W = 0, H = 0;
function resizeFx() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  fx.width = W * dpr; fx.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeFx();
addEventListener("resize", resizeFx);

const mobile = innerWidth < 700;
const newPetal = (init) => {
  const vy = rand(0.35, 0.8);
  return {
    x: rand(-40, W + 40), y: init ? rand(-H, H) : rand(-80, -20),
    s: rand(6, 11), vx: rand(-0.15, 0.3), vy, fall: vy,
    rot: rand(0, 6.28), vr: rand(-0.012, 0.012),
    ph: rand(0, 6.28), vph: rand(0.01, 0.028), sw: rand(0.25, 0.8),
    burst: false,
  };
};
const petals = Array.from({ length: mobile ? 12 : 20 }, () => newPetal(true));
const motes = Array.from({ length: mobile ? 14 : 26 }, () => ({
  x: rand(0, W), y: rand(0, H), r: rand(0.8, 2), vy: rand(0.1, 0.3), ph: rand(0, 6.28), a: rand(0.25, 0.6),
}));

function drawPetal(p) {
  const s = p.s;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(0.3 + 0.7 * Math.abs(Math.cos(p.ph * 1.3)), 1); // lật cánh 3D
  const g = ctx.createLinearGradient(0, -s * 1.5, 0, s * 1.5);
  g.addColorStop(0, "#f5e3e3");
  g.addColorStop(0.35, "#ffffff");
  g.addColorStop(1, "#d6e6d5");
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.5);
  ctx.bezierCurveTo(s, -s * 0.8, s * 0.9, s, 0, s * 1.5);
  ctx.bezierCurveTo(-s * 0.9, s, -s, -s * 0.8, 0, -s * 1.5);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = "rgba(93,138,115,.4)";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.1);
  ctx.quadraticCurveTo(s * 0.12, 0, 0, s * 1.25);
  ctx.strokeStyle = "rgba(140,175,152,.4)";
  ctx.stroke();
  ctx.restore();
}

let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 16.67, 3);
  last = now;
  ctx.clearRect(0, 0, W, H);

  // Phấn hoa lấp lánh bay lên
  ctx.fillStyle = "#a9c7a8";
  for (const m of motes) {
    m.y -= m.vy * dt;
    m.ph += 0.02 * dt;
    m.x += Math.sin(m.ph) * 0.2;
    if (m.y < -5) { m.y = H + 5; m.x = rand(0, W); }
    ctx.globalAlpha = m.a * (0.55 + 0.45 * Math.sin(m.ph * 2));
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, 6.28);
    ctx.fill();
  }
  ctx.globalAlpha = 0.95;

  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    if (p.burst) {
      p.vx += -p.vx * 0.035 * dt;
      p.vy += (p.fall - p.vy) * 0.035 * dt;
    }
    p.ph += p.vph * dt;
    p.x += (p.vx + Math.sin(p.ph) * p.sw) * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    if (p.y > H + 40 || p.x < -80 || p.x > W + 80) {
      if (p.burst) petals.splice(i, 1);
      else Object.assign(p, newPetal(false));
      continue;
    }
    drawPetal(p);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(tick);
}
if (!reduceMotion) requestAnimationFrame(tick);

function petalBurst() {
  if (reduceMotion) return;
  for (let k = 0; k < (mobile ? 22 : 34); k++) {
    const a = rand(0, Math.PI * 2), sp = rand(3, 11);
    petals.push({
      ...newPetal(false),
      x: W / 2, y: H / 2,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, fall: rand(1.3, 2.2),
      vr: rand(-0.08, 0.08), vph: rand(0.04, 0.08), s: rand(7, 12),
      burst: true,
    });
  }
}

/* =========================================================
   NHẠC NỀN
   ========================================================= */
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
const MUSIC_VOLUME = 0.6;
let fadeTimer;

// Gọi trực tiếp trong sự kiện click để trình duyệt (kể cả iPhone) cho phép phát
function playMusic() {
  clearInterval(fadeTimer);
  bgm.volume = 0;
  const p = bgm.play();
  if (!p) return;
  p.then(() => {
    musicBtn.classList.add("playing");
    // Tăng âm lượng dần trong ~2.5 giây
    fadeTimer = setInterval(() => {
      bgm.volume = Math.min(MUSIC_VOLUME, bgm.volume + 0.03);
      if (bgm.volume >= MUSIC_VOLUME) clearInterval(fadeTimer);
    }, 120);
  }).catch(() => musicBtn.classList.remove("playing"));
}
function pauseMusic() {
  clearInterval(fadeTimer);
  bgm.pause();
  musicBtn.classList.remove("playing");
}
musicBtn.addEventListener("click", () => (bgm.paused ? playMusic() : pauseMusic()));

// Tạm dừng khi chuyển tab, phát lại khi quay về
let pausedByHide = false;
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !bgm.paused) { pausedByHide = true; pauseMusic(); }
  else if (!document.hidden && pausedByHide) { pausedByHide = false; playMusic(); }
});
// Chưa có file nhạc thì ẩn nút
const hideMusic = () => musicBtn.classList.add("hidden");
bgm.addEventListener("error", hideMusic);
if (bgm.error || bgm.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) hideMusic();

/* =========================================================
   HIỆN DẦN KHI CUỘN + SEN NỞ
   ========================================================= */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");
      if (el.matches("[data-art]")) el.querySelector(".art")?.classList.add("bloom");
      el.querySelectorAll(".art").forEach((a) => a.classList.add("bloom"));
      io.unobserve(el);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
document.querySelectorAll("[data-art]:not([data-bloom-on])").forEach((el) => {
  if (!el.closest(".reveal") && !el.closest("#curtain")) io.observe(el);
});

/* =========================================================
   ĐẾM NGƯỢC
   ========================================================= */
const cd = {};
document.querySelectorAll("[data-cd]").forEach((el) => (cd[el.dataset.cd] = el));
function updateCountdown() {
  const diff = Math.max(0, WEDDING_DATE - Date.now());
  const vals = {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
  for (const k in vals) {
    const txt = String(vals[k]).padStart(2, "0");
    if (cd[k].textContent !== txt) {
      cd[k].textContent = txt;
      cd[k].classList.remove("tick");
      void cd[k].offsetWidth;
      cd[k].classList.add("tick");
    }
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* =========================================================
   LỊCH
   ========================================================= */
(function buildCalendar() {
  const y = WEDDING_DATE.getFullYear(), m = WEDDING_DATE.getMonth(), day = WEDDING_DATE.getDate();
  const first = (new Date(y, m, 1).getDay() + 6) % 7; // Thứ 2 đầu tuần
  const days = new Date(y, m + 1, 0).getDate();
  let html = `<div class="cal-title">Tháng ${m + 1} · ${y}</div><div class="cal-grid">`;
  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach((d) => (html += `<span class="dow">${d}</span>`));
  for (let i = 0; i < first; i++) html += "<span></span>";
  for (let d = 1; d <= days; d++) html += `<span class="day${d === day ? " big" : ""}">${d}</span>`;
  document.getElementById("calendar").innerHTML = html + "</div>";
})();

/* =========================================================
   TOAST
   ========================================================= */
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* =========================================================
   SỔ LƯU BÚT + RSVP — đọc/ghi qua server vào data/wishes.txt
   ========================================================= */
const WISH_API = "/api/wishes";
const wishList = document.getElementById("wishList");
const rsvpForm = document.getElementById("rsvpForm");
let shownKeys = new Set();

const wishKey = (w) => `${w.time}|${w.name}|${w.text}`;

function wishItem({ name, text, time }, isNew = false) {
  const li = document.createElement("li");
  if (isNew) li.className = "new";
  const b = document.createElement("b");
  b.textContent = name;
  if (time) {
    const t = document.createElement("time");
    t.textContent = time.slice(8, 10) + "/" + time.slice(5, 7) + " · " + time.slice(11);
    b.appendChild(t);
  }
  const p = document.createElement("p");
  p.textContent = text;
  li.append(b, p);
  return li;
}

function showEmpty(msg) {
  wishList.innerHTML = "";
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = msg;
  wishList.appendChild(li);
}

// Tải danh sách lời chúc từ file; lần sau chỉ chèn thêm lời chúc mới
async function loadWishes() {
  try {
    const res = await fetch(WISH_API, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const wishes = await res.json();
    if (!wishes.length) {
      if (!shownKeys.size) showEmpty("Chưa có lời chúc nào. Hãy là người đầu tiên nhé!");
      return;
    }
    const fresh = wishes.filter((w) => !shownKeys.has(wishKey(w)));
    if (!fresh.length) return;
    const first = !shownKeys.size;
    if (first) wishList.innerHTML = "";
    // wishes đã sắp xếp mới nhất trước → chèn ngược để giữ đúng thứ tự
    [...fresh].reverse().forEach((w) => {
      shownKeys.add(wishKey(w));
      if (first) wishList.appendChild(wishItem(w));
      else wishList.prepend(wishItem(w, true));
    });
    if (first) wishList.replaceChildren(...[...wishList.children].reverse());
  } catch {
    if (!shownKeys.size) showEmpty("Không tải được lời chúc. Hãy mở thiệp qua server (node server.js).");
  }
}
loadWishes();
setInterval(() => { if (!document.hidden) loadWishes(); }, 20000); // cập nhật lời chúc mới mỗi 20 giây

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = rsvpForm.querySelector("button[type=submit]");
  const data = Object.fromEntries(new FormData(rsvpForm));
  btn.disabled = true;
  btn.textContent = "Đang gửi...";
  try {
    const res = await fetch(WISH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || "Gửi không thành công, thử lại nhé.");

    if (!shownKeys.size) wishList.innerHTML = "";
    shownKeys.add(wishKey(out));
    wishList.prepend(wishItem(out, true));
    wishList.scrollTop = 0;
    rsvpForm.reset();
    showToast("Cảm ơn bạn đã gửi lời chúc!");
  } catch (err) {
    showToast(err.message === "Failed to fetch" ? "Không kết nối được máy chủ" : err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Gửi lời chúc";
  }
});

/* =========================================================
   SAO CHÉP SỐ TÀI KHOẢN
   ========================================================= */
document.querySelectorAll(".copy").forEach((btn) =>
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      showToast("Đã sao chép số tài khoản");
    } catch {
      showToast(btn.dataset.copy);
    }
  })
);

/* =========================================================
   XEM ẢNH CƯỚI (LIGHTBOX)
   ========================================================= */
const lb = document.getElementById("lightbox");
const lbStage = lb.querySelector(".lb-stage");
const lbCount = lb.querySelector(".lb-count");
const lbThumbs = lb.querySelector(".lb-thumbs");
const shots = [...document.querySelectorAll(".gallery figure")];
let lbIndex = 0;
let lbLastFocus = null;
let lbHideTimer;

// Nội dung của ảnh thứ i: ảnh thật nếu có, nếu chưa có ảnh thì hiện hình vẽ sen
function shotContent(i, thumb = false) {
  const img = shots[i].querySelector("img");
  if (img) {
    const el = new Image();
    el.src = img.currentSrc || img.src;
    el.alt = img.alt || `Ảnh cưới ${i + 1}`;
    el.draggable = false;
    return el;
  }
  const ph = document.createElement("div");
  ph.className = "lb-placeholder";
  ph.innerHTML = thumb
    ? ART.line()
    : `${ART.pond()}<p>Ảnh ${i + 1}<small>Thêm file images/album-${i + 1}.jpg để hiển thị</small></p>`;
  ph.querySelectorAll(".art").forEach((a) => a.classList.add("bloom"));
  return ph;
}

function buildThumbs() {
  lbThumbs.innerHTML = "";
  shots.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lb-thumb";
    b.setAttribute("aria-label", `Ảnh ${i + 1}`);
    b.appendChild(shotContent(i, true));
    b.addEventListener("click", () => showShot(i, i > lbIndex ? 1 : -1));
    lbThumbs.appendChild(b);
  });
}

function showShot(i, dir = 0) {
  lbIndex = (i + shots.length) % shots.length;
  const old = lbStage.firstElementChild;
  const next = shotContent(lbIndex);
  next.classList.add("lb-item");
  lbStage.appendChild(next);

  const dx = dir * 60;
  next.animate(
    [{ opacity: 0, transform: `translateX(${dx}px) scale(${dir ? 1 : 0.92})` }, { opacity: 1, transform: "none" }],
    { duration: 550, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
  if (old) {
    old.animate([{ opacity: 1 }, { opacity: 0, transform: `translateX(${-dx}px) scale(.96)` }], { duration: 400, easing: "ease", fill: "forwards" })
      .onfinish = () => old.remove();
  }

  lbCount.textContent = `${lbIndex + 1} / ${shots.length}`;
  [...lbThumbs.children].forEach((t, k) => t.classList.toggle("active", k === lbIndex));
  lbThumbs.children[lbIndex]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
}

function openLightbox(i) {
  clearTimeout(lbHideTimer);
  lbLastFocus = document.activeElement;
  buildThumbs();
  lbStage.innerHTML = "";
  lb.hidden = false;
  requestAnimationFrame(() => lb.classList.add("show"));
  document.body.style.overflow = "hidden";
  showShot(i);
  lb.querySelector(".lb-close").focus({ preventScroll: true });
}

function closeLightbox() {
  lb.classList.remove("show");
  document.body.style.overflow = "";
  lbHideTimer = setTimeout(() => { lb.hidden = true; lbStage.innerHTML = ""; }, 400);
  lbLastFocus?.focus({ preventScroll: true });
}

shots.forEach((fig, i) => {
  fig.tabIndex = 0;
  fig.setAttribute("role", "button");
  fig.setAttribute("aria-label", `Xem ảnh ${i + 1}`);
  fig.addEventListener("click", () => openLightbox(i));
  fig.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
  });
});

lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
lb.querySelector(".lb-prev").addEventListener("click", () => showShot(lbIndex - 1, -1));
lb.querySelector(".lb-next").addEventListener("click", () => showShot(lbIndex + 1, 1));
lb.addEventListener("click", (e) => { if (e.target === lb || e.target === lbStage) closeLightbox(); });

document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowRight") showShot(lbIndex + 1, 1);
  else if (e.key === "ArrowLeft") showShot(lbIndex - 1, -1);
});

// Vuốt trái/phải trên điện thoại, vuốt xuống để đóng
let touchX = 0, touchY = 0;
lbStage.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
lbStage.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showShot(lbIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  else if (dy > 90) closeLightbox();
});
