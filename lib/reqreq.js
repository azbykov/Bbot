'use strict';

const logger = require('./log');

const Vow = require('vow');

class Req {
	constructor(options) {
		this._request = options.request;
	}
	request(name, requestParams, callback) {
		const log = logger(`request_${name}`);

		if (!callback) {
			callback = (res) => res.body;
		}

		return Vow.resolve()
			.then(() => {
				let promise = Vow.promise();

				this._request(requestParams, (error, res) => {

					if (error) {
						log.error('error request', error);
						log.debug('error request with params', requestParams);
						promise.reject(error);
					}
					promise.fulfill(res);
				});
				return promise;
			})
			.then(callback);
	}
}

let req;

module.exports = (options) => {
	if (!req) {
		req = new Req(options);
	}
	return req;
};
