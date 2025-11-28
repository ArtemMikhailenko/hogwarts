import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware тепер тільки дозволяє проходження запитів
// Auth перевірка виконується на клієнті через AuthContext
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/home/:path*',
    '/modules/:path*',
    '/my-progress/:path*',
    '/favorites/:path*',
    '/login',
  ],
};
