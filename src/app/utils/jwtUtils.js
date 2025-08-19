import { decode } from "next-auth/jwt";

/**
 * 將 JWT token 字串轉換為用戶物件的 utility 函數
 * @param {string} token - JWT token 字串
 * @returns {Promise<Object|null>} 用戶物件或 null
 */
export async function jwtToUser(token) {
  if (!token) return null;

  try {
    const decoded = await decode({
      token: token,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!decoded) return null;

    // 標準化用戶物件格式
    return {
      id: decoded.sub || decoded.id || decoded.userId || decoded.email,
      name: decoded.name || decoded.username,
      email: decoded.email,
      image: decoded.picture || decoded.avatar,
      // 保留原始 JWT 的所有資料
      ...decoded
    };
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * 驗證 JWT token 是否有效
 * @param {string} token - JWT token 字串
 * @returns {Promise<boolean>} 是否有效
 */
export async function isValidJWT(token) {
  const user = await jwtToUser(token);
  return !!user;
}

/**
 * 從 request headers 或 searchParams 中提取 JWT token
 * @param {Object} options - 選項
 * @param {Request} options.request - Request 物件
 * @param {Object} options.searchParams - 搜尋參數
 * @param {Object} options.headers - Headers 物件
 * @returns {string|null} JWT token 或 null
 */
export function extractJWTToken({ request, searchParams, headers } = {}) {
  // 1. 從 searchParams 中取得 token
  if (searchParams?.token) {
    return searchParams.token;
  }

  // 2. 從 headers 中取得 Authorization Bearer token
  if (headers?.authorization) {
    const authHeader = headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
  }

  // 3. 從 headers 中取得自定義的 token header
  if (headers?.token) {
    return headers.token;
  }

  // 4. 從 request 中提取（如果提供了 request 物件）
  if (request) {
    const url = new URL(request.url);
    const tokenFromQuery = url.searchParams.get('token');
    if (tokenFromQuery) return tokenFromQuery;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const tokenHeader = request.headers.get('token');
    if (tokenHeader) return tokenHeader;
  }

  return null;
}
