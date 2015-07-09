var log = require('../../lib/log')('action_getGames');
var config = require('config').bot;
var Vow = require('vow');
var cheerio = require('cheerio');
var _ = require('lodash');

module.exports.games = games = Vow.promise();

var requestParams = {
	uri: config.path.protocol + config.path.domain + config.path.office
};

module.exports.get = get = function(request) {
	log.profiler.start('action_getGames');
	log.info('[START] Get games');
	request.get(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error.message)
		}
		var gamesList = getGamesList(body);
		games.fulfill(gamesList);
		log.info('[COMPLETE] Get games', log.profiler.end('action_getGames'));
	});
};

var getGamesList = function(body) {
	var $ = cheerio.load(body);
	var result = [];
	var inputs = $('input[name^="MatchID"]');
	for (var key in inputs) {
		if (inputs[key].attribs) {
			result.push(inputs[key].attribs.value);
		}
	}
	return result;
};

