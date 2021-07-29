'use strict';

const log = require('../../lib/log')('task_junior_training_report');
const config = require('config').bot;
const buffer = require('../../lib/buffer');
const team = require('../../lib/team');
const {trainingJunior, host} = require('../../constants/uri');

const start = () => {
	log.profiler.start('task_junior_training_report');
	log.debug('[START] Get junior training');
	return team.youngs.value.then(({title, players, trainingsLeft}) => {
		buffer.trainingJunior = {
			title,
			progress: players,
			settingsLink: host + trainingJunior,
			trainingsLeft
		};
		buffer.trainingTitleJunior = config.trainingJunior.label;
		log.debug('[COMPLETE] Get junior training', log.profiler.end('task_junior_training_report'));
		return Promise.resolve('done!');
	});
};

module.exports = {start};
