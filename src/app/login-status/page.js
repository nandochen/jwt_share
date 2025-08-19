"use client";

import { useSession, signIn, signOut, getSession } from "next-auth/react"; 
import { useEffect, useState } from "react";

export default function LoginStatus() {	 
	const { data: session, status } = useSession(); 
	const [debugInfo, setDebugInfo] = useState('');

	useEffect(() => {
		// Debug: 檢查 cookies
		const cookies = document.cookie;
		setDebugInfo(cookies);
		
		// 嘗試手動獲取 session
		getSession().then(sessionData => {
			console.log('Manual getSession result:', sessionData);
		});
	}, []);

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
					<pre>{JSON.stringify(session, null, 2)}</pre>
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
			<pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
				{debugInfo}
			</pre>
		</div>
	);
}