'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const {host} = require('../../../constants/uri');

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

const getClubInfo = ($) => {
	const clubInfoTable = $($('.maintable')[0]);
	const clubInfoTr = clubInfoTable.find('tr');

	const teamInfoTable = $($('.maintable')[1]);
	const teamInfoTableTr = teamInfoTable.find('tr');

	return {
		name: $(clubInfoTr[0]).find('a').text(),
		link: getLink($(clubInfoTr[0]).find('a').attr('href')),
		id: $(clubInfoTr[1]).find('input').attr('value'),
		manager: $(clubInfoTr[2]).find('a').text(),
		managerLink: getLink($(clubInfoTr[2]).find('a').attr('href')),
		rang: $(clubInfoTr[3]).find('a').text(),
		city: $(clubInfoTr[4]).find('input').attr('value'),
		stadium: [$(clubInfoTr[5]).find('a:first').text(), $(clubInfoTr[5]).find('a')[1].children[0].data],
		division: $(teamInfoTableTr[0]).find('a').text().split('-'),
		fund: $(teamInfoTableTr[1]).find('input').attr('value'),
		players: $(teamInfoTableTr[2]).find('a').text(),
		power: $(teamInfoTableTr[3]).find('a').text(),
		power11: $(teamInfoTableTr[4]).find('a').text(),
		viewerRating: $(teamInfoTableTr[5]).find('a').text()
	};
};

const getGoods = ($) => {
	const goods = $('img[title = "Товар на складе"]').next('b').children('a').text().split('.');

	return _.parseInt(goods[0] + goods[1]);
};

module.exports = ({body}) => {
	const $ = cheerio.load(body);

	const players = getPlayers($);
	const clubInfo = getClubInfo($);
	const goods = getGoods($);

	return {
		players,
		clubInfo,
		goods
	};
};
