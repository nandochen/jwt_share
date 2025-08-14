import { headers } from 'next/headers';
import { getToken, decode } from "next-auth/jwt";
import { cookies } from 'next/headers'; 

const secret = process.env.NEXTAUTH_SECRET;

export default async function Home({ searchParams }) { 
  // 取得 request header
  const reqHeaders = headers();
  // 取得 token from header
  let tokenValue = reqHeaders.get('token');

  // 若 header 無 token，則從 URL query string 取得
  if (!tokenValue && searchParams?.token) {
    tokenValue = searchParams.token;
  }

  // 使用 next-auth/jwt 驗證 token
  let token = null;
  let valid = false;
  if (tokenValue) {
    token = await getToken({ req: { headers: { authorization: `Bearer ${tokenValue}` } }, secret });
    valid = !!token;

    const decoded = await decode({
        token: tokenValue,
        secret: process.env.NEXTAUTH_SECRET,
      }).catch((error) => {
        console.error('Error decoding token:', error);
      }); 

      // The 'decoded' object will contain the payload of your JWT
      console.log(decoded);
  }

  return (
    <div>
      <p>Token: {tokenValue || 'Not set'}</p>
      <p>Valid: {valid ? 'Yes' : 'No'}</p>
    </div>
  );
}
