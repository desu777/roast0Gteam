module.exports = {
  apps: [
    {
      name: 'deployer-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/deployer',
      env: {
        NODE_ENV: 'production',
        PORT: 3998
      }
    },
    {
      name: 'deployer-compiler',
      script: 'dist/server.js',
      cwd: '/var/www/deployer/compiler',
      env: {
        NODE_ENV: 'production',
        PORT: 3999
      }
    }
  ]
}; 