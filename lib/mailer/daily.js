var path = require('path');
var config = require('config');
var mailer = require('./emailEngine');
var mailTemplate = require('./templates/mailTemplate');
var buffer = require(path.resolve(__dirname, '../', 'buffer'));
var _ = require('lodash');

module.exports = function() {
	var result = _.merge(mailTemplate, {
		header:{
			title: 'Ежедневный Отчет'
		},
		content: buffer,
		team: config.bot.team
	});
	mailer('daily_old', result, {
		subject: config.reports.daily.subject
	});
};
