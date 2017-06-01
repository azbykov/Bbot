'use strict';

const log = require('../../lib/log')('task_building');
const config = require('config').bot;
const _ = require('lodash');
const cheerio = require('cheerio');
const Vow = require('vow');
const reqreq = require('../../lib/reqreq');

const params = _.defaults(config.buildings.params, {});


let requestParams = {
	uri: config.path.host + config.path.buildings,
	method: 'POST',
	form: params
};

let label;

var start = () => {
	log.profiler.start('task_building');
	log.debug('[START] Repair buildings');
	return reqreq().request('task_building', requestParams, (res) => {
		const body = res.body;

		if (res.headers && res.headers.location) {
			log.debug('Check status');
			let uri = config.path.protocol + config.path.domain + res.headers.location;
			return reqreq().request('task_building', {uri}, (bres) => {
				const bBody = bres.body;
				if (err) {
					log.error('Eror request', err.message);
					return Vow.reject(err);
				}
				let $ = cheerio.load(bBody);
				label = $('#mainarea_rigth table td table').first().text();
				log.info(label);
				return Vow.resolve(label);
			});
		} else {
			let $ = cheerio.load(body);
			label = $('#mainarea_rigth table font').text();
			if (config.buildings.alreadyDone === label) {
				log.info(label);
			} else {
				log.error('Error repair all buildings. Result message:', label);
				log.debug('Error! ' + label + '. with params', requestParams.form);
			}
			log.debug('[COMPLETE] Repair buildings', log.profiler.end('task_building'));
			return Vow.resolve(label);
		}
	});
};

module.exports = {start};
