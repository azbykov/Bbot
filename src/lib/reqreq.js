/* eslint-disable */
'use strict';

const {constants, promises} = require('fs');
const path = require('path');
const {writeFile, access} = promises;
const logger = require('./log');
const PATH = require('../constants/path');
const USE_MOCKS = process.argv.slice(2, process.argv.length)[0] === '--use-mocks';

class Req {
	constructor(options = {request: () => console.log('request')}) {
		this._request = (name, requestParams, cb) => {
			return USE_MOCKS
				? this.getMock({name, requestParams, cb, request: options.request})
				: options.request(requestParams, cb);
		};
	}
	request(name, requestParams, callback = (res) => res.body) {
		const log = logger(`request_${name}`);

		return new Promise((resolve, reject) => {
			this._request(name, requestParams, (error, res) => {
				if (error) {
					log.error('request ', error);
					log.error('request with params ', {requestParams});
					reject(error);
				}
				resolve(res);
			});
		}).then(callback);
	}

	async getMock({name, requestParams, cb, request = () => console.log('requrst')}) {
		// if post make request
		if (requestParams.method === 'POST') {
			return request(requestParams, cb);
		}

		const mockPath = path.resolve(PATH.mocks, `${name}.json`);
		console.log('------Use mock!------');

		try {
			console.log('Try check mock!');
			await access(mockPath, constants.R_OK | constants.W_OK);
			const mock = require(mockPath);

			console.log(`get mock from file ${mockPath}`);
			cb(null, mock);
		} catch (noFile) {
			console.log('Can\'t find mock! Make request');

			try {
				console.log(`Make request to save mock ${name}`);
				request(requestParams, async(error, res) => {
					if (error) {
						throw new Error(error);
					}
					try {
						console.log(`Write mock to file ${mockPath}`);
						await writeFile(mockPath, JSON.stringify({body: res.body}));
						console.log('Saved! Run callback function!');
						return cb(null, res);
					} catch (er) {
						throw new Error(er);
					}
				});
			} catch (err) {
				return cb(err);
			}
		}
	}
}

let req;

module.exports = (options) => {
	if (!req) {
		req = new Req(options);
	}
	return req;
};
