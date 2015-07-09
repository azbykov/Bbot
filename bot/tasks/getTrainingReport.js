var log = require('../../lib/log')('task_training_report');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');

var requestParams = {
	uri: config.path.host + config.path.training,
	qs: {act: 'report'}
};


var promise = Vow.promise();

var start = function() {
	log.profiler.start('task_training_report');
	var request = global.butsaRequest;
	log.debug('[START] Get training');

	request(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error);
			log.debug('error request with params', requestParams);
			promise.reject(error);
		}
		var $ = cheerio.load(body);

		var table = $('#mainarea_rigth table');

		var trainingObject = table.first().children('tr');
		var trainingProgress = getTrainingObj(trainingObject, $);
		var trainingRegress = getTrainingObj($(table[1]).children('tr'), $);


		buffer.training = {
			progress: trainingProgress,
			regress: trainingRegress,
			settingsLink: config.path.host + config.path.training,
			trainingsLeft: $('#mainarea_rigth').text().split('\n')[1]
		};
		buffer.trainingTitle = config.training.label;
		log.debug('[COMPLETE] Get training', log.profiler.end('task_training_report'));
		promise.fulfill('done!');
	});

	return promise;
};

module.exports = {
	start: start
};


var getTrainingObj = function(trs, $) {
	var result = [];
	_.each(trs, function(tr, i) {
		tr = $(tr);
		var trArr = [];
		if (i === 0) {
			trArr.push(tr.find('td:nth-child(3)').text());
			trArr.push('');
			trArr.push(tr.find('td:nth-child(5)').text());
			trArr.push(tr.find('td:nth-child(6)').text());
			trArr.push(tr.find('td:nth-child(7)').text());
			trArr.push(tr.find('td:nth-child(8)').text());
			trArr.push(tr.find('td:nth-child(9)').text());
			trArr.push(tr.find('td:nth-child(10)').text());
		} else {
			trArr.push(tr.find('td:nth-child(2) a').text());
			trArr.push(config.path.host + tr.find('td:nth-child(2) a').attr('href'));
			trArr.push(tr.find('td:nth-child(4) center').text());
			trArr.push(tr.find('td:nth-child(5) center').text());
			trArr.push(tr.find('td:nth-child(6) center').text());
			trArr.push(tr.find('td:nth-child(7) center').text());
			trArr.push(tr.find('td:nth-child(8) center').text());
			trArr.push(tr.find('td:nth-child(9) div').text());
		}

		result.push(trArr);
	});
	return result;
};
