'use strict';

const _ = require('lodash');
const reqreq = require('../../reqreq');
const cheerio = require('cheerio');
const {host, financial, deposit: depositPath} = require('../../../constants/uri');
const depositHandler = require('./deposit');

const office = {
	finance() {
		const requestParams = {
			uri: host + financial
		};

		return reqreq().request('request finance', requestParams, ({body}) => {
			const $ = cheerio.load(body);

			const table = $('.maintable').first();
			const tr = table.find('tr');

			const result = _.map(tr, (trData) => {
				trData = _.compact($(trData).text().split('\n'));

				return {
					date: trData[0],
					comment: trData[1],
					money: trData[2],
					contrAgent: trData[3],
					balance: trData[4]
				};
			});
			result.shift();
			result.pop();

			return result;
		});
	},
	deposit() {
		const requestParams = {
			uri: host + depositPath
		};

		return reqreq().request('request deposit', requestParams, depositHandler);
	}
};

module.exports = office;
