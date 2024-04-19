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

		const skills = {
			otbor: $(playerParams[6]).text().replace('\n', ''),
			opeka: $(playerParams[7]).text().replace('\n', ''),
			dribl: $(playerParams[8]).text().replace('\n', ''),
			priem: $(playerParams[9]).text().replace('\n', ''),
			vinoslevost: $(playerParams[10]).text().replace('\n', ''),
			pas: $(playerParams[11]).text().replace('\n', ''),
			silaUdara: $(playerParams[12]).text().replace('\n', ''),
			tothnostUdara: $(playerParams[13]).text().replace('\n', '')
		};

		const lastTrainingVal = playerParams.find('.trained_ability').text().replace('\n', '');

		return {
			id: $(playerParams[1]).find('a').attr('href').replace('/players/', ''),
			totalSkill: $(playerParams[5]).text().replace('\n', ''),
			skills,
			lastTraining: _.findKey(skills, (chr) => {
				return chr === lastTrainingVal;
			})
		};
	});

	return trainingData;
};
