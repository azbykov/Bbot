'use strict';

const log = require('../../lib/log')('task_get_last_result');
const config = require('config').bot;
const _ = require('lodash');
const cheerio = require('cheerio');
const Vow = require('vow');
const buffer = require('../../lib/buffer');
const getImage = require('../actions/getImage');
const addComments = require('../actions/addComments');

let requestParams = {
	uri: config.path.host
};

const promise = Vow.promise();

const start = () => {
	log.profiler.start('task_get_last_result');
	const request = global.butsaRequest;
	log.debug('[START] Result match');

	log.profiler.start('get_match_id');
	log.debug('[START] Match id');
	const matchIdPromise = getMatchIdPromise();



	matchIdPromise.then((matchPath) => {
		log.debug('[COMPLETE] Match id', log.profiler.end('get_match_id'));
//		matchPath = '/matches/7675569';
		requestParams.uri = config.path.protocol + config.path.domain + matchPath;
		request.get(requestParams, (error, res, body) => {
			if (error) {
				log.error('error request', error);
				promise.reject(error);
			}

			let $ = cheerio.load(body);

			const table = $('#mainarea_rigth');
			const matchInfo = table.find('table').find('center');
			const host = config.path.host;
			const matchResult = {
				path: host + matchPath,
				date: matchInfo.find('b').first().text(),
				tournament: $(matchInfo.find('b')[1]).text(),
				result: matchInfo.find('h2').text(),
				audience: matchInfo.text().split('Зрители: ')[1],
				homeTeam: {
					imgLink: host + table.find('table td>img')[0].attribs.src,
					name: $(matchInfo.find('nobr a')[0]).text(),
					link: config.path.protocol + config.path.domain + $(matchInfo.find('nobr a')[0]).attr('href')
				},
				guestTeam: {
					imgLink: host + table.find('table td>img')[1].attribs.src,
					name: $(matchInfo.find('nobr a')[1]).text(),
					link: config.path.protocol + config.path.domain + $(matchInfo.find('nobr a')[1]).attr('href')
				}
			};

			const getImgPromise = Vow.allResolved([
				getImage(matchResult.homeTeam.imgLink),
				getImage(matchResult.guestTeam.imgLink)
			]).spread((homeImg, guestImg) => {
				matchResult.homeTeam.img = homeImg.valueOf();
				matchResult.guestTeam.img = guestImg.valueOf();
			});

			const legendaTr = $(table.find('table')[1]).find('tr');
			let legenda = [];

			_.forEach(legendaTr, (event) => {
				event = $(event);

				const result = {
					time: event.find('td:nth-child(1)').text(),
					eventTypeLink: host + event.find('td:nth-child(2) img').attr('src'),
					away: event.find('td:nth-child(3) img').attr('src').indexOf('away') > -1,
					result: event.find('td:nth-child(3)').text()
				};

				legenda.push(result);
			});

			matchResult.legenda = legenda;

			// Пушим для писем
			Vow.allResolved([
				getImgPromise,
				addComments($, matchResult)
			]).always(() => {
				buffer.matchResult = matchResult;
				buffer.matchResultTitle = config.resultMatches.label;
				log.debug('[COMPLETE] Result match', log.profiler.end('task_get_last_result'));
				promise.fulfill('done!');
			});
		});
	});

	return promise;
};


const getMatchIdPromise = () => {
	const promiseVow = Vow.promise();
	const request = global.butsaRequest;
	request.get(requestParams, (error, res, body) => {
		if (error) {
			log.error('error request', error.message);
			promiseVow.reject(error);
		}
		let $ = cheerio.load(body);
		const matchPath = $('img[alt="Отчет"]').first().parent().attr('href');
		promiseVow.fulfill(matchPath);
	});
	return promiseVow;
};

module.exports = {start};
