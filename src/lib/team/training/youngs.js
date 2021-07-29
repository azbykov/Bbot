'use strict';

const cheerio = require('cheerio');
const _ = require('lodash');
const {host} = require('../../../constants/uri');

const TALENTS = [7, 8, 9];

const getYoungs = (tr) => {
	const playerName = tr.find('td:nth-child(2) a').text();
	const playerLink = tr.find('td:nth-child(2) a').attr('href')
		? host + tr.find('td:nth-child(2) a').attr('href')
		: '';
	const playerPos = tr.find('td:nth-child(4) center').text();
	const playerOld = tr.find('td:nth-child(5) center').text();
	const playerMas = tr.find('td:nth-child(6) center').text();
	const attrName = tr.find('td:nth-child(7) center').text();
	const playerParamUp = tr.find('td:nth-child(8) center').text();
	const playerParamTotal = tr.find('td:nth-child(9) div').text();
	const playerTalent = getPlayerTalent(attrName, playerMas, playerParamTotal);

	return {
		name: playerName,
		link: playerLink,
		pos: playerPos,
		old: playerOld,
		mas: playerMas,
		attrName: attrName,
		attrUp: playerParamUp,
		attrTotal: playerParamTotal,
		talent: playerTalent
	};
};

const getPlayerTalent = (attr, mas, attrTotal) => {
	if (attr.toLowerCase() !== 'талант') {
		return false;
	}
	return TALENTS.reduce((talents, talent2) => {
		if (talent2 >= attrTotal) {
			talents[talent2] = getTalentDays(mas, attrTotal, talent2);
		}

		return talents;
	}, {});
};

const getTalentDays = (mas, total, talent2 ) => {
	const a = 3.378;
	const b = 1638.976;
	const c = 48.095;
	const D1 = ((a * mas + b) / 100000) * (total - 1) * ((total - 1) * (total - 1) * (total - 1) + c * (total - 1) + 40)
		+ c * (total - 1) * (total - 1) * (total - 1) / 1000;
	const D2 = ((a * mas + b) / 100000) * (talent2 - 1) * ((talent2 - 1) * (talent2 - 1) * (talent2 - 1)
		+ c * (talent2 - 1) + 40) + c * (talent2 - 1) * (talent2 - 1) * (talent2 - 1) / 1000;
	return Math.ceil(D2) - Math.ceil(D1);
};

const getTitle = (tr) => [
	// name
	tr.find('td:nth-child(3)').text(),
	// pos
	tr.find('td:nth-child(5)').text(),
	// old
	tr.find('td:nth-child(6)').text(),
	// mas
	tr.find('td:nth-child(7)').text(),
	// attrName
	tr.find('td:nth-child(8)').text(),
	// attrUp
	tr.find('td:nth-child(9)').text(),
	// attrTotal
	tr.find('td:nth-child(10)').text(),
];

const getTrainingObj = (trs, $) => {
	return _.map(trs, (tr, i) => {
		tr = $(tr);
		let data;
		if (i === 0) {
			data = getTitle(tr);
		} else {
			data = getYoungs(tr);
		}
		return data;
	});
};

module.exports = ({body}) => {
	const $ = cheerio.load(body);

	const table = $('#mainarea_rigth table');
	const trainingObject = table.first().find('tr');

	const trainingProgress = getTrainingObj(trainingObject, $);
	const title = trainingProgress.shift();
	const trainingsLeft = $('#mainarea_rigth').text().split('\n')[1];

	return {
		title,
		trainingsLeft,
		players: trainingProgress
	};
};
