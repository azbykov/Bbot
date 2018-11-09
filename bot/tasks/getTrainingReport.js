'use strict';

const config = require('config').bot;
const log = require('../../lib/log')('task_training_report');
const _ = require('lodash');
const cheerio = require('cheerio');
const Vow = require('vow');
const buffer = require('../../lib/buffer');
const team = require('../../lib/Team');

const start = () => {
	log.profiler.start('task_training_report');
	log.debug('[START] Get training');

	return team.players.value.then((body) => {
		const $ = cheerio.load(body);
		const table = $('#mainarea_rigth table');

		const trainingObject = table.first().children('tr');
		const trainingProgress = getTrainingObj(trainingObject, $);
		const trainingRegress = getTrainingObj($(table[1]).children('tr'), $);

		buffer.training = {
			progress: trainingProgress,
			regress: trainingRegress,
			settingsLink: config.path.host + config.path.training,
			trainingsLeft: $('#mainarea_rigth').text().split('\n')[1]
		};
		buffer.trainingTitle = config.training.label;
		log.debug('[COMPLETE] Get training', log.profiler.end('task_training_report'));
		return Vow.resolve('done!');
	});
};


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
			trArr.push(config.path.host + tr.find('td:nth-child(2) a').attr('href'));
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

module.exports = {start};
