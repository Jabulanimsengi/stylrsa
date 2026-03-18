const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const appRoot = path.resolve(__dirname, '..');
const standaloneRoot = path.join(appRoot, '.next', 'standalone');
const standaloneServer = path.join(standaloneRoot, 'server.js');
const nextBin = path.join(appRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const nextRoot = path.join(appRoot, '.next');
const standaloneNextRoot = path.join(standaloneRoot, '.next');
const REQUIRED_RUNTIME_MANIFESTS = [
  'app-build-manifest.json',
  'build-manifest.json',
  'prerender-manifest.json',
  'react-loadable-manifest.json',
  'routes-manifest.json',
  'middleware-manifest.json',
  'required-server-files.json',
  'app-path-routes-manifest.json',
];

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

function copyIfExists(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function hasStandaloneBuild() {
  return fs.existsSync(standaloneRoot) && fs.existsSync(standaloneServer);
}

function hasProductionManifests() {
  return REQUIRED_RUNTIME_MANIFESTS.some((file) => fs.existsSync(path.join(nextRoot, file)));
}

function syncRuntimeManifests() {
  for (const file of REQUIRED_RUNTIME_MANIFESTS) {
    copyIfExists(path.join(nextRoot, file), path.join(standaloneNextRoot, file));
  }

  copyIfExists(
    path.join(nextRoot, 'server', 'middleware-manifest.json'),
    path.join(standaloneNextRoot, 'server', 'middleware-manifest.json'),
  );
}

function syncStandaloneAssets() {
  const publicSource = path.join(appRoot, 'public');
  const publicDestination = path.join(standaloneRoot, 'public');
  const staticSource = path.join(nextRoot, 'static');
  const staticDestination = path.join(standaloneNextRoot, 'static');

  ensureExists(standaloneRoot, 'standalone build');
  ensureExists(standaloneServer, 'standalone server');
  ensureExists(publicSource, 'public assets');
  ensureExists(staticSource, 'Next static assets');

  copyRecursive(publicSource, publicDestination);
  copyRecursive(staticSource, staticDestination);
  syncRuntimeManifests();
}

function startDevServer() {
  const env = {
    ...process.env,
    PORT: process.env.PORT || '3001',
    HOSTNAME: process.env.LOCAL_PREVIEW_HOSTNAME || process.env.HOSTNAME || '127.0.0.1',
  };

  console.warn(
    'Standalone build artifacts are incomplete, so falling back to `next dev`. ' +
    'This avoids runtime manifest errors while we are still fixing issues before a build.',
  );

  const child = spawn(process.execPath, [nextBin, 'dev', '-p', env.PORT, '-H', env.HOSTNAME], {
    cwd: appRoot,
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

if (!hasStandaloneBuild() || !hasProductionManifests()) {
  startDevServer();
} else {
  syncStandaloneAssets();
  startStandaloneServer();
}
