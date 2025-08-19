"use server";


import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function loginWithJWT(jwtString) {
  try {
    const decoded = jwt.verify(jwtString, process.env.NEXTAUTH_SECRET);
    // 設置 session cookie (模擬 next-auth 行為)
    const cookieStore = cookies();
    cookieStore.set('next-auth.session-token', jwtString, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return { success: true, user: decoded };
  } catch (err) {
    return { success: false, error: 'Invalid JWT' };
  }
}
