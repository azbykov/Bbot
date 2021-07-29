'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');

module.exports = ({body}) => {
	const $ = cheerio.load(body);

	const depositTableTrs = $($('.maintable')).find('tr');

	if (depositTableTrs.length === 0) {
		return {};
	}

	const deposits = _.map(depositTableTrs, ((dep, i) => {

		// Заголовки не обходим
		if (i === 0) {
			return {};
		}

		// Строка суммарная по всем вкладам
		if (i === depositTableTrs.length - 1) {
			const col = $(dep).find('td');

			return {
				sum: +($(col[1]).text().split('.').join('')),
				income: +($(col[4]).text().split('.').join('')),
				returnCommission: +($(col[5]).text().split('.').join(''))
			};
		}

		const trData = _.compact($(dep).text().split('\n'));


		return {
			sum: +(trData[1].split('.').join('')),
			rate: +(trData[2].split('.').join('')),
			toursLeft: +(trData[3]),
			income: +(trData[4].split('.').join('')),
			returnCommission: +(trData[5].split(' ')[0])
		};
	}));

	deposits.shift();
	const total = deposits.pop();

	return {
		deposits,
		total
	};

};
