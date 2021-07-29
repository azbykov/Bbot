'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const reqreq = require('../../reqreq');
const {host, office, protocol, domain} = require('../../../constants/uri');

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

				return {
					gid: match.find('td:nth-child(2)').find('center').text(),
					gameDate: match.find('td:nth-child(3)').find('center').text(),
					tournament: match.find('td:nth-child(4)').text().replace('\n', ''),
					rivalTeamName: match.find('td:nth-child(5)').find('center').text(),
					rivalTeamLink: rivalTeamLink,
					order: match.find('td:nth-child(6)').find('center').text(),
					link: gameLink,
					emblemLink: host + $('a[href="/matches/' + gameId + '"]').find('img').attr('src')
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
