# Triển khai thiệp cưới lên server (pm2)

## Yêu cầu
- Server Linux (Ubuntu/Debian…) có **Node.js 18+**
- pm2 (script tự cài nếu chưa có)
- Nginx (tuỳ chọn, để trỏ tên miền + HTTPS)

## 1. Đưa code lên server
Copy cả thư mục `wedding/` lên server (git, scp, FileZilla… đều được), ví dụ vào `/var/www/wedding`.

Nhớ copy kèm:
- `music.mp3` — nhạc nền
- `images/` — `hero.jpg`, `groom.jpg`, `bride.jpg`, `album-1.jpg` … `album-6.jpg`, `qr-groom.png`, `qr-bride.png`

## 2. Build & chạy — chỉ 1 lệnh
```bash
cd /var/www/wedding
npm run build
```
Script `deploy.sh` sẽ tự: kiểm tra Node → cài pm2 nếu thiếu → cài thư viện (`npm ci`) → kiểm tra code → tạo `data/`, `logs/` → khởi động bằng pm2 → kiểm tra app đã chạy.

**Lần đầu tiên** chạy thêm để app tự bật lại khi server reboot:
```bash
pm2 startup      # rồi copy-paste lệnh nó in ra
pm2 save
```

## 3. Trỏ tên miền (Nginx + HTTPS)
```bash
# sửa tên miền trong deploy/nginx.conf trước
sudo cp deploy/nginx.conf /etc/nginx/sites-available/thiep-cuoi
sudo ln -s /etc/nginx/sites-available/thiep-cuoi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ten-mien-cua-ban.com
```

> Không dùng Nginx mà muốn vào thẳng `http://IP:5700`: mở `ecosystem.config.js`, đổi `HOST` trong `env_production` thành `"0.0.0.0"`, mở cổng 5700 trên firewall, rồi `npm run build` lại.

## 4. Cập nhật thiệp
Sửa file → upload đè lên server → chạy lại:
```bash
npm run build
```
pm2 reload không gián đoạn. **Lời chúc trong `data/wishes.txt` được giữ nguyên** — đừng upload đè thư mục `data/` từ máy bạn.

## Lệnh hay dùng
| Việc | Lệnh |
|---|---|
| Xem trạng thái | `npm run pm2:status` |
| Xem log | `npm run pm2:logs` |
| Khởi động lại | `npm run pm2:restart` |
| Dừng | `npm run pm2:stop` |
| Gỡ khỏi pm2 | `npm run pm2:delete` |

## Thiệp theo nhóm / từng khách
Cấu hình ở `config/invites.json` — sửa xong có hiệu lực ngay, không cần build lại.

- `events`: các sự kiện (lễ, tiệc) — ngày, giờ, địa điểm, link bản đồ, `side` là `trai`/`gai`
- `groups`: nhóm khách — mời những sự kiện nào (`events`), sự kiện chính để đếm ngược (`main`), thuộc bên nào (`side`), lời mời riêng (`message`, không bắt buộc)
- `guests`: từng khách — tên hiển thị + thuộc nhóm nào

Link gửi khách:
| Link | Hiển thị |
|---|---|
| `wedding.xenmeta.com/` | Thiệp chung (nhóm `defaultGroup`) |
| `wedding.xenmeta.com/nha-gai` | Thiệp nhà gái: tên cô dâu đứng trước, chỉ hiện sự kiện của nhóm |
| `wedding.xenmeta.com/chu-ba-a7k` | Thiệp ghi tên "Chú Ba & gia đình" trên rèm + lời mời |

```bash
npm run add -- "Chú Ba & gia đình" nha-trai   # thêm khách, in link riêng
npm run links                                  # in tất cả link để gửi Zalo/Messenger
npm run remove -- chu-ba-a7k                   # xoá khách
npm run report                                 # thống kê ai đến, bao nhiêu người, theo nhóm
```
Ảnh xem trước khi gửi link qua Zalo/Facebook:
- Link chung / link nhóm: `images/og.png`.
- Link khách có `name` trong `config/invites.json`: `images/og-invite.png` có tên khách viết ở giữa (font `fonts/LavishlyYours-Regular.ttf`), tự tạo khi Facebook/Zalo đọc link. Sửa tên thì ảnh cũng tự đổi.

## Sổ lưu bút
- File: `data/wishes.txt` — mỗi dòng: `thời gian | họ tên | tham dự | số người | nhóm khách | lời chúc`
- Ẩn lời chúc: xoá dòng đó, lưu file (không cần restart)
- Tải về máy: `scp user@server:/var/www/wedding/data/wishes.txt .`

## Đổi cổng
Sửa `PORT` trong `ecosystem.config.js` (và `proxy_pass` trong `deploy/nginx.conf` nếu dùng Nginx), rồi `npm run build`.
