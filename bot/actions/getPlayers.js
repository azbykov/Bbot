'use strict';

var log = require('../../lib/log')('action_getPlayers');
var config = require('config').bot;
var Vow = require('vow');

var players = Vow.promise();

var requestParams = {
	uri: config.path.protocol + config.path.domain + config.path.order
};
var get = function(request) {
	request.get(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error.message);
		}
		var regex = /PlayerID = "([0-9]+)"/ig;
		var result = body.match(regex);
		result = result.join(',').match(/([0-9]+)/ig);
		players.fulfill(result);
	});
	return players;
};

module.exports = {
	get: get
};

