const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const appRoot = path.resolve(__dirname, '..');
const standaloneRoot = path.join(appRoot, '.next', 'standalone');
const standaloneServer = path.join(standaloneRoot, 'server.js');

function ensureExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    console.error(`Missing ${label}: ${targetPath}`);
    process.exit(1);
  }
}

function copyRecursive(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function syncStandaloneAssets() {
  const publicSource = path.join(appRoot, 'public');
  const publicDestination = path.join(standaloneRoot, 'public');
  const staticSource = path.join(appRoot, '.next', 'static');
  const staticDestination = path.join(standaloneRoot, '.next', 'static');

  ensureExists(standaloneRoot, 'standalone build');
  ensureExists(standaloneServer, 'standalone server');
  ensureExists(publicSource, 'public assets');
  ensureExists(staticSource, 'Next static assets');

  copyRecursive(publicSource, publicDestination);
  copyRecursive(staticSource, staticDestination);
}

function startStandaloneServer() {
  const env = {
    ...process.env,
    HOSTNAME: process.env.LOCAL_PREVIEW_HOSTNAME || '127.0.0.1',
  };

  const child = spawn(process.execPath, [standaloneServer], {
    cwd: standaloneRoot,
    stdio: 'inherit',
    env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

syncStandaloneAssets();
startStandaloneServer();
