module.exports = {
  apps: [
    {
      name: 'web-server',
      script: 'preview-server.cjs',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
