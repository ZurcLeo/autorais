// src/setupProxy.js
module.exports = function(app) {
    app.use(function(req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });
    
    // Esta parte não é oficialmente documentada, mas pode ajudar
    process.env.WDS_SOCKET_HOST = 'localhost';
    process.env.WDS_SOCKET_PORT = '3000';
  };