import { redirect } from 'next/navigation';
import { encode, decode } from "next-auth/jwt";
import { cookies } from 'next/headers';

export default async function ServerCrossDomainAuth({ searchParams }) {
  const params = await searchParams;
  const token = params?.token;
  const redirectTo = params?.redirect || '/login-status';

  if (!token) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>錯誤</h2>
        <p>未提供 JWT token</p>
        <p>使用方式：<code>/auth/server-login?token=YOUR_JWT_TOKEN&redirect=/target-page</code></p>
      </div>
    );
  }

  try {
    // 使用 next-auth 內建的 decode 功能驗證來自 A domain 的 JWT
    const decoded = await decode({
      token: token,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!decoded) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>登入失敗</h2>
          <p>Invalid JWT token</p>
          <a href="/login-status">查看登入狀態</a>
        </div>
      );
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

    const apiBaseUrl = (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:3001'
      : 'https://jwt-share.vercel.app';

    const loginRsp = await fetch(`${apiBaseUrl}/api/auth/login-jwt?token=${encodeURIComponent(token)}`, {
      method: 'GET'
    });

    const result = await loginRsp.json();

    /*
    // 設置 next-auth session cookie for B domain
    const cookieStore = cookies();
    
    // 檢測當前環境
    const isSecure = process.env.NODE_ENV === 'production' || 
                    process.env.NEXTAUTH_URL?.startsWith('https://');
    
    // 設置主要的 session cookie
    cookieStore.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    console.log('Login successful for user:', decoded);
    */
    // 成功登入後直接轉向
    // redirect(redirectTo);
    
  } catch (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>登入過程發生錯誤</h2>
        <p>{error.message}</p>
        <a href="/login-status">查看登入狀態</a>
      </div>
    );
  }
}
