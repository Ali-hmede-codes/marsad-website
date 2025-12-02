module.exports = {
    apps: [{
        name: 'lebanon-breach-reporting',
        script: 'backend/server.js',
        cwd: '/var/www/marsad-website',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        }
    }]
};
