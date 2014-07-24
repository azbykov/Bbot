var log = require('../../lib/log')('task_get_last_result');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');
var getImage = require('../actions/getImage');

var requestParams = {
	uri: config.path.host
};


var promise = Vow.promise();

var start = function() {
	var request = global.butsaRequest;
	log.debug('Start result match');

	log.debug('get match id');
	var matchIdPromise = getMatchIdPromise();



	matchIdPromise.then(function(matchPath) {
//		matchPath = '/matches/7675569';
		requestParams.uri = config.path.protocol + config.path.domain + matchPath;
		request.get(requestParams, function(error, res, body) {
			if (error) {
				log.error('error request', error);
				promise.reject(error);
			}

			var $ = cheerio.load(body);

			var table = $('#mainarea_rigth');
			var matchInfo = table.find('table').find('center');
			var host = config.path.host;
			var matchResult = {
				path: host + matchPath,
				date: matchInfo.find('b').first().text(),
				tournament: $(matchInfo.find('b')[1]).text(),
				result: matchInfo.find('h2').text(),
				audience: matchInfo.text().split('Зрители: ')[1],
				homeTeam: {
					imgLink: host + table.find('table td>img')[0].attribs.src,
					name: $(matchInfo.find('nobr a')[0]).text()
				},
				guestTeam: {
					imgLink: host + table.find('table td>img')[1].attribs.src,
					name: $(matchInfo.find('nobr a')[1]).text()
				}
			};

			var getImgPromise = Vow.allResolved([
				getImage(matchResult.homeTeam.imgLink),
				getImage(matchResult.guestTeam.imgLink)
			]).spread(function(homeImg, guestImg) {
				matchResult.homeTeam.img = homeImg.valueOf();
				matchResult.guestTeam.img = guestImg.valueOf();
			});




			var legendaTr = $(table.find('table')[1]).find('tr');
			var legenda = [];

			_.forEach(legendaTr, function(event) {
				event = $(event);

				var result = {
					time: event.find('td:nth-child(1)').text(),
					eventTypeLink: host + event.find('td:nth-child(2) img').attr('src'),
					away: event.find('td:nth-child(3) img').attr('src').indexOf('away') > -1,
					result: event.find('td:nth-child(3)').text()
				};

				legenda.push(result);
			});

			matchResult.legenda = legenda;

			// Пушим для писем

			getImgPromise.always(function() {
				buffer.matchResult = matchResult;
				buffer.matchResultTitle = config.resultMatches.label;
				promise.fulfill('done!');
			});
		});



	});

	return promise;
};


var getMatchIdPromise = function() {
	var promise = Vow.promise();
	var request = global.butsaRequest;
	request.get(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error.message);
			promise.reject(error);
		}
		var $ = cheerio.load(body);
		var matchPath = $('img[alt="Отчет"]').first().parent().attr('href');
		promise.fulfill(matchPath);
	});
	return promise;
};

module.exports = {
	start: start
};
