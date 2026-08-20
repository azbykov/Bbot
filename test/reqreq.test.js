'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {Req} = require('../src/lib/reqreq');

test('Req stores response cookies and sends them with the next request', async() => {
	const calls = [];
	const fetchImpl = async(url, options) => {
		calls.push({url: String(url), options});
		if (calls.length === 1) {
			return new Response('authenticated', {
				status: 200,
				headers: {'set-cookie': 'session=abc123; Path=/; HttpOnly'}
			});
		}
		return new Response('club', {status: 200});
	};
	const client = new Req({fetchImpl});

	await client.request('auth', {uri: 'https://www.butsa.ru/login'});
	await client.request('club', {uri: 'https://www.butsa.ru/roster'});

	assert.equal(calls[1].options.headers.get('cookie'), 'session=abc123');
});

test('Req serializes query strings and indexed form arrays', async() => {
	let captured;
	const client = new Req({
		fetchImpl: async(url, options) => {
			captured = {url: String(url), options};
			return new Response('done', {status: 200});
		}
	});

	await client.request('training', {
		uri: 'https://www.butsa.ru/train',
		method: 'POST',
		qs: {act: 'select'},
		form: {
			PlayerID: ['10', '20'],
			PercentTrain: [100, 81]
		}
	});

	assert.equal(new URL(captured.url).searchParams.get('act'), 'select');
	assert.equal(captured.options.method, 'POST');
	assert.equal(captured.options.headers.get('content-type'), 'application/x-www-form-urlencoded; charset=UTF-8');
	assert.equal(String(captured.options.body), 'PlayerID%5B0%5D=10&PlayerID%5B1%5D=20&PercentTrain%5B0%5D=100&PercentTrain%5B1%5D=81');
});
