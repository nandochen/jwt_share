import { loginWithJWT } from '../../actions/loginWithJWT';
import { redirect } from 'next/navigation';

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
    const result = await loginWithJWT(token);
    
    if (result.success) {
      // 成功登入後直接轉向
      redirect(redirectTo);
    } else {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>登入失敗</h2>
          <p>{result.error}</p>
          <a href="/login-status">查看登入狀態</a>
        </div>
      );
    }
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
