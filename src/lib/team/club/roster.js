'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const {host} = require('../../../constants/uri');
const {getClubInfo} = require('../../../bot/actions/getClubInfo');

const getLink = (uri) => uri ? host + uri : '';

const getPlayers = ($) => {
	let trainingTable = $('.maintable')[2];

	trainingTable = $(trainingTable);

	const playersTr = trainingTable.find('tr:not([bgcolor="#D3E1EC"]):not([class="header"])');

	return _.map(playersTr, (playerSource) => {
		const playerParams = $(playerSource).find('td');

		return {
			id: $(playerParams[1]).find('a').attr('href').replace('/players/', ''),
			link: getLink($(playerParams[1]).find('a').attr('href')),
			physical: $(playerParams[7]).text().replace('\n', ''),
			tired: $(playerParams[8]).text().replace('\n', ''),
			rTotalSkill: $(playerParams[9]).text().replace('\n', ''),
			bonus: $(playerParams[12]).text().replace('\n', '').split(' '),
			points: $(playerParams[13]).text().replace('\n', '')
		};
	});
};

const getGoods = ($) => {
	const goods = $('img[title = "Товар на складе"]').next('b').children('a').text().split('.');

	return _.parseInt(goods[0] + goods[1]);
};

module.exports = ({body}) => {
	const $ = cheerio.load(body);

	const players = getPlayers($);
	const clubInfo = getClubInfo(body);
	const goods = getGoods($);

	return {
		players,
		clubInfo,
		goods
	};
};
