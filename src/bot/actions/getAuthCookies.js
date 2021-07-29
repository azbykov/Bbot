'use strict';

const log = require('../../lib/log')('authentication');
let request = require('request');
const {auth} = require('config').bot;
const cheerio = require('cheerio');
const reqq = require('../../lib/reqreq');
const {protocol, domain, auth: authPath} = require('../../constants/uri');

const requestParams = {
	uri: `${protocol}${domain}${authPath}`,
	method: 'POST',
	form: {
		step: 1,
		auth_name: auth.login,
		auth_pass: auth.password,
		auth_remember: true
	}
};

request = request.defaults({jar: true});

const get = () => {
	return new Promise((resolve, reject) => {

		// return resolve();
		request(requestParams, (error, {body}) => {
			if (error) {
				log.error('request', error.message);
				reject(error);
			}

			const $ = cheerio.load(body);
			const iconError = $('img[src="/images/icons/error.gif"]');

			if (iconError.length > 0) {
				const errorText = `${iconError.parent().next().text()} Пользователь: ${auth.login}!`;
				log.error(`Auth error! ${errorText}`);
				reject(errorText);
			}

			reqq({request});
			resolve(request);
		});
	});
};

module.exports = {
	get
};

