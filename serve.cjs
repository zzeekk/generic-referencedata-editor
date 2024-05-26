
var express = require('express');
var https = require('https');
var fs = require('fs');
var { createProxyMiddleware } = require('http-proxy-middleware');
var config = require('./config.json');
if (!config.bitbucketServerUrl) throw new Error("bitbucketServerUrl missing in config.json");
if (!config.port) throw new Error("port missing in config.json");
if (!config.sslKeyFile) throw new Error("sslKeyFile missing in config.json");
if (!config.sslCertFile) throw new Error("sslCertFile missing in config.json");

/**
 * Configure proxy middleware
 */
var bitbucketServerProxy = createProxyMiddleware({
  target: config.bitbucketServerUrl,
  pathRewrite: {'^/api/server' : ''},
  changeOrigin: true	
});
var devProxy = createProxyMiddleware({
  target: 'http://localhost:5173/',
});

var app = express();
app.use('/api/server', bitbucketServerProxy);
app.use('/', express.static('build'));
//app.use('/', devProxy); // use to forward to dev server started with `yarn start

var privateKey  = fs.readFileSync(config.sslKeyFile, 'utf8');
var certificate = fs.readFileSync(config.sslCertFile, 'utf8');
var options = {key: privateKey, cert: certificate};
https.createServer(options, app).listen(config.port);

console.log('Server and Proxy started, open https://localhost:'+config.port);
