import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Server session:', session);
    
    return NextResponse.json({
      session,
      cookies: req.headers.get('cookie') || 'No cookies',
      debug: {
        hasSessionToken: req.headers.get('cookie')?.includes('next-auth.session-token'),
        hasSecureSessionToken: req.headers.get('cookie')?.includes('__Secure-next-auth.session-token'),
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({
      error: error.message,
      session: null
    });
  }
}
