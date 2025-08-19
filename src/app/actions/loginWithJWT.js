"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { encode } from "next-auth/jwt";

export async function loginWithJWT(jwtString) {
  try {
    // 首先驗證 JWT
    const decoded = jwt.verify(jwtString, process.env.NEXTAUTH_SECRET);
    
    // 創建 next-auth session token
    const sessionToken = await encode({
      token: {
        sub: decoded.sub || decoded.id || decoded.userId,
        name: decoded.name,
        email: decoded.email,
        ...decoded
      },
      secret: process.env.NEXTAUTH_SECRET,
    });

    // 設置 next-auth session cookie
    const cookieStore = cookies();
    cookieStore.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return { success: true, user: decoded };
  } catch (err) {
    console.error('JWT verification error:', err);
    return { success: false, error: 'Invalid JWT' };
  }
}
