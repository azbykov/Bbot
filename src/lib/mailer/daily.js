'use strict';

const path = require('path');
const {bot, reports} = require('config');
const mailer = require('./mailer');
const mailTemplate = require('./templates/mailTemplate');
const buffer = require(path.resolve(__dirname, '../', 'buffer'));
const _ = require('lodash');
const {notification} = require('../notification');

module.exports = () => {
	const result = _.merge(mailTemplate, {
		header: {
			title: 'Ежедневный Отчет'
		},
		content: buffer,
		alerts: notification.alerts,
		team: bot.team
	});

	mailer('daily_old', result, {
		to: 'kid86@list.ru',
		subject: reports.daily.subject
	});
};
