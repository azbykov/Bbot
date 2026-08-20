'use strict';

const Email = require('email-templates');
const nodemailer = require('nodemailer');
const path = require('path');
const {mail: mailConfig} = require('config');
const log = require(path.resolve(__dirname, '../', 'log'))('mailer');

const templatesDir = path.resolve(__dirname, 'templates');

const transport = nodemailer.createTransport({
	service: mailConfig.service,
	auth: {
		user: mailConfig.auth.user,
		pass: mailConfig.auth.pass
	}
});

const email = new Email({
	message: {
		from: `Butsa bot <${mailConfig.auth.user}>`
	},
	preview: false,
	transport,
	views: {
		root: templatesDir,
		options: {
			extension: 'ejs'
		}
	}
});

const renderTemplate = async(templateName, mailData) => ({
	html: await email.render(`${templateName}/html`, mailData),
	text: await email.render(`${templateName}/text`, mailData)
});

const send = async(templateName, mailData, sendMailData) => {
	try {
		const result = await email.send({
			template: templateName,
			message: sendMailData,
			locals: mailData
		});
		log.info('Mail sent');
		return result;
	} catch (error) {
		log.error(`Can't send email. Error: ${error}`);
		throw error;
	}
};

send.renderTemplate = renderTemplate;

module.exports = send;
