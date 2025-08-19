import { redirect } from 'next/navigation';
import { encode, decode } from "next-auth/jwt";
import { cookies } from 'next/headers';
import { authOptions } from "../../api/auth/[...nextauth]";

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

    // 設置 next-auth session cookie for B domain
    const cookieStore = cookies();
    
    // 檢測當前環境
    const isSecure = process.env.NODE_ENV === 'production' || 
                    process.env.NEXTAUTH_URL?.startsWith('https://');
    
    // 設置 next-auth 標準的 session cookie
    cookieStore.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      path: '/',
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    // 如果是 HTTPS，設置額外的 secure cookie
    if (isSecure) {
      cookieStore.set('__Secure-next-auth.session-token', sessionToken, {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'none',
        maxAge: 60 * 60 * 24 * 30
      });
    }

    console.log('Login successful for user:', decoded);
    
    // 成功登入後直接轉向
    redirect(redirectTo);
    
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
