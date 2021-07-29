'use strict';

const request = require('request');
const log = require('../../lib/log')('action_getImage');

const getImage = (url) => {
	const options = {
		url,
		headers: {
			'Content-Type': 'charset=utf-8',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'en-US,en;q=0.5'
		},
		encoding: 'binary',
		gzip: true
	};

	return new Promise((resolve, reject) => {
		request(options, (err, res, body) => {
			if (err) {
				log.error('Error!!', err);
				return reject(err);
			}
			return resolve(new Buffer(body.toString(), 'binary').toString('base64'));
		});
	});
};

module.exports = getImage;
