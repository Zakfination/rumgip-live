import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const h = response.headers;
  h.set('X-Content-Type-Options','nosniff');
  h.set('Referrer-Policy','strict-origin-when-cross-origin');
  h.set('X-Frame-Options','DENY');
  h.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  h.set('Content-Security-Policy', "default-src 'self'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; connect-src 'self' https://api.resend.com https://app.midtrans.com https://app.sandbox.midtrans.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
