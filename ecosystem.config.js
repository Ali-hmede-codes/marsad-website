module.exports = {
    apps: [{
        name: 'lebanon-breach-reporting',
        script: './backend/server.js',
        exec_mode: 'fork',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        combine_logs: true,
        merge_logs: true
    }]
};
