import JWTToUser from '../components/JWTToUser';

export default async function JWTConverterPage({ searchParams }) {
  const params = await searchParams;
  const token = params?.token;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>JWT Token 轉換器</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>在 URL 中提供 token 參數來測試 JWT 轉換：</p>
        <code style={{ backgroundColor: '#f5f5f5', padding: '4px' }}>
          /jwt-converter?token=YOUR_JWT_TOKEN
        </code>
      </div>

      {token ? (
        <div>
          <h2>轉換結果：</h2>
          
          {/* 基本用法 */}
          <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>基本用法：</h3>
            <JWTToUser token={token} />
          </div>

          {/* 使用 render prop 的高級用法 */}
          <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>使用 Render Prop：</h3>
            <JWTToUser token={token}>
              {({ user, error, isValid }) => (
                <div>
                  {isValid ? (
                    <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px' }}>
                      <p>✅ JWT 驗證成功！</p>
                      <p>歡迎，{user.name || user.email || '用戶'}！</p>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>
                      <p>❌ JWT 驗證失敗</p>
                      {error && <p>錯誤: {error}</p>}
                    </div>
                  )}
                </div>
              )}
            </JWTToUser>
          </div>

          {/* 使用 fallback 的用法 */}
          <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
            <h3>使用 Fallback：</h3>
            <JWTToUser 
              token={token} 
              fallback={
                <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
                  <p>⚠️ 未提供有效的 JWT token</p>
                </div>
              } 
            />
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#e2e3e5', padding: '20px', borderRadius: '4px' }}>
          <p>請在 URL 中提供 token 參數來測試 JWT 轉換。</p>
          <p>範例：<code>/jwt-converter?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code></p>
        </div>
      )}

      <hr style={{ margin: '30px 0' }} />
      
      <div>
        <h2>使用方式說明：</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
          <h3>基本用法：</h3>
          <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
{`import JWTToUser from './components/JWTToUser';

// 基本用法
<JWTToUser token={jwtTokenString} />

// 使用 render prop
<JWTToUser token={jwtTokenString}>
  {({ user, error, isValid }) => (
    <div>
      {isValid ? (
        <p>歡迎，{user.name}！</p>
      ) : (
        <p>登入失敗: {error}</p>
      )}
    </div>
  )}
</JWTToUser>

// 使用 fallback
<JWTToUser 
  token={jwtTokenString}
  fallback={<p>請先登入</p>}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
