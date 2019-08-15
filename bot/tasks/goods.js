'use strict';

const log = require('../../lib/log')('task_goods');
const config = require('config').bot;
const _ = require('lodash');
const cheerio = require('cheerio');
const Vow = require('vow');
const reqreq = require('../../lib/reqreq');

const params = _.defaults(config.goods.params, {});


let requestParams = {
	uri: config.path.host
};


const start = () => {
	let label = '';
	log.profiler.start('task_goods');
	log.debug('[START] Buy goods');
	return reqreq().request('task_goods', requestParams, ({body}) => {
		let $ = cheerio.load(body);
		const goods = $('img[title = "Товар на складе"]').next('b').children('a').text().split('.');
		return _.parseInt(goods[0] + goods[1]);
	}).then((currGoods) => {
		const maxGoods = config.goods.goods * config.goods.games;
		if (currGoods < maxGoods) {
			requestParams = {
				uri: requestParams.uri + config.path.goods,
				method: 'POST',
				form: params
			};
			requestParams.form.Amount = (maxGoods - currGoods);
			return reqreq().request('task_goods', requestParams, ({headers, body}) => {
				if (headers && headers.location) {
					log.debug('Check status');
					const uri = config.path.protocol + config.path.domain + headers.location;
					reqreq().request('task_goods', {uri}, ({body: bBody}) => {
						let $ = cheerio.load(bBody);
						label = $('#mainarea_rigth table td table').first().text();

						log.info(label + '(' + currGoods + ' ед.)' + '. Товара на складе '
								+ (requestParams.form.Amount + currGoods) + ' ед.');

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
				return Vow.resolve(label);
			});
		} else {
			label = 'Товара на складе уже закупленно ' + currGoods + ' ед.';
			log.info(label);
			log.debug('[COMPLETE] Buy goods', log.profiler.end('task_goods'));
			return Vow.resolve(label);
		}
	});
};

module.exports = {start};
