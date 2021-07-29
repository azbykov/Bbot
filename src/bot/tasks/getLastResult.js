const log = require('../../lib/log')('task_get_last_result');
const config = require('config').bot;
const _ = require('lodash');
const cheerio = require('cheerio');
const buffer = require('../../lib/buffer');
const getImage = require('../actions/getImage');
const addComments = require('../actions/addComments');
const reqreq = require('../../lib/reqreq');
const {protocol, domain, host} = require('../../constants/uri');

let requestParams = {
	uri: host
};

const start = () => {
	log.profiler.start('task_get_last_result');
	log.debug('[START] Result match');

	log.profiler.start('get_match_id');
	log.debug('[START] Match id');

	return getMatchIdPromise().then((matchPath) => {
		log.debug(`[COMPLETE] Match id ${matchPath}`, log.profiler.end('get_match_id'));
		requestParams.uri = protocol + domain + matchPath;
		return reqreq().request('task_get_last_result', requestParams, ({body}) => {
			let $ = cheerio.load(body);

			const table = $('#mainarea_rigth');
			const matchInfo = table.find('table').find('center');
			const matchResult = {
				path: host + matchPath,
				date: matchInfo.find('b').first().text(),
				tournament: $(matchInfo.find('b')[1]).text(),
				result: matchInfo.find('h2').text(),
				audience: matchInfo.text().split('Зрители: ')[1],
				homeTeam: {
					imgLink: host + table.find('table td>img')[0].attribs.src,
					name: $(matchInfo.find('nobr a')[0]).text(),
					link: protocol + domain + $(matchInfo.find('nobr a')[0]).attr('href')
				},
				guestTeam: {
					imgLink: host + table.find('table td>img')[1].attribs.src,
					name: $(matchInfo.find('nobr a')[1]).text(),
					link: protocol + domain + $(matchInfo.find('nobr a')[1]).attr('href')
				}
			};

			const getImgPromise = Promise.all([
				getImage(matchResult.homeTeam.imgLink),
				getImage(matchResult.guestTeam.imgLink)
			]).then(([homeImg, guestImg]) => {
				matchResult.homeTeam.img = homeImg.valueOf();
				matchResult.guestTeam.img = guestImg.valueOf();
			});

			const legendaTr = $(table.find('table')[1]).find('tr');

			matchResult.legenda = _.map(legendaTr, (event) => {
				event = $(event);

				return {
					time: event.find('td:nth-child(1)').text(),
					eventTypeLink: host + event.find('td:nth-child(2) img').attr('src'),
					away: event.find('td:nth-child(3) img').attr('src').indexOf('away') > -1,
					result: event.find('td:nth-child(3)').text()
				};
			});

			// Пушим для писем
			return Promise.all([
				getImgPromise,
				addComments($, matchResult)
			]).then(() => {
				buffer.matchResult = matchResult;
				buffer.matchResultTitle = config.resultMatches.label;
				log.debug('[COMPLETE] Result match', log.profiler.end('task_get_last_result'));
				return 'done';
			}).catch((err) => {
				throw new Error(err);
			});
		});
	});
};

const getMatchIdPromise = () => {
	return new Promise((resolve, reject) => {
		reqreq().request('getMatchIdPromise', requestParams, ({body}) => {
			let $ = cheerio.load(body);
			const matchPath = $('img[alt="Отчет"]').first().parent().attr('href');
			resolve(matchPath);
		}).catch((err) => reject(err));
	});
};

module.exports = {start};
