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
    
    // 對於 HTTPS 網站，需要設置 secure: true
    const isSecure = process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.startsWith('https://');
    
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax', // HTTPS 需要 sameSite: 'none'
      maxAge: 60 * 60 * 24 * 30 // 30 days
    };
    
    // 如果有指定 domain，加入 domain 設定
    if (process.env.NEXTAUTH_URL) {
      try {
        const url = new URL(process.env.NEXTAUTH_URL);
        if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
          cookieOptions.domain = url.hostname;
        }
      } catch (e) {
        // ignore domain parsing errors
      }
    }
    
    cookieStore.set('next-auth.session-token', sessionToken, cookieOptions);

    return { success: true, user: decoded };
  } catch (err) {
    console.error('JWT verification error:', err);
    return { success: false, error: 'Invalid JWT' };
  }
}
