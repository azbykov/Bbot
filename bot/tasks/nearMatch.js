'use strict';

var log = require('../../lib/log')('task_near_match');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');
var getImage = require('../actions/getImage');

var team = require('../team');

var promise = Vow.promise();

var start = function() {
	log.profiler.start('task_near_match');
	var request = global.butsaRequest;
	log.debug('[START] Get near Mathes');

	return team.getOpponents().then((result)=> {
		// Пушим для писем
		buffer.matches = result;
		buffer.matchesTitle = config.nearMatch.label;

		return getEmblem(result).always(function() {
			log.debug('[COMPLETE] Get near Match', log.profiler.end('task_near_match'));
			promise.fulfill('done!');
		});
	});
};


var getEmblem = function(matchesData) {
	var imagesPromise = _.map(matchesData, function(matchData) {
		var emblem = matchData.emblemLink;
		if (emblem) {
			return getImage(emblem);
		}
		return null;
	});
	return Vow.allResolved(imagesPromise).then(function(matchesEmblem) {
		_.forEach(matchesData, function(match, i) {
			if (!(_.isEmpty(matchesEmblem) || _.isEmpty(matchesEmblem[i]))) {
				match.emblem = matchesEmblem[i].valueOf();
			}
		});
	});
};

module.exports = {
	start: start
};
