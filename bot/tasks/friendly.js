var log = require('../../lib/log')('task_friendly');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');

var params = _.defaults(config.friendly, {
	step: 1,
	type: 'office/organizer',
	act: 'friendly',
	Type: 0,
	minvr: 1, 	// Минимальный ЗР
	minp11: 1, 	// Минимальная средняя С11
	maxp11: 200 // Максимальная средняя С11
});


var requestParams = {
	uri: config.path.protocol + config.path.domain + config.path.friendly,
	form: params
};

var friendlyPromise = Vow.promise();

var start = function() {
	var request = global.butsaRequest;
	log.info('start friendly');
	request.post(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error.message);
			friendlyPromise.reject(error);
		}

		if (res.headers && res.headers.location) {
			log.info('check status');
			var uri = config.path.protocol + config.path.domain + res.headers.location;
			request.get(uri, function(err, res, body) {
				var $ = cheerio.load(body);
				var label = $('#mainarea_rigth table td').first().text();
				log.info('status: ' + label);
				friendlyPromise.fulfill(label);
			})
		} else {
			var $ = cheerio.load(body);
			var label = $('#mainarea_rigth table font').text();
			log.error('Error post friendly with params:\n', params, '\n Result message:', label);
			friendlyPromise.fulfill(label);
		}
	});
	return friendlyPromise;
};

module.exports = {
	start: start
};
