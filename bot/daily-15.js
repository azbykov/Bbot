'use strict';

const log = require('../lib/log')('daily-15');
const authentication = require('./actions/getAuthCookies').get();
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

const {daily: dailyMail, error: errorMail} = require('../lib/mailer');
const Vow = require('vow');


log.profiler.start('daily-15');
// Step 1
authentication
	.then(() => {
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
	.fail((error) => {
		log.error('error: ', error.message);
		errorMail(error);
	}).then(() => {
		dailyMail();
	}).always(() => {
		log.debug('[COMPLETE] Task daily-15', log.profiler.end('daily-15'));
	})
;
