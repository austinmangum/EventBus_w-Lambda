const { spawnSync } = require('node:child_process');
const pairs = [
  ['src/handlers/validateInit.ts', 'dist/validateInit.cjs'],
  ['src/handlers/taxCalculate.ts', 'dist/taxCalculate.cjs'],
  ['src/handlers/paymentCapture.ts', 'dist/paymentCapture.cjs'],
  ['src/handlers/sfdcUpsert.ts', 'dist/sfdcUpsert.cjs'],
  ['src/handlers/successEmit.ts', 'dist/successEmit.cjs'],
];

for (const [inFile, outFile] of pairs) {
  const r = spawnSync('npm', ['run', 'build:one', '--', inFile, outFile], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status);
}
