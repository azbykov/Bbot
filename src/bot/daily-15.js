'use strict';

require('../lib/notification');
const log = require('../lib/log')('daily-15');
const authentication = require('./actions/getAuthCookies').get;
const friendly = require('./tasks/friendly').start;
const goods = require('./tasks/goods').start;
const buildings = require('./tasks/buildings').start;
const nearMatch = require('./tasks/nearMatch').start;
const matchResult = require('./tasks/getLastResult').start;
const trainingReport = require('./tasks/getTrainingReport').start;
const trainingReportJunior = require('./tasks/getTrainingReportJunior').start;
const financialReport = require('./tasks/financialReport').start;
const setOptimalTraining = require('./tasks/setOptimalTraining').start;
const checkMail = require('./tasks/checkMail').start;
const setNotifications = require('./tasks/setNotifications').start;

const {daily: dailyMail, error: errorMail} = require('../lib/mailer');

log.profiler.start('daily-15');
// Step 1
authentication()
	.then(() => {
		require('../lib/team');
	})
	.then(() => Promise.all([
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
	]))
	.then(setNotifications)
	.then(() => {
		dailyMail();
	})
	.catch((error) => {
		log.error('finaly error: ', {error: JSON.stringify(error.message)});
		errorMail(error);
	}).finally(() => {
		log.debug('[COMPLETE] Task daily-15', log.profiler.end('daily-15'));
	});
