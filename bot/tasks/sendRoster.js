'use strict';

var log = require('../../lib/log')('task_roster');
var games = require('./../actions/getGames');
var players = require('./../actions/getPlayers');
var order = require('./../actions/getOrder');
var Vow = require('vow');



var start = function() {
	var request = global.butsaRequest;
	var promise = Vow.promise();
	games.get(request);
	games.games.done(function(gamesList) {
		if (gamesList.length === 0) {
			log.error('empty game list');
			promise.reject('Empty game list');
		}
		players.get(request).done(function() {

			gamesList.forEach(function(game) {
				log.info('Sending order for gameId %s', game);
				var options = {
					request: request, gameId: game
				};
				order.get(options);
				order.orders.done(function(params) {
					promise.done(params);
				});
			});
		});
	});
	return promise;
};

module.exports = {
	start: start
};
