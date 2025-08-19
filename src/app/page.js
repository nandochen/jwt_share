import { headers } from 'next/headers';
import { getToken, decode } from "next-auth/jwt";
import { cookies } from 'next/headers';  

const secret = process.env.NEXTAUTH_SECRET;

export default async function Home({ searchParams }) { 
  // 取得 request header
  const reqHeaders = await headers();
  // 取得 request search
  const reqSearchParams = await searchParams;
  // 取得 token from header
  let tokenValue = reqHeaders.get('token');

  // 若 header 無 token，則從 URL query string 取得
  if (!tokenValue && reqSearchParams?.token) {
    tokenValue = reqSearchParams.token;
  }

  // 使用 next-auth/jwt 驗證 token
  let token = null;
  let valid = false;
  let decoded = null;
  let errorMsg = ''
  if (tokenValue) {
    token = await getToken({ req: { headers: { authorization: `Bearer ${tokenValue}` } }, secret });
    valid = !!token;

    decoded = await decode({
        token: tokenValue,
        secret: process.env.NEXTAUTH_SECRET,
      }).catch((error) => {
        console.error('Error decoding token:', error);
      }); 

    if (decoded) {
      const apiBaseUrl = (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:3001'
        : 'https://jwt-share.vercel.app';

      try {
        const loginRsp = await fetch(`${apiBaseUrl}/api/auth/login-jwt?token=${encodeURIComponent(tokenValue)}`, {
          method: 'GET'
        });

        const result = await loginRsp.json();
        console.log(result)

        if (result.success) {
          // 成功登入後直接轉向
          // redirect(result.redirectUrl || '/login-status');
        } else {
          errorMsg = result.error || 'Login failed';
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        errorMsg = `<p>Error: ${error.message}</p>`;
      }

      // Transfer cookies from response to Next.js cookies API
      /*
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        const cookieStore = cookies();
        const parsed = setCookie.split(",").map(c => c.trim());
        parsed.forEach(cookieStr => {
          const [nameValue] = cookieStr.split(";");
          const [name, value] = nameValue.split("=");
          cookieStore.set(name, value);
        });
      }
      */
    }
  }

  return (
    <div>
      <h3>Token:</h3>
      <pre>{tokenValue || 'Not set'}</pre>
      <h3>Valid:</h3>
      <pre>{valid ? 'Yes' : 'No'}</pre>
      {
        valid && decoded && (
          <div>
            <h3>Decoded Token:</h3>
            <pre>{JSON.stringify(decoded, null, 2)}</pre>
            <a href="/login-status">Login Status</a>
          </div>
        )
      }
    </div>
  );
}
