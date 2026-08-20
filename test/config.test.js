'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

test('config reads the documented BUTSA authentication variables', () => {
	const previousLogin = process.env.BUTSA_LOGIN;
	const previousPassword = process.env.BUTSA_PASSWORD;
	process.env.BUTSA_LOGIN = 'test-login';
	process.env.BUTSA_PASSWORD = 'test-password';

	delete require.cache[require.resolve('../config/default')];
	const config = require('../config/default');

	assert.equal(config.bot.auth.login, 'test-login');
	assert.equal(config.bot.auth.password, 'test-password');

	if (previousLogin === undefined) delete process.env.BUTSA_LOGIN;
	else process.env.BUTSA_LOGIN = previousLogin;
	if (previousPassword === undefined) delete process.env.BUTSA_PASSWORD;
	else process.env.BUTSA_PASSWORD = previousPassword;
	delete require.cache[require.resolve('../config/default')];
});
