
/**
 * Module dependencies.
 */

//var express = require('express');
//var http = require('http');
var log = require('../lib/log')('start');
//var config = require('config').bot;
//var sendRoster = require('./tasks/sendRoster');
var buildings = require('./tasks/buildings');

//var app = express();
//sendRoster.start();

buildings.start();


// all environments
//app.set('port', process.env.PORT || config.server.port);

//http.createServer(app).listen(app.get('port'), function(){
//  	console.log('Bbot server listening on port ' + app.get('port'));
//	log.info('Bbot server listening on port', app.get('port'))
//});
