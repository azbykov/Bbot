'use strict';

const log = require('../../lib/log')('task_goods');
const config = require('config').bot;
const _ = require('lodash');
const cheerio = require('cheerio');
const reqreq = require('../../lib/reqreq');
const team = require('../../lib/team');

const params = _.defaults(config.goods.params, {});
const MAX_GOODS = config.goods.goods * config.goods.games;
const {goods: goodsPath, host, domain, protocol} = require('../../constants/uri');

let requestParams = {
	uri: host
};

const start = () => {
	let label = '';
	log.profiler.start('task_goods');
	log.debug('[START] Buy goods');

	return team.club.value.then(({goods}) => {
		if (goods < MAX_GOODS) {
			requestParams = {
				uri: requestParams.uri + goodsPath,
				method: 'POST',
				form: params
			};
			requestParams.form.Amount = (MAX_GOODS - goods);
			return reqreq().request('task_goods', requestParams, ({headers, body}) => {
				if (headers && headers.location) {
					log.debug('Check status');
					const uri = protocol + domain + headers.location;
					reqreq().request('task_goods', {uri}, ({body: bBody}) => {
						let $ = cheerio.load(bBody);
						label = $('#mainarea_rigth table td table').first().text();

						log.info(label + '(' + goods + ' ед.)' + '. Товара на складе '
								+ (requestParams.form.Amount + goods) + ' ед.');

						log.debug('[COMPLETE] Buy goods', log.profiler.end('task_goods'));
					});
				} else {
					let $ = cheerio.load(body);
					label = $('#mainarea_rigth table font').text();
					log.error('Error post buy goods message:' + label);
					log.debug('Error! ' + label + '. with params', requestParams.form);

					if (label === 'Не хватает денег') {
						log.info(`${label} на покупку товаров`);
					}
				}
				return Promise.resolve(label);
			});
		} else {
			label = 'Товара на складе уже закупленно ' + goods + ' ед.';
			log.info(label);
			log.debug('[COMPLETE] Buy goods', log.profiler.end('task_goods'));
			return Promise.resolve(label);
		}
	});
};

module.exports = {start};
