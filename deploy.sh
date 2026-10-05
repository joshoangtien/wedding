#!/usr/bin/env bash
# =========================================================
#  TRIỂN KHAI THIỆP CƯỚI BẰNG PM2
#  Dùng:  bash deploy.sh        (hoặc: npm run build)
#  Chạy lại bất cứ lúc nào để cập nhật — lời chúc trong data/ được giữ nguyên.
# =========================================================
set -euo pipefail
cd "$(dirname "$0")"

APP_NAME="thiep-cuoi"
GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; RESET="\033[0m"
step() { echo -e "${GREEN}==>${RESET} $1"; }
warn() { echo -e "${YELLOW}[!]${RESET} $1"; }
fail() { echo -e "${RED}[x]${RESET} $1"; exit 1; }

# 1. Kiểm tra Node.js
step "Kiểm tra Node.js"
command -v node >/dev/null 2>&1 || fail "Chưa cài Node.js (cần bản 18 trở lên)."
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 18 ] || fail "Node.js $(node -v) quá cũ, cần bản 18 trở lên."
echo "    Node $(node -v)"

# 2. Cài pm2 nếu chưa có
step "Kiểm tra pm2"
if ! command -v pm2 >/dev/null 2>&1; then
  warn "Chưa có pm2, đang cài..."
  npm install -g pm2 || fail "Cài pm2 thất bại (thử chạy lại với sudo)."
fi
echo "    pm2 $(pm2 -v)"

# 3. Kiểm tra mã nguồn
step "Kiểm tra mã nguồn"
for f in index.html style.css script.js server.js ecosystem.config.js; do
  [ -f "$f" ] || fail "Thiếu file $f"
done
node --check server.js
node --check script.js
echo "    OK"

# 4. Tạo thư mục dữ liệu + log (không ghi đè lời chúc cũ)
step "Chuẩn bị thư mục"
mkdir -p data logs images
[ -f data/wishes.txt ] && echo "    Giữ nguyên data/wishes.txt ($(grep -vc '^#' data/wishes.txt || true) lời chúc)"
[ -f music.mp3 ] || warn "Chưa có music.mp3 — nút nhạc sẽ tự ẩn."

# 5. Khởi động / tải lại app (không gián đoạn nếu đang chạy)
step "Khởi động $APP_NAME bằng pm2"
pm2 startOrReload ecosystem.config.js --env production --update-env
pm2 save >/dev/null

# 6. Kiểm tra app đã phản hồi
PORT=$(node -p 'require("./ecosystem.config.js").apps[0].env_production.PORT')
step "Kiểm tra http://127.0.0.1:$PORT"
OK=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fs "http://127.0.0.1:$PORT/api/wishes" >/dev/null 2>&1; then OK=1; break; fi
  sleep 1
done
if [ "$OK" = 1 ]; then
  echo -e "    ${GREEN}App đang chạy tốt.${RESET}"
else
  warn "App chưa phản hồi. Xem log: pm2 logs $APP_NAME"
fi

echo
pm2 status "$APP_NAME"
echo
echo -e "${GREEN}Xong!${RESET} Lời chúc lưu tại: $(pwd)/data/wishes.txt"
echo "Lần đầu triển khai, chạy thêm lệnh dưới để app tự bật lại khi server khởi động lại:"
echo "    pm2 startup   (rồi copy-paste lệnh nó in ra)"
