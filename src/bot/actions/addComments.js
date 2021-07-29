'use strict';

const log = require('../../lib/log')('action_addComment');
const commentText = require('../../constants/comments');
const _ = require('lodash');
const reqreq = require('../../lib/reqreq');

const MATCH_STATE = {
	1: 'win',
	x: 'draw',
	2: 'lose'
};

const getAvailableComments = (state) => _.union(commentText.common, commentText[state] || []);

const getMatchResult = ($, match) => {
	const formPress = $('form[name="press"]');
	const ourTeam = $(formPress.prev('b').find('a')[1]).text();
	let result = match.result.split(':');

	result = _.map(result, (res) => Number(res));

	if (result[0] > result[1]) {
		result = (match.guestTeam.name === ourTeam) ? 2 : 1;
	} else if (result[0] === result[1]) {
		result = 'x';
	} else {
		result = (match.guestTeam.name === ourTeam) ? 1 : 2;
	}
	return MATCH_STATE[result];
};

const addComment = ($, match) => {
	const formPress = $('form[name="press"]');

	return new Promise((resolve) => {
		if (_.isUndefined(formPress[0])) {
			log.info(`Невозможно оставить комментария. Ссылка: ${match.path}`);
			resolve(`Can't send comments. Match id ${match.path}`);
		} else {
			const requestParams = {
				uri: match.path,
				method: 'POST',
				form: {}
			};
			const matchResult = getMatchResult($, match);
			const availableComments = getAvailableComments(matchResult);

			const results = {};
			const inputs = formPress.find('input[type="hidden"]');
			_.forEach(inputs, (input) => {
				const inputName = input.attribs.name;
				const inputValue = input.attribs.value;
				results[inputName] = inputValue;
			});

			const textAreas = formPress.find('textarea');

			_.forEach(textAreas, (textarea) => {
				const textareaName = textarea.attribs.name;
				results[textareaName] = availableComments[_.random(availableComments.length - 1)];
			});
			requestParams.form = results;

			reqreq().request('addComments', requestParams, () => {
				log.info(`Комментария в пресс-центре добавлены. ${match.path}`);
				resolve('Комментария добавлены');
			}).catch((err) => {
				log.warn(`Can't send comments. Link: ${match.path}. Error: ' + ${err}`);
				resolve(`Can't send comments. Link: ${match.path}. Error: ' + ${err}`);
			});
		}
	});
};

module.exports = addComment;
