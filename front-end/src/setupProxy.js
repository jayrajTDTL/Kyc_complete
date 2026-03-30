const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://7b1x8z1s-8080.euw.devtunnels.ms',
      changeOrigin: true,
      secure: false,
    })
  );
};
