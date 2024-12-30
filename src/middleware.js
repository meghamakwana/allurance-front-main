// src/middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.API_SECRET_KEY });
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/auth') || token) {
    return NextResponse.next();
  }
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [],
  // matcher: ['/profile', '/address', '/earnrefer', '/giftcard', '/savedpayment', '/coupons', '/notifications', '/wishlist', '/reviews'],
  // matcher: ['/earnrefer', '/giftcard', '/savedpayment', '/coupons', '/notifications', '/wishlist', '/reviews'],
}