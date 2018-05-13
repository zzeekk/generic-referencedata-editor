
var express = require('express');
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
app.listen(config.port);

console.log('listening on port '+config.port);
