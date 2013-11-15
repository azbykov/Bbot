var log = require('../../lib/log')(module);
var auth = require('./auth');
var async = require('async');

module.exports.start = start = function() {
	log.info('action start');
	async.waterfall([
		function(callback) {
			log.info('getting cookies');
			auth.cookies.done(function(cookies) {
				log.info('cookies done');
				callback(null, cookies)
			})
		},
		function(cookies, callback) {
			setTimeout(function() {
				log.info('ddddd');
				callback(null, cookies)
			}, 3000)
		}
	], function (err, result) {
		log.info('final', result);
		// result now equals 'done'
	});



}
