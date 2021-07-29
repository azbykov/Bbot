'use strict';

const log = require('../../lib/log')('task_optimization_training');
const optimizeTraining = require('../actions/optimizeTraining');
const team = require('../../lib/team');
const {host, training} = require('../../constants/uri');


const start = () => {
	log.profiler.start('task_optimization_training');
	log.debug('[START] Optimization training');

	return new Promise((resolve, reject) => {
		team.club.value.then(({roster}) => {
			return optimizeTraining(roster).then(() => {
				log.info('Тренировки обновлены. Посмотреть ' + host + training);
				log.debug('[COMPLETE] Optimization training', log.profiler.end('task_optimization_training'));
				resolve('done!');
			}).catch((err) => {
				log.error('Что-то пошло не так. Ошибка: ' + err);
				reject(err);
			});
		});
	});
};

module.exports = {start};
