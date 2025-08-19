import { NextRequest, NextResponse } from 'next/server';
import { encode, decode } from "next-auth/jwt";
import { authOptions } from "../[...nextauth]";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jwtString = searchParams.get('token');
    const redirectUrl = searchParams.get('redirect') || '/login-status';

    if (!jwtString) {
      return NextResponse.json({ success: false, error: 'JWT token is required' }, { status: 400 });
    }

    // 使用 next-auth 內建的 decode 功能驗證來自 A domain 的 JWT
    const decoded = await decode({
      token: jwtString,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid JWT token' }, { status: 401 });
    }
    
    // 創建符合 next-auth 格式的 session token
    const sessionToken = await encode({
      token: {
        // next-auth 標準欄位
        sub: decoded.sub || decoded.id || decoded.userId || decoded.email,
        name: decoded.name || decoded.username,
        email: decoded.email,
        picture: decoded.picture || decoded.avatar,
        
        // 時間戳
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
        
        // 保留原始 JWT 的所有資料
        ...decoded
      },
      secret: authOptions.secret || process.env.NEXTAUTH_SECRET,
    });

    // 檢測當前環境
    const isSecure = process.env.NODE_ENV === 'production' || 
                    request.url.startsWith('https://');
    
    // 創建 response
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: decoded.sub || decoded.id || decoded.userId || decoded.email,
        name: decoded.name || decoded.username,
        email: decoded.email,
        image: decoded.picture || decoded.avatar,
        ...decoded
      }, 
      redirectUrl 
    });

    // 設置 next-auth 標準的 session cookie
    response.cookies.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax', // 跨域時使用 none
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    // 如果是 HTTPS，設置額外的 secure cookie
    if (isSecure) {
      response.cookies.set('__Secure-next-auth.session-token', sessionToken, {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'none',
        maxAge: 60 * 60 * 24 * 30
      });
    }

    console.log('Login successful for user:', decoded);
    return response;

  } catch (err) {
    console.error('JWT verification error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid JWT: ' + err.message 
    }, { status: 400 });
  }
}
