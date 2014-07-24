var log = require('../../lib/log')('task_near_match');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');

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
				var matchData = {
					gid: match.find('td:nth-child(2)').find('center').text(),
					gameDate: match.find('td:nth-child(3)').find('center').text(),
					tournament: match.find('td:nth-child(4)').text(),
					rivalTeamName: match.find('td:nth-child(5)').find('center').text(),
					order: match.find('td:nth-child(6)').find('center').text(),
					link: config.path.protocol + config.path.domain + match.find('td:nth-child(7)').find('a').attr('href')
				};
				result.push(matchData);
			}
		});
		// Пушим для писем
		buffer.matches = result;
		buffer.matchesTitle = config.nearMatch.label;
		promise.fulfill('done!');
	});

	return promise;
};

module.exports = {
	start: start
};
