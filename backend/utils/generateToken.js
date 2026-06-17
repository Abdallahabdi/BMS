import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for a user.
 * @param {string} userId - The user's MongoDB ObjectId
 * @param {string} role   - The user's role ('user' | 'admin')
 * @param {string} expiresIn - Optional override, e.g. '1d', '7d'
 * @returns {string} Signed JWT
 */
export const generateToken = (userId, role, expiresIn) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Verify a JWT token.
 * @param {string} token - The token to verify
 * @returns {object|null} Decoded payload or null on failure
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
