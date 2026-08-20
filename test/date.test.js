'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {formatLogTimestamp, isWithinPastDays, parseButsaDate} = require('../src/lib/date');

test('parseButsaDate parses the game DD.MM.YY format', () => {
	const result = parseButsaDate('19.08.26');

	assert.equal(result.getFullYear(), 2026);
	assert.equal(result.getMonth(), 7);
	assert.equal(result.getDate(), 19);
});

test('isWithinPastDays uses calendar days and rejects future dates', () => {
	const now = new Date(2026, 7, 20, 23, 59);

	assert.equal(isWithinPastDays(new Date(2026, 7, 19, 0, 1), 1, now), true);
	assert.equal(isWithinPastDays(new Date(2026, 7, 18), 1, now), false);
	assert.equal(isWithinPastDays(new Date(2026, 7, 21), 1, now), false);
});

test('formatLogTimestamp uses a stable local log format', () => {
	const value = new Date(2026, 7, 20, 14, 5, 6, 7);

	assert.equal(formatLogTimestamp(value), '20-08-2026 14:05:06:007');
});
