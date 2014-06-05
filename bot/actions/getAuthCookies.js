var log = require('../../lib/log')('authentication');
var request = require('request');
var config = require('config').bot;
var Vow = require('vow');

global.butsaRequest = {};

module.exports.cookies = cookies = Vow.promise();

var requestParams = {
	uri: config.path.protocol + config.path.domain + config.path.auth,
	method: "POST",
	form: {
		auth_name: config.auth.login,
		auth_pass: config.auth.password
	}
};

request = request.defaults({jar: true});

module.exports.get = get = function() {
	request(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error.message);
			cookies.reject(error);
		}
		global.butsaRequest = request;
		cookies.fulfill(request);
	});
	return cookies;
};


