'use strict';

const log = require('../../lib/log')('action_getPlayers');
const config = require('config').bot;
const Vow = require('vow');

const players = Vow.promise();

const requestParams = {
	uri: config.path.protocol + config.path.domain + config.path.order
};
const get = (request) => {
	request.get(requestParams, (error, res, body) => {
		if (error) {
			log.error('error request', error.message);
		}
		const regex = /PlayerID = "([0-9]+)"/ig;
		let result = body.match(regex);
		result = result.join(',').match(/([0-9]+)/ig);
		players.fulfill(result);
	});
	return players;
};

module.exports = {get};

