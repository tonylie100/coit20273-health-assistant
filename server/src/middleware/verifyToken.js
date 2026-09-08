// src/middleware/verifyToken.js
// Temporary Auth Middleware for local testing

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Block request if no Bearer token provided (for Postman 401 test)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid Bearer token.'
    });
  }

  // Inject dummy user context so recommendationService can use req.user.uid
  req.user = {
    uid: '1',
    email: 'anthony@example.com'
  };

  next();
};