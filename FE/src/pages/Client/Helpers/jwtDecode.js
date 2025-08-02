// src/pages/Client/Helpers/jwtDecode.js

/**
 * Giải mã JWT từ LocalStorage để lấy thông tin user.
 * @param {string} token - Chuỗi JWT
 * @returns {object|null} - Payload của token hoặc null nếu lỗi
 */
export function decodeToken(token) {
  try {
    if (!token) return null;

    // JWT có 3 phần: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Giải mã base64 phần payload
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error("Lỗi decodeToken:", error);
    return null;
  }
}
