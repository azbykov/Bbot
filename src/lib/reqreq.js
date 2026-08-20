'use strict';

const {constants, promises} = require('fs');
const path = require('path');
const {access, mkdir, readFile, writeFile} = promises;
const logger = require('./log');
const PATH = require('../constants/path');

const USE_MOCKS = process.argv.includes('--use-mocks');
const SENSITIVE_FIELD = /pass(word)?|auth_pass|token|secret/i;

const redactRequestParams = (requestParams) => {
	const safeParams = {...requestParams};

	if (requestParams.form) {
		safeParams.form = Object.fromEntries(Object.entries(requestParams.form).map(([key, value]) => [
			key,
			SENSITIVE_FIELD.test(key) ? '[REDACTED]' : value
		]));
	}

	return safeParams;
};

const appendValues = (params, key, value) => {
	if (Array.isArray(value)) {
		value.forEach((item, index) => params.append(`${key}[${index}]`, String(item)));
		return;
	}

	if (value !== undefined && value !== null) {
		params.append(key, String(value));
	}
};

class Req {
	constructor({fetchImpl = globalThis.fetch, useMocks = USE_MOCKS} = {}) {
		this.fetch = fetchImpl;
		this.useMocks = useMocks;
		this.cookies = new Map();
	}

	async request(name, requestParams, callback = (response) => response.body) {
		const log = logger(`request_${name}`);

		try {
			const response = this.useMocks && requestParams.method !== 'POST'
				? await this.getMock(name, requestParams)
				: await this.makeRequest(requestParams);

			return callback(response);
		} catch (error) {
			log.error('request ', error);
			log.error('request with params ', {requestParams: redactRequestParams(requestParams)});
			throw error;
		}
	}

	async makeRequest(requestParams) {
		const url = new URL(requestParams.uri);
		const headers = new Headers(requestParams.headers || {});

		Object.entries(requestParams.qs || {}).forEach(([key, value]) => appendValues(url.searchParams, key, value));

		const options = {
			method: requestParams.method || 'GET',
			headers,
			redirect: 'manual'
		};

		if (this.cookies.size > 0) {
			headers.set('cookie', [...this.cookies.entries()].map(([key, value]) => `${key}=${value}`).join('; '));
		}

		if (requestParams.form) {
			const form = new URLSearchParams();
			Object.entries(requestParams.form).forEach(([key, value]) => appendValues(form, key, value));
			headers.set('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
			options.body = form;
		}

		const response = await this.fetch(url, options);
		const setCookies = typeof response.headers.getSetCookie === 'function'
			? response.headers.getSetCookie()
			: [response.headers.get('set-cookie')].filter(Boolean);

		setCookies.forEach((cookie) => {
			const [pair] = cookie.split(';');
			const separator = pair.indexOf('=');
			if (separator > 0) {
				this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
			}
		});

		return {
			body: await response.text(),
			headers: Object.fromEntries(response.headers.entries()),
			statusCode: response.status
		};
	}

	async getMock(name, requestParams) {
		const mockPath = path.resolve(PATH.mocks, `${name}.json`);

		try {
			await access(mockPath, constants.R_OK);
			return JSON.parse(await readFile(mockPath, 'utf8'));
		} catch {
			const response = await this.makeRequest(requestParams);
			await mkdir(path.dirname(mockPath), {recursive: true});
			await writeFile(mockPath, JSON.stringify({body: response.body}));
			return response;
		}
	}
}

let req;

const getClient = (options) => {
	if (!req) {
		req = new Req(options);
	}
	return req;
};

getClient.Req = Req;
getClient.reset = () => {
	req = undefined;
};

module.exports = getClient;
