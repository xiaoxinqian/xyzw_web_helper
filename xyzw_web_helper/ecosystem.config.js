module.exports = {
  apps: [{
    name: 'xyzw-web-helper',
    script: 'npm',
    args: 'run dev',
    cwd: '/workspace/xyzw_web_helper',
    interpreter: 'none',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: false,
    autorestart: true,
    restart_delay: 3000,
    max_restarts: 10,
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    time: true
  }]
};
