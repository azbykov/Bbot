'use strict';

const log = require('../../lib/log')('task_near_match');
const config = require('config').bot;
const _ = require('lodash');
const buffer = require('../../lib/buffer');
const getImage = require('../actions/getImage');
const team = require('../../lib/team');

const start = () => {
	log.profiler.start('task_near_match');
	log.debug('[START] Get near Mathes');


	return team.nearMatch.value.then(({mathes}) => {

		// Пушим для писем
		buffer.matches = mathes;
		buffer.matchesTitle = config.nearMatch.label;

		return getEmblem(mathes).finally(() => {
			log.debug('[COMPLETE] Get near Match', log.profiler.end('task_near_match'));
		});
	});
};

const getEmblem = (matchesData) => {
	const imagesPromise = _.map(matchesData, (matchData) => {
		const emblem = matchData.emblemLink;
		if (emblem) {
			return getImage(emblem);
		}
		return null;
	});
	return Promise.all(imagesPromise).then((matchesEmblem) => {
		_.forEach(matchesData, (match, i) => {
			if (!(_.isEmpty(matchesEmblem) || _.isEmpty(matchesEmblem[i]))) {
				match.emblem = matchesEmblem[i].valueOf();
			}
		});
	});
};

module.exports = {start};
