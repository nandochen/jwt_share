import { decode } from "next-auth/jwt";

/**
 * Server Component 用於將 JWT token 字串轉換為用戶物件
 * @param {string} token - JWT token 字串
 * @param {Object} props - 其他屬性
 */
export default async function JWTToUser({ token, children, fallback = null, ...props }) {
  let user = null;
  let error = null;

  if (token) {
    try {
      // 使用 next-auth 的 decode 功能
      const decoded = await decode({
        token: token,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (decoded) {
        // 標準化用戶物件格式
        user = {
          id: decoded.sub || decoded.id || decoded.userId || decoded.email,
          name: decoded.name || decoded.username,
          email: decoded.email,
          image: decoded.picture || decoded.avatar,
          // 保留原始 JWT 的所有資料
          ...decoded
        };
      }
    } catch (err) {
      error = err.message;
      console.error('JWT decode error:', err);
    }
  }

  // 如果提供了 children 函數，則作為 render prop 使用
  if (typeof children === 'function') {
    return children({ user, error, isValid: !!user });
  }

  // 如果沒有用戶且有 fallback，顯示 fallback
  if (!user && fallback) {
    return fallback;
  }

  // 預設顯示用戶資訊
  return (
    <div {...props}>
      {user ? (
        <div>
          <h3>用戶資訊</h3>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>名稱:</strong> {user.name || '未設置'}</p>
          <p><strong>郵箱:</strong> {user.email || '未設置'}</p>
          {user.image && (
            <p><strong>頭像:</strong> <img src={user.image} alt="Avatar" style={{width: '32px', height: '32px', borderRadius: '50%'}} /></p>
          )}
          <details>
            <summary>完整資料</summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div>
          <p>無效的 JWT token</p>
          {error && <p style={{ color: 'red' }}>錯誤: {error}</p>}
        </div>
      )}
    </div>
  );
}
