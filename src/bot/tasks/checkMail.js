const log = require('../../lib/log')('task_check_mail');
const config = require('config').bot;
const _ = require('lodash');
const cheerio = require('cheerio');
const buffer = require('../../lib/buffer');
const reqreq = require('../../lib/reqreq');
const {host, mail: mailPath} = require('../../constants/uri');

const requestParams = {
	uri: host + mailPath
};

const start = () => {
	log.profiler.start('check_mail');
	log.debug('[START] Check mail');

	return reqreq().request('request check mail', requestParams, (res) => {
		const body = res.body;
		const $ = cheerio.load(body);

		const mails = $('.maintable').find('tr:not([bgcolor="#D3E1EC"])');
		const notReadedMails = mails.find('td a b');

		buffer.mails = _.map(notReadedMails, (mail) => {
			const title = $(mail).text();
			const link = host + $(mail).parent().attr('href');
			return {
				title: title,
				link: link
			};
		});
		buffer.mailTitle = config.mail.label;
		log.debug('[COMPLETE] Check mail', log.profiler.end('check_mail'));
		return Promise.resolve('Done!');
	});
};

module.exports = {start};
