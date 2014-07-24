var log = require('../../lib/log')('task_building');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');

var params = _.defaults(config.buildings.params, {});


var requestParams = {
	uri: config.path.host + config.path.buildings,
	form: params
};

var buildings = Vow.promise();

var start = function() {
	var request = global.butsaRequest;
	log.debug('Start repair buildings');
	request.post(requestParams, function(error, res, body) {
		if (error) {
			log.error('Eror request', error.message);
			buildings.reject(error);
		}

		if (res.headers && res.headers.location) {
			log.debug('Check status');
			var uri = config.path.protocol + config.path.domain + res.headers.location;
			request.get(uri, function(err, res, body) {
				var $ = cheerio.load(body);
				var label = $('#mainarea_rigth table td table').first().text();
				log.info(label);
				buildings.fulfill(label);
			});
		} else {
			var $ = cheerio.load(body);
			var label = $('#mainarea_rigth table font').text();
			if (config.buildings.alreadyDone === label) {
				log.info(label);
			} else {
				log.error('Error repair all buildings. Result message:', label);
				log.debug('Error! ' + label +'. with params', requestParams.form);
			}
			buildings.fulfill(label);
		}
	});

	return buildings;
};

module.exports = {
	start: start
};
