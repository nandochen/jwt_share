"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithJWT } from '../../actions/loginWithJWT';

function CrossDomainAuthContent() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('處理中...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processLogin = async () => {
      const token = searchParams.get('token');
      const redirectTo = searchParams.get('redirect') || '/login-status';

      if (!token) {
        setStatus('error');
        setMessage('未提供 JWT token');
        return;
      }

      try {
        const result = await loginWithJWT(token);
        
        if (result.success) {
          setStatus('success');
          setMessage('登入成功，正在轉向...');
          
          // 等待一下讓 cookie 設置完成
          setTimeout(() => {
            router.push(redirectTo);
          }, 1000);
        } else {
          setStatus('error');
          setMessage('登入失敗: ' + result.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('登入過程發生錯誤: ' + error.message);
      }
    };

    processLogin();
  }, [searchParams, router]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>跨域登入處理</h2>
      <div style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        {status === 'processing' && (
          <div>
            <div style={{ marginBottom: '10px' }}>🔄</div>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div style={{ marginBottom: '10px', color: 'green' }}>✅</div>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div style={{ marginBottom: '10px', color: 'red' }}>❌</div>
            <p>{message}</p>
            <button 
              onClick={() => router.push('/login-status')}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              查看登入狀態
            </button>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>使用方式：</p>
        <code style={{ backgroundColor: '#f5f5f5', padding: '4px' }}>
          /auth/cross-domain?token=YOUR_JWT_TOKEN&redirect=/target-page
        </code>
      </div>
    </div>
  );
}

export default function CrossDomainAuth() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>載入中...</div>
      </div>
    }>
      <CrossDomainAuthContent />
    </Suspense>
  );
}
