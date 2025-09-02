// Usage: npm run build:one -- src/handlers/validateInit.ts dist/validateInit.cjs
const { build } = require('esbuild');

(async () => {
  const [inFile, outFile] = process.argv.slice(2);
  if (!inFile || !outFile) {
    console.error('Usage: npm run build:one -- <inFile> <outFile>');
    process.exit(1);
  }
  await build({
    entryPoints: [inFile],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['aws-sdk'],  // provided by Lambda
    sourcemap: 'inline',    // easier debugging
    legalComments: 'none',
    logLevel: 'info',
  });
  // Ensure handler is exported (if your file uses `export const handler = ...` esbuild keeps it.)
  // Nothing else needed.
})();
