'use strict';

var log = require('../../lib/log')('task_friendly');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');

var params = _.defaults(config.friendly.params, {});


var requestParams = {
	uri: config.path.host + config.path.friendly,
	form: params
};

var friendlyPromise = Vow.promise();

var start = function() {
	log.profiler.start('task_friendly');
	var request = global.butsaRequest;
	log.debug('[START] Friendly');
	request.post(requestParams, function(error, res, body) {
		if (error) {
			log.error('Error request', error.message);
			friendlyPromise.reject(error);
		}

		if (res.headers && res.headers.location) {
			log.debug('Check status');
			var uri = config.path.protocol + config.path.domain + res.headers.location;
			request.get(uri, function(err, bRes, bBody) {
				if (err) {
					log.error('Error request', err.message);
					friendlyPromise.reject(err);
				}
				var $ = cheerio.load(bBody);
				var label = $('#mainarea_rigth table td table').first().text();
				log.info(label);
				friendlyPromise.fulfill(label);
			});
		} else {
			var $ = cheerio.load(body);
			var label = $('#mainarea_rigth table font').text();
			if (config.friendly.alreadyDone === label) {

				log.info(label);
			} else {
				log.error('Error repair all buildings. Result message:', label);
				log.debug('Error! ' + label + '. with params', requestParams.form);
			}
			log.debug('[COMPLETE] Friendly', log.profiler.end('task_friendly'));
			friendlyPromise.fulfill(label);
		}
	});
	return friendlyPromise;
};

module.exports = {
	start: start
};
