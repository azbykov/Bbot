var log = require('../lib/log')('daily-15');
var authentication = require('./actions/getAuthCookies').get();
var friendly = require('./tasks/friendly').start;
var goods = require('./tasks/goods').start;
var buildings = require('./tasks/buildings').start;
var nearMatch = require('./tasks/nearMatch').start;
var matchResult = require('./tasks/getLastResult').start;
var trainingReport = require('./tasks/getTrainingReport').start;
var trainingReportJunior = require('./tasks/getTrainingReportJunior').start;

var dailyMail = require('../lib/mailer').daily;

// Step 1
authentication
	.then(friendly)
	.then(goods)
	.then(buildings)
	.then(nearMatch)
	.then(matchResult)
	.then(trainingReport)
	.then(trainingReportJunior)
	.fail(function(error) {
		log.error('Error: ', error.message);
	}).then(function() {
		dailyMail();
	})
;
