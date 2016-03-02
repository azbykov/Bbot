'use strict';

var path = require('path');
var templatesDir = path.resolve(__dirname, 'templates');
var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var config = require('config');
var log = require(path.resolve(__dirname, '../', 'log'))('mailer');
var _ = require('lodash');



// ## Send a batch of emails and only load the template once

// Prepare nodemailer transport object
var transportBatch = nodemailer.createTransport({
	service: config.mail.service,
	auth: config.mail.auth
});

// An example users object
var users = config.mailUsers;

// Custom function for sending emails outside the loop
//
// NOTE:
//  We need to patch postmark.js module to support the API call
//  that will let us send a batch of up to 500 messages at once.
//  (e.g. <https://github.com/diy/trebuchet/blob/master/lib/index.js#L160>)
var Render = function(locals, sendMailData) {
	this.send = function(err, html, text) {
		if (err) {
			log.error(err);
		} else {
			sendMailData = _.defaults(sendMailData || {}, {
				from: 'Butsa Bot <' + config.mail.auth.user + '>',
				to: locals.email,
				subject: 'Daily report (Ежедневный отчет)',
				html: html,
				// generateTextFromHTML: true,
				text: text
			});

			transportBatch.sendMail(sendMailData, function(sendErr, response) {
				if (sendErr) {
					log.error(sendErr);
				} else {
					log.info('Mail sended. Status: ' + response.response + ';');
					log.debug('Mail sended object: ', response);
					process.exit();
				}
			});
		}
	};
	this.batch = function(batch, mailData) {
		batch(mailData, templatesDir, this.send);
	};
};


var mailer = function(templateName, mailData, sendMailData) {
	emailTemplates(templatesDir, function(err, template) {
		if (err) {
			log.error(err);
		} else {
			// Load the template and send the emails
			template(templateName, true, function(tempalteErr, batch) {
				if (tempalteErr) {
					log.error(tempalteErr);
				}
				users.forEach(function(user) {
					var render = new Render(user, sendMailData);
					render.batch(batch, mailData);
				});
			});
		}
	});
};

module.exports = mailer;
