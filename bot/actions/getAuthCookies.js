'use strict';

var log = require('../../lib/log')('authentication');
var request = require('request');
var config = require('config').bot;
var Vow = require('vow');

global.butsaRequest = {};

var cookies = Vow.promise();

var requestParams = {
	uri: config.path.protocol + config.path.domain + config.path.auth,
	method: 'POST',
	form: {
		step: 1,
		auth_name: config.auth.login,
		auth_pass: config.auth.password,
		auth_remember: true
	}
};

request = request.defaults({jar: true});

var get = function() {
	request(requestParams, function(error) {
		if (error) {
			log.error('error request', error.message);
			cookies.reject(error);
		}
		global.butsaRequest = request;
		cookies.fulfill(request);
	});
	return cookies;
};

module.exports = {
	cookies: cookies,
	get: get
};

