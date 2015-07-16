var log = require('../../lib/log')('action_addComment');
var config = require('config').bot;
var Vow = require('vow');
var _ = require('lodash');
var comments = config.comments;

var MATCH_STATE = {
	1: 'win',
	x: 'draw',
	2: 'lose'
};

var getAvailableComments = function (state) {
	return _.union(comments.common, comments[state] || []);
};

var getMatchResult = function ($, match) {
	var formPress = $('form[name="press"]');
	var ourTeam = $(formPress.prev('b').find('a')[1]).text();
	var result = match.result.split(':');

	if (result[0] > result[1]) {
		 result = (match.guestTeam.name == ourTeam) ? 2 : 1;
	} else if (result[0] == result[1]) {
		result = x;
	} else {
		result = (match.guestTeam.name == ourTeam) ? 1 : 2;
	}
	return MATCH_STATE[result];
};

var addComment = function ($, match) {

	var comments = Vow.promise();
	var formPress = $('form[name="press"]');

	if (_.isUndefined(formPress[0])) {
		log.info('Невозможно оставить комментария. Ссылка: ' + match.path);
		comments.fulfill('Can\'t send comments. Match id ' + match.path);
	} else {
		var request = global.butsaRequest;
		var requestParams = {
			uri: match.path,
			form: {}
		};
		var matchResult = getMatchResult($, match);
		var availableComments = getAvailableComments(matchResult);

		var results = {};
		var inputs = formPress.find('input[type="hidden"]');
		_.forEach(inputs, function (input) {
			var inputName = input.attribs.name;
			var inputValue = input.attribs.value;
			results[inputName] = inputValue
		});

		var textAreas = formPress.find('textarea');

		_.forEach(textAreas, function (textarea) {
			var textareaName = textarea.attribs.name;
			results[textareaName] = availableComments[_.random(availableComments.length - 1)];
		});
		requestParams.form = results;

		request.post(requestParams, function (err, responce) {
			if (err) {
				log.warn('Can\'t send comments. Link: ' + match.path + '. Error: ' + err);
				comments.fulfill('Can\'t send comments. Link: ' + match.path + '. Error: ' + err);
			}
			comments.fulfill('Комментария добавлены');
			log.info('Комментария в пресс-центре добавлены. ' + match.path);
		})
	}

	return comments;
};

module.exports = addComment;
