// This file sets up a development proxy to bypass CORS issues
// More info: https://create-react-app.dev/docs/proxying-api-requests-in-development/

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for direct backend API calls (if CORS proxy is not available)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://stagev2.appletechlabs.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Keep the /api path
      },
      ws: true,
      logLevel: 'debug',
    })
  );
};
