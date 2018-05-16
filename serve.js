
var express = require('express');
var https = require('https');
var fs = require('fs');
var proxy = require('http-proxy-middleware');
var config = require('./config.json');

/**
 * Configure proxy middleware
 */
var bitbucketServerProxy = proxy({
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

//openssl genrsa -out server.key 2048
//openssl req -new -key server.key -out server.crt.req
//openssl x509 -req -in server.crt.req -signkey server.key -out server.crt