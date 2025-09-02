// Build shared lib into the layer directory as an npm-style package.
const { build } = require('esbuild');
const { mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

(async () => {
  const outdir = 'layer/nodejs/node_modules/@hil/lib';
  mkdirSync(outdir, { recursive: true });

  // Compile individual entry points so they can be imported directly:
  const entries = [
    'src/lib/ddb.ts',
    'src/lib/logger.ts',
    'src/lib/ordersRepo.ts',
    'src/lib/idempotency.ts',
    'src/lib/schemas.ts',
    'src/clients/stripe.ts',
    'src/clients/avalara.ts',
    'src/clients/salesforce.ts',
  ];

  await build({
    entryPoints: entries,
    outdir,
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['aws-sdk'],     // provided by Lambda
    sourcemap: false,
    splitting: false,
  });

  // Simple index that re-exports the common modules
  const index = `
    module.exports = {
      ddb: require('./ddb.cjs'),
      logger: require('./logger.cjs'),
      ordersRepo: require('./ordersRepo.cjs'),
      idempotency: require('./idempotency.cjs'),
      schemas: require('./schemas.cjs'),
      clients: {
        stripe: require('./clients/stripe.cjs'),
        avalara: require('./clients/avalara.cjs'),
        salesforce: require('./clients/salesforce.cjs'),
      }
    };
  `;
  writeFileSync(join(outdir, 'index.cjs'), index.trim() + '\n', 'utf8');

  // Minimal package.json so Node treats this as @hil/lib
  const pkg = {
    name: '@hil/lib',
    version: '0.0.1',
    main: 'index.cjs',
    type: 'commonjs'
  };
  writeFileSync(join(outdir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');

  console.log('Layer build complete:', outdir);
})();
