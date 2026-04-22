const PWA_INSTALL_NEVER_SHOW_KEY = 'stylrsa-pwa-install-never-show';
const PWA_INSTALL_LOGIN_MARKER_KEY = 'stylrsa-pwa-install-login-marker';
const PWA_INSTALL_DISMISSED_LOGIN_MARKER_KEY = 'stylrsa-pwa-install-dismissed-login-marker';
const LEGACY_PWA_INSTALL_NEVER_SHOW_KEY = 'pwa-install-never-show';

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function getPwaNeverShowKey() {
  return PWA_INSTALL_NEVER_SHOW_KEY;
}

export function getPwaInstallLoginMarker() {
  if (!canUseStorage()) {
    return null;
  }

  return window.sessionStorage.getItem(PWA_INSTALL_LOGIN_MARKER_KEY);
}

export function getPwaDismissedLoginMarker() {
  if (!canUseStorage()) {
    return null;
  }

  return window.sessionStorage.getItem(PWA_INSTALL_DISMISSED_LOGIN_MARKER_KEY);
}

export function markPwaPromptEligibleForCurrentLogin() {
  if (!canUseStorage()) {
    return null;
  }

  const marker = `${Date.now()}`;
  window.sessionStorage.setItem(PWA_INSTALL_LOGIN_MARKER_KEY, marker);
  window.sessionStorage.removeItem(PWA_INSTALL_DISMISSED_LOGIN_MARKER_KEY);
  return marker;
}

export function dismissPwaPromptForCurrentLogin(marker: string | null) {
  if (!canUseStorage() || !marker) {
    return;
  }

  window.sessionStorage.setItem(PWA_INSTALL_DISMISSED_LOGIN_MARKER_KEY, marker);
}

export function setPwaNeverShowAgain() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PWA_INSTALL_NEVER_SHOW_KEY, 'true');
  window.localStorage.setItem(LEGACY_PWA_INSTALL_NEVER_SHOW_KEY, 'true');
}

export function shouldNeverShowPwaPrompt() {
  if (!canUseStorage()) {
    return false;
  }

  return (
    window.localStorage.getItem(PWA_INSTALL_NEVER_SHOW_KEY) === 'true' ||
    window.localStorage.getItem(LEGACY_PWA_INSTALL_NEVER_SHOW_KEY) === 'true'
  );
}
