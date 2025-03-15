const retry = require('async-retry');

const retryMiddleware = (fn, options = {}) => {
  return async (req, res, next) => {
    try {
      await retry(async (bail) => {
        try {
          await fn(req, res, next);
        } catch (err) {
          if (err.statusCode && err.statusCode < 500) {
            bail(err);
          } else {
            throw err;
          }
        }
      }, {
        retries: options.retries || 5,
        minTimeout: options.minTimeout || 1000,
        maxTimeout: options.maxTimeout || 8000,
        factor: options.factor || 2,
        onRetry: (err, attempt) => {
          console.log(`Retry attempt ${attempt} due to error: ${err.message}`);
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Operation failed after multiple retries', error: err.message });
    }
  };
};

module.exports = retryMiddleware;