
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginStatus() {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <div>載入中...</div>;
	}

	return (
		<div>
			<h2>用戶登入狀態</h2>
			{session ? (
				<>
					<p>已登入</p>
					<pre>{JSON.stringify(session.user, null, 2)}</pre>
				</>
			) : (
				<>
					<p>未登入</p>
				</>
			)}
		</div>
	);
}
