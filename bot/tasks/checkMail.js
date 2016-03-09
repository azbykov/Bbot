'use strict';

var log = require('../../lib/log')('task_check_mail');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');

var requestParams = {
	uri: config.path.host + config.path.mail
};


var promise = Vow.promise();

var start = function() {
	log.profiler.start('test');
	var request = global.butsaRequest;
	log.debug('[START] Check mail');

	request(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error);
			log.debug('error request with params', requestParams);
			promise.reject(error);
		}
		var $ = cheerio.load(body);

		var mails = $('.maintable').find('tr:not([bgcolor="#D3E1EC"])');
		var notReadedMails = mails.find('td a b');

		buffer.mails = _.map(notReadedMails, function(mail) {
			var title = $(mail).text();
			var link = config.path.host + $(mail).parent().attr('href');
			return {
				title: title,
				link: link
			};
		});
		buffer.mailTitle = config.mail.label;
		log.debug('[COMPLETE] Check mail', log.profiler.end('test'));
		promise.fulfill('done!');
	});

	return promise;
};

module.exports = {
	start: start
};
