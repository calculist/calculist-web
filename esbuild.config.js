const esbuild = require('esbuild');
const path = require('path');

const watch = process.argv.includes('--watch');

const config = {
  entryPoints: [
    'app/javascript/application.ts',
    'app/javascript/homepage.ts',
    'app/javascript/worker.ts',
  ],
  bundle: true,
  sourcemap: true,
  outdir: 'app/assets/builds',
  loader: {
    '.ts': 'ts',
  },
  // Mark Node.js built-ins as external (used by Electron desktop app code paths)
  external: ['fs', 'electron'],
  logLevel: 'info',
};

if (watch) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(config).catch(() => process.exit(1));
}
