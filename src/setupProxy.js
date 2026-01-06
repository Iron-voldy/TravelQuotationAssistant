// This file sets up a development proxy to bypass CORS issues
// More info: https://create-react-app.dev/docs/proxying-api-requests-in-development/

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy for direct backend API calls (if CORS proxy is not available)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://stagev2.appletechlabs.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Keep the /api path
      },
      ws: false, // Disable WebSocket proxying to avoid conflicts
      logLevel: 'silent', // Reduce noise in console
    })
  );

  // Proxy for n8n webhook to bypass CORS issues
  app.use(
    '/n8n-webhook',
    createProxyMiddleware({
      target: 'https://aahaas-ai.app.n8n.cloud',
      changeOrigin: true,
      pathRewrite: {
        '^/n8n-webhook': '/webhook/48c515db-125a-42bb-9ab5-a1a6c1a3cc3c',
      },
      ws: false, // Disable WebSocket proxying
      logLevel: 'silent', // Reduce noise in console
      onProxyReq: (proxyReq, req, res) => {
        console.log('[N8N PROXY] Forwarding request to n8n webhook');
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('[N8N PROXY] Received response from n8n:', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error('[N8N PROXY] Error:', err.message);
      }
    })
  );
};
