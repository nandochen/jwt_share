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
  if (tokenValue) {
    token = await getToken({ req: { headers: { authorization: `Bearer ${tokenValue}` } }, secret });
    valid = !!token;

    decoded = await decode({
        token: tokenValue,
        secret: process.env.NEXTAUTH_SECRET,
      }).catch((error) => {
        console.error('Error decoding token:', error);
      }); 
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
