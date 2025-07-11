import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const publicPaths = ['/', '/login', '/register'];
  const { pathname } = request.nextUrl;

  // Allow public and static files
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Call backend to check token validity
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/check_token_valid`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.valid) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 