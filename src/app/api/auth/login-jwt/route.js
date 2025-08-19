import { NextRequest, NextResponse } from 'next/server';
import { encode, decode } from "next-auth/jwt";

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

    // 檢測當前環境
    const isSecure = process.env.NODE_ENV === 'production' || 
                    request.url.startsWith('https://');
    
    // 創建 response
    const response = NextResponse.json({ 
      success: true, 
      user: decoded, 
      sessionToken,
      redirectUrl 
    });

    // 設置主要的 session cookie
    response.cookies.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    // 設置備用 cookie for 跨域
    response.cookies.set('next-auth.session-backup', sessionToken, {
      httpOnly: false,
      path: '/',
      secure: isSecure,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 30
    });

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
