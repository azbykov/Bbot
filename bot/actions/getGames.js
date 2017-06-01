'use strict';

const log = require('../../lib/log')('action_getGames');
const config = require('config').bot;
const Vow = require('vow');
const cheerio = require('cheerio');
const games = Vow.promise();

const requestParams = {
	uri: config.path.protocol + config.path.domain + config.path.office
};

const get = (request) => {
	log.profiler.start('action_getGames');
	log.info('[START] Get games');
	request.get(requestParams, (error, res, body) => {
		if (error) {
			log.error('error request', error.message);
		}
		const gamesList = getGamesList(body);
		games.fulfill(gamesList);
		log.info('[COMPLETE] Get games', log.profiler.end('action_getGames'));
	});
};

const getGamesList = (body) => {
	const $ = cheerio.load(body);
	const result = [];
	const inputs = $('input[name^="MatchID"]');
	for (let key in inputs) {
		if (inputs[key].attribs) {
			result.push(inputs[key].attribs.value);
		}
	}
	return result;
};

module.exports = {
	games,
	get
};

