/**
 * Wraps an async route handler so that any rejected promise is passed to Express's next(err).
 * Ensures the central error-handling middleware runs instead of leaving the request hanging.
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
