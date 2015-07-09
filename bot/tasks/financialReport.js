var log = require('../../lib/log')('task_financial_report');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');
var moment = require('moment');

var requestParams = {
	uri: config.path.host + config.path.financial
};


var promise = Vow.promise();

var start = function() {
	log.profiler.start('task_financial_report');
	var request = global.butsaRequest;
	log.debug('[START] Get financial report promise');

	request.get(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error.message);
			promise.reject(error);
		}
		var $ = cheerio.load(body);

		var table = $('.maintable').first();
		var tr = table.find('tr');

		var toDay = moment().format('DD.MM.YY');

		var result = _.map(tr, function (trData) {
			trData = _.compact($(trData).text().split('\n'));
			if (_.includes(trData[0], toDay)) {
				return {
					date: trData[0],
					comment: trData[1],
					money: trData[2],
					contrAgent: trData[3],
					balance: trData[4]
				}
			}
			return ''
		});
		// Пушим для писем
		buffer.financialReport = {
			report: _.compact(result),
			settingsLink: config.path.host + config.path.financial
		};

		buffer.financialReportTitle = config.financial.report.label;
		log.debug('[COMPLETE] Get financial report promise', log.profiler.end('task_financial_report'));
		promise.fulfill('done!');
	});

	return promise;
};


module.exports = {
	start: start
};
