'use strict';
const {host} = require('../../../constants/uri');

const _ = require('lodash');
const cheerio = require('cheerio');

const getTrainingObj = (trs, $) => {
	let result = [];
	_.each(trs, (tr, i) => {
		tr = $(tr);
		let trArr = [];
		if (i === 0) {
			trArr.push(tr.find('td:nth-child(3)').text());
			trArr.push('');
			trArr.push(tr.find('td:nth-child(5)').text());
			trArr.push(tr.find('td:nth-child(6)').text());
			trArr.push(tr.find('td:nth-child(7)').text());
			trArr.push(tr.find('td:nth-child(8)').text());
			trArr.push(tr.find('td:nth-child(9)').text());
			trArr.push(tr.find('td:nth-child(10)').text());
		} else {
			trArr.push(tr.find('td:nth-child(2) a').text());
			trArr.push(host + tr.find('td:nth-child(2) a').attr('href'));
			trArr.push(tr.find('td:nth-child(4) center').text());
			trArr.push(tr.find('td:nth-child(5) center').text());
			trArr.push(tr.find('td:nth-child(6) center').text());
			trArr.push(tr.find('td:nth-child(7) center').text());
			trArr.push(tr.find('td:nth-child(8) center').text());
			trArr.push(tr.find('td:nth-child(9) div').text());
		}

		result.push(trArr);
	});
	return result;
};

module.exports = ({body}) => {
	const $ = cheerio.load(body);
	const table = $('#mainarea_rigth table');

	const trainingObject = table.first().find('tr');
	const trainingProgress = getTrainingObj(trainingObject, $);
	const trainingRegress = getTrainingObj($(table[1]).find('tr'), $);
	const trainingsLeft = $('#mainarea_rigth').text().split('\n')[1];

	return {
		trainingProgress,
		trainingRegress,
		trainingsLeft
	};
};
