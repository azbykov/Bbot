const config = require('config').bot;
const log = require('../../lib/log')('task_training_report');
const buffer = require('../../lib/buffer');
const team = require('../../lib/team');
const {training, host} = require('../../constants/uri');

const start = () => {
	log.profiler.start('task_training_report');
	log.debug('[START] Get training');

	return team.trainingMainTeam.value.then(({trainingProgress, trainingRegress, trainingsLeft}) => {
		buffer.training = {
			trainingsLeft,
			progress: trainingProgress,
			regress: trainingRegress,
			settingsLink: host + training
		};
		buffer.trainingTitle = config.training.label;
		log.debug('[COMPLETE] Get training', log.profiler.end('task_training_report'));

		return Promise.resolve('done!');
	});
};

module.exports = {start};
