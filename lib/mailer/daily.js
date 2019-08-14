'use strict';

const path = require('path');
const {bot, reports} = require('config');
const mailer = require('./emailEngine');
const mailTemplate = require('./templates/mailTemplate');
const buffer = require(path.resolve(__dirname, '../', 'buffer'));
const _ = require('lodash');

module.exports = () => {
	const result = _.merge(mailTemplate, {
		header: {
			title: 'Ежедневный Отчет'
		},
		content: buffer,
		team: bot.team
	});
	mailer('daily_old', result, {
		subject: reports.daily.subject
	});
};
