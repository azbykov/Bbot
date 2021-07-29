'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');

module.exports = ({body}) => {
	const $ = cheerio.load(body);

	let trainingTable = $('.maintable')[2];

	trainingTable = $(trainingTable);

	const playersTr = trainingTable.find('tr:not([bgcolor="#D3E1EC"]):not([class="header"])');

	const trainingData = _.map(playersTr, (playerSource) => {
		const playerParams = $(playerSource).find('td');

		return {
			id: $(playerParams[1]).find('a').attr('href').replace('/players/', ''),
			num: $(playerParams[0]).text().replace('\n', ''),
			name: $(playerParams[1]).text().replace('\n', ''),
			citizenship: $(playerParams[2]).find('img').attr('title'),
			position: $(playerParams[3]).text().replace('\n', '').toLowerCase().split('/')[0],
			age: $(playerParams[4]).text().replace('\n', ''),
			morale: $(playerParams[6]).text().replace('\n', ''),
			talent: $(playerParams[7]).text().replace('\n', ''),
			tLevel: $(playerParams[8]).text().replace('\n', ''),
			RTalent: $(playerParams[9]).text().replace('\n', ''),
			feature: $(playerParams[10]).find('a').attr('title').split(' - ')[0],
			salary: $(playerParams[11]).text().replace('\n', ''),
			seasonSalary: $(playerParams[12]).text().replace('\n', ''),
			price: $(playerParams[13]).text().replace('\n', ''),
		};
	});

	return trainingData;
};
