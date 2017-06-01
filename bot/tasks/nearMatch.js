'use strict';

const log = require('../../lib/log')('task_near_match');
const config = require('config').bot;
const _ = require('lodash');
const cheerio = require('cheerio');
const Vow = require('vow');
const buffer = require('../../lib/buffer');
const getImage = require('../actions/getImage');
const team = require('../../lib/Team');

const start = () => {
	log.profiler.start('task_near_match');
	log.debug('[START] Get near Mathes');

	return team.nearMatch.value.then((body) => {
		const $ = cheerio.load(body);
		// center
		let table = $('.maintable').find('img[src="http://butsa.ru/images/icons/edit.png"]').parent();
		// a
		table = $(table).parent();
		//td
		table = $(table).parent();
		//tr
		table = $(table).parent();
		// table
		table = $(table).parent();

		const tr = table.find('tr');
		let result = [];
		tr.each((i, match) => {
			match = $(match);
			if (i > 0 && match.find('td:nth-child(7)').find('a').attr('href')) {
				const rivalTeamLink = config.path.protocol + config.path.domain + match.find('td:nth-child(5) center a').attr('href');
				const gameLink = config.path.protocol + config.path.domain + match.find('td:nth-child(7)').find('a').attr('href');
				const gameId = gameLink.split('id=')[1];
				const matchData = {
					gid: match.find('td:nth-child(2)').find('center').text(),
					gameDate: match.find('td:nth-child(3)').find('center').text(),
					tournament: match.find('td:nth-child(4)').text(),
					rivalTeamName: match.find('td:nth-child(5)').find('center').text(),
					rivalTeamLink: rivalTeamLink,
					order: match.find('td:nth-child(6)').find('center').text(),
					link: gameLink,
					emblemLink: $('a[href="/matches/' + gameId + '"]').find('img').attr('src')
				};
				result.push(matchData);
			}
		});

		// Пушим для писем
		buffer.matches = result;
		buffer.matchesTitle = config.nearMatch.label;

		return getEmblem(result).always(() => {
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
	return Vow.allResolved(imagesPromise).then((matchesEmblem) => {
		_.forEach(matchesData, (match, i) => {
			if (!(_.isEmpty(matchesEmblem) || _.isEmpty(matchesEmblem[i]))) {
				match.emblem = matchesEmblem[i].valueOf();
			}
		});
	});
};

module.exports = {start};
