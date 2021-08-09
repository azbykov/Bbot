'use strict';

const log = require('../../lib/log')('task_optimization_training');
const optimizeTicketPrice = require('../actions/optimizeTicketPrice');
const team = require('../../lib/team');
const {host, tickets} = require('../../constants/uri');


const start = async () => {
	log.profiler.start('task_optimal_ticket_price');
	log.debug('[START] Optimization ticket price');

	try {
		const {clubInfo} = await team.club.value;
		const {mathes} = await team.nearMatch.value;
		console.log('------ START -----');
		console.log('setOptimalTicketPrice.js; line: 16');
		console.log({mathes, clubInfo});
		console.log('------- END -------');

		if (!mathes) {
			return Promise.resolve();
		}

		return Promise.all(mathes.map((match) => optimizeTicketPrice(match, clubInfo)));
	} catch (err) {
		log.error('Что-то пошло не так. Ошибка: ' + err);

		return new Error(err);
	}
};

module.exports = {start};
