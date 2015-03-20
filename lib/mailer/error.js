var path = require('path');
var config = require('config');
var mailer = require('./emailEngine');
var mailTemplate = require('./templates/mailTemplate');
var buffer = require(path.resolve(__dirname, '../', 'buffer'));
var _ = require('lodash');

module.exports = function(err) {
	var result = _.merge(mailTemplate, {
		header:{
			title: 'Ошибка робота!'
		},
		content: "Что-то пошло не так.",
		error: err
	});
	mailer('error', result, {
		subject: config.reports.daily.subject
	});
};
