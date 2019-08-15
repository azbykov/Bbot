'use strict';

const Email = require('email-templates');
const nodemailer = require('nodemailer');
const path = require('path');
const templatesDir = path.resolve(__dirname, 'templates');
const {mail: mailConfig} = require('config');
const log = require(path.resolve(__dirname, '../', 'log'))('mailer');

var moment = require('moment');
moment.locale('ru');

// Prepare nodemailer transport object
const transportBatch = nodemailer.createTransport({
	service: mailConfig.service,
	auth: mailConfig.auth
});

const email = new Email({
	message: {
		from: `Butsa bot <${mailConfig.auth.user}>`
	},
	transport: transportBatch,
	views: {
		root: templatesDir,
		options: {
			extension: 'ejs'
		}
	}
});

module.exports = (templateName, mailData, sendMailData) => {
	email
		.send({
			template: templateName,
			message: sendMailData,
			locals: mailData
		})
		.then(() => log.info('Mail sent'))
		.catch((e) => log.error(`Can't send email. Error: ${e}`));
};
