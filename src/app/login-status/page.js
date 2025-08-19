"use client";

import { useSession, signIn, signOut, getSession } from "next-auth/react"; 
import { useEffect, useState } from "react";

export default function LoginStatus() {	 
	const { data: session, status } = useSession(); 
	const [debugInfo, setDebugInfo] = useState('');
	const [tokenSrc, setTokenSrc] = useState(''); 
	const [user, setUser] = useState(null); 

	useEffect(() => {
		// Debug: 檢查 cookies
		const cookies = document.cookie;
		setDebugInfo(cookies);
		
		// 嘗試手動獲取 session
		getSession().then(async sessionData => {
			console.log('Manual getSession result:', sessionData);
			const _tokenSrc = ((sessionData?.cookies).split('next-auth.session-token=')[1]).split(';')[0] || '';
			setTokenSrc(_tokenSrc || null);
		});
	}, []);

	useEffect(() => {
		// 嘗試解碼 token - 改用 server-side API
		if (tokenSrc) {
			fetch(`/api/jwt-to-user?token=${encodeURIComponent(tokenSrc)}`)
				.then(response => response.json())
				.then(result => { 
					if (result.success) { 
						console.log('Decoded User:', JSON.parse(result.userStr));
						setUser(JSON.parse(result.userStr));
					} else {
						console.error('Error decoding token:', result.error);
						setUser(null);
					}
				})
				.catch(error => {
					console.error('Error calling jwt-to-user API:', error);
					setUser(null);
				});
		}
	}, [tokenSrc]);

	if (status === "loading") {
		return <div>載入中...</div>;
	}

	return (
		<div>
			<h2>用戶登入狀態</h2> 
			<p>Status: {status}</p>
			{session ? (
				<>
					<p>已登入</p>
					<pre>{JSON.stringify(user || session, null, 2)}</pre> 
				</>
			) : (
				<>
					<p>未登入</p>
					<button onClick={() => signIn()}>手動登入</button>
				</>
			)}
			
			<hr />
			<h3>Debug 資訊</h3>
			<h4>Cookies:</h4>
			<pre style={{ fontSize: '12px', padding: '10px' }}>
				{debugInfo}
			</pre>
		</div>
	);
}