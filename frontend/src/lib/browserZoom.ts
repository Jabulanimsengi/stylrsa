/**
 * Browser detection and zoom level utilities
 * Sets default zoom levels for desktop browsers when users log in
 */

export type BrowserType = 'chrome' | 'ie' | 'edge' | 'firefox' | 'safari' | 'other';

export interface BrowserInfo {
  type: BrowserType;
  isDesktop: boolean;
  isMobile: boolean;
}

/**
 * Detect the browser type
 */
export function detectBrowser(): BrowserType {
  if (typeof window === 'undefined') return 'other';

  const userAgent = navigator.userAgent.toLowerCase();

  // Internet Explorer (also includes Edge Legacy)
  if (userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) {
    return 'ie';
  }

  // Edge (Chromium-based)
  if (userAgent.indexOf('edg') !== -1) {
    return 'edge';
  }

  // Chrome (but not Edge)
  if (userAgent.indexOf('chrome') !== -1 && userAgent.indexOf('edg') === -1) {
    return 'chrome';
  }

  // Firefox
  if (userAgent.indexOf('firefox') !== -1) {
    return 'firefox';
  }

  // Safari (but not Chrome)
  if (userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1) {
    return 'safari';
  }

  return 'other';
}

/**
 * Detect if the device is desktop or mobile/tablet
 */
export function isDesktopDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check screen width (desktop typically >= 1024px)
  const isLargeScreen = window.innerWidth >= 1024;

  // Check for mobile user agents
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  // Check for touch capability (but not exclusively - some laptops have touch)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Desktop if: large screen AND (not mobile UA OR has touch but screen is large)
  return isLargeScreen && (!isMobileUA || (hasTouch && window.innerWidth >= 1280));
}

/**
 * Get browser information
 */
export function getBrowserInfo(): BrowserInfo {
  const type = detectBrowser();
  const isDesktop = isDesktopDevice();
  
  return {
    type,
    isDesktop,
    isMobile: !isDesktop,
  };
}

/**
 * Get the zoom level for a specific browser on desktop
 * Reduced zoom levels to ensure site fits properly on screen
 * Chrome: 75%
 * Internet Explorer: 70%
 * Others: 75%
 */
export function getZoomLevelForBrowser(browser: BrowserType): number {
  switch (browser) {
    case 'chrome':
      return 75;
    case 'ie':
      return 70;
    case 'edge':
      // Edge is Chromium-based, so use Chrome zoom
      return 75;
    case 'firefox':
    case 'safari':
    case 'other':
    default:
      return 75;
  }
}

/**
 * Apply zoom level to the document
 * Uses CSS zoom property for modern browsers, with fallbacks
 */
export function applyZoom(zoomLevel: number): void {
  if (typeof document === 'undefined') return;

  const zoomPercent = zoomLevel / 100;
  const browser = detectBrowser();
  
  // Remove any existing zoom styles
  const existingStyle = document.getElementById('desktop-zoom-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject style for zoom
  const style = document.createElement('style');
  style.id = 'desktop-zoom-style';
  
  // For Chrome, Edge, and Safari - use CSS zoom (well-supported)
  if (browser === 'chrome' || browser === 'edge' || browser === 'safari' || browser === 'other') {
    style.textContent = `
      html {
        zoom: ${zoomPercent} !important;
      }
    `;
  }
  // For Internet Explorer - use CSS zoom
  else if (browser === 'ie') {
    style.textContent = `
      html {
        zoom: ${zoomPercent} !important;
        -ms-zoom: ${zoomPercent} !important;
      }
    `;
  }
  // For Firefox - use transform scale (zoom not well supported)
  else if (browser === 'firefox') {
    style.textContent = `
      html {
        transform: scale(${zoomPercent}) !important;
        transform-origin: 0 0 !important;
        width: ${100 / zoomPercent}% !important;
        height: ${100 / zoomPercent}% !important;
      }
      body {
        width: ${100 / zoomPercent}% !important;
      }
    `;
  }
  
  document.head.appendChild(style);
  
  // Store zoom preference in localStorage
  try {
    localStorage.setItem('desktop-zoom-level', zoomLevel.toString());
    localStorage.setItem('desktop-zoom-applied', 'true');
    localStorage.setItem('desktop-zoom-browser', browser);
  } catch {
    // localStorage not available, continue
  }
}

/**
 * Remove zoom from the document
 */
export function removeZoom(): void {
  if (typeof document === 'undefined') return;

  const style = document.getElementById('desktop-zoom-style');
  if (style) {
    style.remove();
  }

  // Clear zoom preference
  try {
    localStorage.removeItem('desktop-zoom-level');
    localStorage.removeItem('desktop-zoom-applied');
  } catch {
    // localStorage not available, continue
  }
}

/**
 * Apply default zoom for desktop browsers
 * This ensures the site fits properly on screen for all desktop users
 */
export function applyDefaultZoomOnLogin(): void {
  if (typeof window === 'undefined') return;

  const browserInfo = getBrowserInfo();

  // Only apply zoom on desktop
  if (!browserInfo.isDesktop) {
    // Remove zoom if on mobile
    removeZoom();
    return;
  }

  // Check if zoom was already applied (to avoid re-applying unnecessarily)
  try {
    const zoomApplied = localStorage.getItem('desktop-zoom-applied');
    const storedBrowser = localStorage.getItem('desktop-zoom-browser');
    const storedLevel = localStorage.getItem('desktop-zoom-level');
    
    if (zoomApplied === 'true' && storedBrowser === browserInfo.type && storedLevel) {
      const zoomLevel = parseInt(storedLevel, 10);
      // Verify the zoom level is still appropriate for this browser
      const expectedLevel = getZoomLevelForBrowser(browserInfo.type);
      if (zoomLevel === expectedLevel) {
        // Verify zoom is actually applied in the DOM
        const existingStyle = document.getElementById('desktop-zoom-style');
        if (existingStyle) {
          return; // Zoom already applied, no need to re-apply
        }
      }
    }
  } catch {
    // localStorage not available, continue
  }

  // Get zoom level for the browser (first time or browser changed)
  const zoomLevel = getZoomLevelForBrowser(browserInfo.type);
  
  // Apply the zoom
  applyZoom(zoomLevel);
}

/**
 * Check if zoom should be applied (desktop only, regardless of auth status)
 * Updated to apply zoom for all desktop users to ensure proper screen fit
 */
export function shouldApplyZoom(): boolean {
  const browserInfo = getBrowserInfo();
  return browserInfo.isDesktop; // Apply zoom for all desktop users
}

