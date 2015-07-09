var log = require('../lib/log')('daily-15');
var authentication = require('./actions/getAuthCookies').get();
var friendly = require('./tasks/friendly').start;
var goods = require('./tasks/goods').start;
var buildings = require('./tasks/buildings').start;
var nearMatch = require('./tasks/nearMatch').start;
var matchResult = require('./tasks/getLastResult').start;
var trainingReport = require('./tasks/getTrainingReport').start;
var trainingReportJunior = require('./tasks/getTrainingReportJunior').start;
var financialReport = require('./tasks/financialReport').start;
var setOptimalTraining = require('./tasks/setOptimalTraining').start;
var checkMail = require('./tasks/checkMail').start;

var dailyMail = require('../lib/mailer').daily;
var errorMail = require('../lib/mailer').error;
var Vow = require('vow');


log.profiler.start('daily-15');
// Step 1
authentication
	.then(function () {
		return Vow.allResolved([
			friendly(),
			goods(),
			buildings(),
			nearMatch(),
			matchResult(),
			trainingReport(),
			trainingReportJunior(),
			financialReport(),
			checkMail(),
			setOptimalTraining()
		]);
	})
	.fail(function(error) {
		log.error('error: ', error.message);
		errorMail(error);
	}).then(function() {
		dailyMail();
	}).always(function () {
		log.debug('[COMPLETE] Task daily-15', log.profiler.end('daily-15'));
	})
;
