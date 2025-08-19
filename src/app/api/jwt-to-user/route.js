import { NextResponse } from 'next/server';
import { jwtToUser, isValidJWT, extractJWTToken } from '../../utils/jwtUtils';

export async function GET(request) {
  try {
    // 提取 JWT token
    const token = extractJWTToken({ request });

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No JWT token provided',
        message: 'Please provide a token via query parameter or Authorization header'
      }, { status: 400 });
    }

    // 驗證 token 並轉換為用戶物件
    const user = await jwtToUser(token);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JWT token',
        message: 'The provided token is invalid or expired'
      }, { status: 401 });
    }

    // 檢查是否有效
    const isValid = await isValidJWT(token); 
    return NextResponse.json({
      success: true,
      user,
      userStr: JSON.stringify(user),
      isValid,
      message: 'JWT token successfully converted to user object'
    });

  } catch (error) {
    console.error('Error in JWT conversion API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const token = body.token || extractJWTToken({ request });

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No JWT token provided in request body or headers'
      }, { status: 400 });
    }

    const user = await jwtToUser(token);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JWT token'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'JWT token successfully processed'
    });

  } catch (error) {
    console.error('Error in JWT conversion API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}
