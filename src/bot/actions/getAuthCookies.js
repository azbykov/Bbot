'use strict';

const log = require('../../lib/log')('authentication');
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

const get = async() => {
	const client = reqq();

	try {
		const {body} = await client.request('authentication', requestParams, (response) => response);
		const $ = cheerio.load(body);
		const iconError = $('img[src="/images/icons/error.gif"]');

		if (iconError.length > 0) {
			const errorText = `${iconError.parent().next().text()} Пользователь: ${auth.login}!`;
			throw new Error(errorText);
		}

		return client;
	} catch (error) {
		log.error('Auth error!', error.message);
		throw error;
	}
};

module.exports = {
	get
};
