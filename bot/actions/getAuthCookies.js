'use strict';

const log = require('../../lib/log')('authentication');
let request = require('request');
const config = require('config').bot;
const Vow = require('vow');
const reqq = require('../../lib/reqreq');
require('../../lib/Team');

global.butsaRequest = {};

const cookies = Vow.promise();

const requestParams = {
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

const get = () => {
	request(requestParams, (error) => {
		if (error) {
			log.error('error request', error.message);
			cookies.reject(error);
		}
		global.butsaRequest = request;
		reqq({request});
		cookies.fulfill(request);
	});
	return cookies;
};

module.exports = {
	cookies,
	get
};

