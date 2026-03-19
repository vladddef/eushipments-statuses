module.exports = {
  apps: [
    {
      name: 'eushipments',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_file: '.env.local',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};