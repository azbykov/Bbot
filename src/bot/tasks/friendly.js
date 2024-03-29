const log = require('../../lib/log')('task_friendly');
const config = require('config').bot;
const _ = require('lodash');
const cheerio = require('cheerio');
const reqreq = require('../../lib/reqreq');
const {protocol, domain, host, friendly} = require('../../constants/uri');

const params = _.defaults(config.friendly.params, {});

const requestParams = {
	uri: host + friendly,
	method: 'POST',
	form: params
};

const start = () => {
	log.profiler.start('task_friendly');
	log.debug('[START] Send friendly games');
	return reqreq().request('request_friendly', requestParams, (res) => {
		const body = res.body;

		if (res.headers && res.headers.location) {
			log.debug('Check status');
			const uri = protocol + domain + res.headers.location;

			return reqreq().request('task_check_friendly_status', {uri}, (checkRes) => {
				const bBody = checkRes.body;
				const $ = cheerio.load(bBody);
				const label = $('#mainarea_rigth table td table').first().text();
				log.debug('[COMPLETE] Friendly' + label, log.profiler.end('task_friendly'));
				return Promise.resolve(label);
			});
		} else {
			const $ = cheerio.load(body);
			const label = $('#mainarea_rigth table font').text();
			if (config.friendly.alreadyDone === label) {
				log.info(label);
			} else {
				log.error('Error friendly games. Result message:', label);
				log.debug('Error! ' + label + '. with params', requestParams.form);
			}
			log.debug('[COMPLETE] Friendly', log.profiler.end('task_friendly'));
			return Promise.resolve(label);
		}
	});
};

module.exports = {start};
