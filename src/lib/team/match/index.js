'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const reqreq = require('../../reqreq');
const {host, office, protocol, domain} = require('../../../constants/uri');
const {TOURNAMENT_ID_MAP} = require('../../../constants/common');
const HOME_CHAR = 'д';

module.exports = {
	nearMatch() {
		const requestParams = {
			uri: host + office
		};

		return reqreq().request('request near match', requestParams, ({body}) => {
			const $ = cheerio.load(body);

			const trs = $($('.maintable')[0]).find('tr');

			const mathes = _.map(trs, (tr, i) => {
				const match = $(tr);

				if (i === 0) {
					return {};
				}

				const rivalTeamLink = protocol + domain + match.find('td:nth-child(5) center a').attr('href');
				const gameLink = protocol + domain + match.find('td:nth-child(7)').find('a').attr('href');
				const gameId = gameLink.split('id=')[1];

				const [tournament, tour] = match
					.find('td:nth-child(4)')
					.text()
					.replace('\n', '')
					.split(', ');
				const [rivalTeamName, whereGame] = match
					.find('td:nth-child(5)')
					.find('center')
					.text()
					.split(' (');

				const emblemLink = $('a[href="/matches/' + gameId + '"]')
					.find('img')
					.attr('src')
					? host + $('a[href="/matches/' + gameId + '"]')
						.find('img')
						.attr('src')
					: null;

				return {
					gid: match.find('td:nth-child(2)').find('center').text(),
					gameDate: match.find('td:nth-child(3)').find('center').text(),
					tournament: [tournament, tour].join(', '),
					tournamentId: TOURNAMENT_ID_MAP[tournament] || tournament,
					tourNumber: parseInt(tour, 10),
					rivalTeamName,
					isHome: whereGame.slice(0, -1) === HOME_CHAR,
					rivalTeamLink: rivalTeamLink,
					order: match.find('td:nth-child(6)').find('center').text(),
					link: gameLink,
					emblemLink
				};
			});

			// Убираем хеадер таблицы
			mathes.shift();

			return {
				mathes
			};
		});
	}
};
