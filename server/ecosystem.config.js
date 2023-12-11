module.exports = {
  apps: [
    {
      name: 'nefrit-back',
      script: 'dist/main.js',
      // script : "node_modules/@nestjs/cli/bin/nest.js",
      // args: "start --watch",
      // instances: 'max',
      // exec_mode: 'cluster',
    },
  ],
};
