import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // CRITICAL SEO FIX: Redirect all /near-you/ URLs to /location/ equivalents
  // This prevents URL cannibalization and consolidates ranking power
  
  // Salon redirects: /salons/near-you/{province} → /salons/location/{province}
  const salonProvinceMatch = pathname.match(/^\/salons\/near-you\/([^\/]+)$/);
  if (salonProvinceMatch) {
    const province = salonProvinceMatch[1];
    const newUrl = new URL(`/salons/location/${province}`, request.url);
    newUrl.search = request.nextUrl.search; // Preserve query params
    return NextResponse.redirect(newUrl, 301);
  }
  
  // Salon redirects: /salons/near-you/{province}/{city} → /salons/location/{province}/{city}
  const salonCityMatch = pathname.match(/^\/salons\/near-you\/([^\/]+)\/([^\/]+)$/);
  if (salonCityMatch) {
    const province = salonCityMatch[1];
    const city = salonCityMatch[2];
    const newUrl = new URL(`/salons/location/${province}/${city}`, request.url);
    newUrl.search = request.nextUrl.search; // Preserve query params
    return NextResponse.redirect(newUrl, 301);
  }
  
  // Service redirects: /services/{category}/near-you/{province} → /services/{category}/location/{province}
  const serviceProvinceMatch = pathname.match(/^\/services\/([^\/]+)\/near-you\/([^\/]+)$/);
  if (serviceProvinceMatch) {
    const category = serviceProvinceMatch[1];
    const province = serviceProvinceMatch[2];
    const newUrl = new URL(`/services/${category}/location/${province}`, request.url);
    newUrl.search = request.nextUrl.search; // Preserve query params
    return NextResponse.redirect(newUrl, 301);
  }
  
  // Service redirects: /services/{category}/near-you/{province}/{city} → /services/{category}/location/{province}/{city}
  const serviceCityMatch = pathname.match(/^\/services\/([^\/]+)\/near-you\/([^\/]+)\/([^\/]+)$/);
  if (serviceCityMatch) {
    const category = serviceCityMatch[1];
    const province = serviceCityMatch[2];
    const city = serviceCityMatch[3];
    const newUrl = new URL(`/services/${category}/location/${province}/${city}`, request.url);
    newUrl.search = request.nextUrl.search; // Preserve query params
    return NextResponse.redirect(newUrl, 301);
  }
  
  // Service redirects: /services/{category}/near-you → /services/{category} (no direct location equivalent)
  // Note: This redirects to the category page since there's no province-level /location/ page without a province
  const serviceCategoryMatch = pathname.match(/^\/services\/([^\/]+)\/near-you$/);
  if (serviceCategoryMatch) {
    const category = serviceCategoryMatch[1];
    const newUrl = new URL(`/services/${category}`, request.url);
    newUrl.search = request.nextUrl.search; // Preserve query params
    return NextResponse.redirect(newUrl, 301);
  }
  
  // WWW redirect is handled by the production edge or reverse proxy layer.
  // Avoid duplicating it here to prevent redirect loops.
  
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt)$).*)',
  ],
};
