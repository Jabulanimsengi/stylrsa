const { spawnSync } = require('node:child_process');

const extraArgs = process.argv.slice(2);
const result = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'test:e2e', '--', '--runInBand', ...extraArgs],
  {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      RUN_DB_E2E: 'true',
    },
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
