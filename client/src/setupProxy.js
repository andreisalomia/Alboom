const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // proxy REST API calls
  app.use(
    createProxyMiddleware('/api', {
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );

  // proxy socket.io (and enable WebSocket support)
  app.use(
    createProxyMiddleware('/socket.io', {
      target: 'http://localhost:5000',
      ws: true,
      changeOrigin: true,
    })
  );
};
