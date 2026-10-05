/* =========================================================
   CẤU HÌNH PM2
   Chạy:  pm2 start ecosystem.config.js --env production
   Đổi cổng/tên app ở đây nếu cần.
   ========================================================= */
module.exports = {
  apps: [
    {
      name: "thiep-cuoi",
      script: "server.js",
      cwd: __dirname,

      // Chỉ chạy 1 tiến trình: app ghi file wishes.txt nên không dùng cluster
      exec_mode: "fork",
      instances: 1,

      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      restart_delay: 3000,
      max_restarts: 20,
      min_uptime: "10s",

      // Đợi server báo "ready" rồi mới coi là đã chạy; tắt êm khi restart
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 6000,

      // Log
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      time: true,

      env: {
        NODE_ENV: "development",
        PORT: 3000,
        HOST: "0.0.0.0",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        // Nếu chạy sau Nginx thì để 127.0.0.1 cho an toàn; muốn truy cập thẳng IP:3000 thì đổi thành 0.0.0.0
        HOST: "127.0.0.1",
      },
    },
  ],
};
