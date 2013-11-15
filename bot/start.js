
/**
 * Module dependencies.
 */

//var express = require('express');
//var http = require('http');
var log = require('../lib/log')(module);
//var config = require('config').bot;
var index = require('./actions/index');

//var app = express();
index.start();


// all environments
//app.set('port', process.env.PORT || config.server.port);

//http.createServer(app).listen(app.get('port'), function(){
//  	console.log('Bbot server listening on port ' + app.get('port'));
//	log.info('Bbot server listening on port', app.get('port'))
//});
