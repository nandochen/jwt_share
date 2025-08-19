"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useTransition } from "react";
import { loginWithJWT } from "../actions/loginWithJWT";

export default function LoginStatus() {	 
	const { data: session, status } = useSession(); 

	if (status === "loading") {
		return <div>載入中...</div>;
	}

	return (
		<div>
			<h2>用戶登入狀態</h2>
			<LoginButton />
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

function LoginButton() {
  const [pending, startTransition] = useTransition();

  const handleLogin = () => {
    startTransition(async () => {
      await loginWithJWT("eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..P85a6zzBkPid-o8A.zjEt5NGZK0NDw_bOuGHYOQ8gApyhYBfOnkOu4YdfhqdC_g6ZvWF822Sx4WPpuL7nilJHQdjE5kk2OJzkEg00bK-cvT2FIiVXMv1DCHrCHRLeTwJRyimalpyFRZDy5BW87vwm7OsBBtW0hiukPDeQVt4eQmUF0ruPOJOk1xJFdwhrBwnuBjANGHiN_ziQX2GLMLlqU24z6EWU3Z5N7QZ5lz7Wm9-p0oN3OG6TUtEIZq1c2I-MdF2ph6kmeQ8j4ay0pPNF---KFCsQpzs3erO1XsA37AS-9tYKlQ9-MHQpBQQSBo0DKUY2Tjz2pT6NjLRlRtPlP7i_CcNGPGfX8Kq2wcLY7bCJNl3DSrUSd2J3qRKFH5rjr2AFKtiQR3jHfWjesQP1HVMYyhl_NsiC1zqSRaHNs2eGzUXkDKfbx0DqDW6FaUaNh_PkmqUsiSIV-gRUGT8-cx7vSntvKYpwQOWd71GjJYh6Ms5sDURBHC52q6xbgCG0tsL37UMGWGw-RsGz8LjT1cwDxtuUdbZMnWJccQ98QENNCgvy8bXvpNIRSIYnFiobKGdP2VvYI_mnLB_4ACSN6FZxrmO2nmvUa9KTjQGRIGTFhcH3M-STh-Jd_8-s6mES4k0WGchbp66XopywsvJ35hQora-ArYdrkSjpCTHbi9go7ULIndE3JdOgDzQjvNImTrJOR1gTpcRZ5VWPdDfosi-yIjpGEI5Xv7zwCZvAHjtieXH1xOu6RpkiXnF3ZvgFy7_yemr4wJd4tFGIszIAq-oTLUZuzqKX_m2C67x14CTK5FIHS9ZhXngwMsUp-KTYrfuqG8ggTwGX-GZv0c-XVvwnmJ3tEyf3KJhAUfVKAMBkT1qoOhJ6hhzThu5hSgnH9usl5wi1BHKSHsoYrB8sjTIP9B3V_mgQbxMcA2e46O8q9vovJDXnCrdb8a-_mYNWhBalBT1huVkoAmNyTDg06NIuy5DabwNB1Ng1Xh3gzfa7Fm_fl9SRWhxXNLwxqtsCupmThQhgeRWS9Dn2tdp_gE0A49sx9Nj8PqLvwEjcVjNztVtpuVbB3Uwd88_q3c6cWsEua7K76KiIThc71JaJ-aXrQwlueZJdLuI4QfMN4OE4_aHRc21P5Ut27UFqBVEPp1I_nbFA_POesD5BZ9Jy0VthGjOZpAeKucwsW0oWq7dKtuMcMxwgySIVHxjLTjR7JFynEwMpAAkmz7Tu7sj4V9UK9rQK2OvhQ7w4_zHxqAtCNiaUvnakaoIY8TAKaojDllG9uo0KwSNWGWl7gMJwkqyE.PB9--ihgoMjTyY6hkws4Pg");
      window.location.reload(); // refresh to load session
    });
  };

  return (
    <button onClick={handleLogin} disabled={pending}>
      {pending ? "Logging in..." : "Login with JWT"}
    </button>
  );
}