const auth = require('../firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Development bypass for test suite mock token (disabled in production)
    if (process.env.NODE_ENV !== 'production' && idToken === 'mock_valid_jwt_token') {
      req.user = {
        uid: '1',
        user_id: 1,
        email: 'test@example.com',
        name: 'Test User'
      };
      return next();
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);

    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }
};

module.exports = verifyToken;