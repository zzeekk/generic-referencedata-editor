
var express = require('express');
var https = require('https');
var fs = require('fs');
var { createProxyMiddleware } = require('http-proxy-middleware');
var config = require('./config.json');

/**
 * Configure proxy middleware
 */
var bitbucketServerProxy = createProxyMiddleware({
  target: config.bitbucketServerUrl,
  pathRewrite: {'^/bitbucketServerProxy' : ''},
  changeOrigin: true	
});

var app = express();
app.use('/', express.static('dist'));
app.use('/bitbucketServerProxy', bitbucketServerProxy);

var privateKey  = fs.readFileSync(config.sslKeyFile, 'utf8');
var certificate = fs.readFileSync(config.sslCertFile, 'utf8');
var options = {key: privateKey, cert: certificate};
https.createServer(options, app).listen(config.port);

console.log('listening for https on port '+config.port);
