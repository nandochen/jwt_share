"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { encode } from "next-auth/jwt";
import { redirect } from "next/navigation";

export async function loginWithJWT(jwtString) {
  try {
    // 首先驗證來自 A domain 的 JWT
    const decoded = jwt.verify(jwtString, process.env.NEXTAUTH_SECRET);
    
    // 創建 next-auth session token for B domain
    const sessionToken = await encode({
      token: {
        sub: decoded.sub || decoded.id || decoded.userId,
        name: decoded.name,
        email: decoded.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
        ...decoded
      },
      secret: process.env.NEXTAUTH_SECRET,
    });

    // 設置 next-auth session cookie for B domain
    const cookieStore = cookies();
    
    // 檢測當前環境
    const isSecure = process.env.NODE_ENV === 'production' || 
                    (typeof window !== 'undefined' && window.location.protocol === 'https:') ||
                    process.env.NEXTAUTH_URL?.startsWith('https://');
    
    // 設置主要的 session cookie
    cookieStore.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: 'lax', // 同域使用 lax
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    // 如果是跨域情況，也設置一個備用的 cookie (non-httpOnly)
    cookieStore.set('next-auth.session-backup', sessionToken, {
      httpOnly: false,
      path: '/',
      secure: isSecure,
      sameSite: 'none', // 跨域使用 none
      maxAge: 60 * 60 * 24 * 30
    });

    console.log('Login successful for user:', decoded);
    return { success: true, user: decoded, sessionToken };
  } catch (err) {
    console.error('JWT verification error:', err);
    return { success: false, error: 'Invalid JWT: ' + err.message };
  }
}

// 新增一個專門處理跨域登入的函數
export async function crossDomainLogin(jwtString, redirectUrl = '/login-status') {
  const result = await loginWithJWT(jwtString);
  
  if (result.success) {
    redirect(redirectUrl);
  }
  
  return result;
}
