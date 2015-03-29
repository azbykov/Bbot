var log = require('../../lib/log')('task_near_match');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');
var getImage = require('../actions/getImage');

var requestParams = {
	uri: config.path.host + config.path.office
};

var promise = Vow.promise();

var start = function() {
	var request = global.butsaRequest;
	log.debug('Start get near promise');

	request.get(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error.message);
			promise.reject(error);
		}
		var $ = cheerio.load(body);
		var table = $('.maintable').first();
		var tr = table.find('tr');
		var result = [];
		tr.each(function(i, match) {
			match = $(match);
			if (i > 0 && match.find('td:nth-child(7)').find('a').attr('href')) {
				var rivalTeamLink = config.path.protocol + config.path.domain + match.find('td:nth-child(5) center a').attr('href');
				var gameLink = config.path.protocol + config.path.domain + match.find('td:nth-child(7)').find('a').attr('href');
				var gameId = gameLink.split('id=')[1];
				var matchData = {
					gid: match.find('td:nth-child(2)').find('center').text(),
					gameDate: match.find('td:nth-child(3)').find('center').text(),
					tournament: match.find('td:nth-child(4)').text(),
					rivalTeamName: match.find('td:nth-child(5)').find('center').text(),
					rivalTeamLink: rivalTeamLink,
					order: match.find('td:nth-child(6)').find('center').text(),
					link: gameLink,
					emblemLink: $('a[href="/matches/' + gameId + '"]').find('img').attr('src')
				};
				result.push(matchData);
			}
		});
		// Пушим для писем
		buffer.matches = result;
		buffer.matchesTitle = config.nearMatch.label;
		getEmblem(result).always(function () {
			promise.fulfill('done!');
		});
	});

	return promise;
};


var getEmblem = function (matchesData) {
	var imagesPromise = _.map(matchesData, function (matchData) {
		var emblem = matchData.emblemLink;
		return getImage(emblem);
	});
	return Vow.allResolved(imagesPromise).then(function (matchesEmblem) {
		_.forEach(matchesData, function (match, i) {
			if (!(_.isEmpty(matchesEmblem) || _.isEmpty(matchesEmblem[i]))) {
				match.emblem = matchesEmblem[i].valueOf();
			}
		});
	});
};

module.exports = {
	start: start
};
