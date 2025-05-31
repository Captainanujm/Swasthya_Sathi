/**
 * Middleware to restrict access to certain user roles
 * @param  {...string} roles - The roles allowed to access the route
 * @returns {Function} Express middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Check if user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }

    // If user has required role, proceed to next middleware
    next();
  };
}; 