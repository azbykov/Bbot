'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const mailer = require('../src/lib/mailer/mailer');
const {renderTemplate} = mailer;

test('mailer renders the existing EJS error template without sending', async() => {
	const rendered = await renderTemplate('error', {
		header: {
			date: '20 августа 2026',
			title: 'Test error'
		},
		content: [],
		error: 'Example'
	});

	assert.match(rendered.html, /Test error/);
	assert.match(rendered.text, /Test error/);
});

test('mailer renders the daily template and its nested includes', async() => {
	const rendered = await renderTemplate('daily_old', {
		header: {
			date: '20 августа 2026',
			title: 'Daily report'
		},
		content: {log: []},
		alerts: [],
		team: {id: '42', name: 'Bbot FC'}
	});

	assert.match(rendered.html, /Daily report/);
	assert.match(rendered.html, /Bbot FC/);
	assert.match(rendered.text, /Daily report/);
});

test('mailer send path does not require the optional preview-email package', async() => {
	const result = await mailer('error', {
		header: {
			date: '20 августа 2026',
			title: 'Preview disabled'
		},
		content: [],
		error: 'Example'
	}, {
		to: 'test@example.com',
		subject: 'Mailer regression test'
	});

	assert.match(result.originalMessage.html, /Preview disabled/);
});
