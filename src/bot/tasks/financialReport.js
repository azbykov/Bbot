const log = require('../../lib/log')('task_financial_report');
const config = require('config').bot;
const _ = require('lodash');
const buffer = require('../../lib/buffer');
const moment = require('moment');
const team = require('../../lib/team');
const {host, financial} = require('../../constants/uri');

const MAX_DAYS_RANGE = 1;

const start = () => {
	log.profiler.start('task_financial_report');
	log.debug('[START] Get financial report promise');

	const today = moment();
	return team.finance.value.then(({financeReport}) => {
		const result = financeReport.filter((operation) => {
			const date = moment(operation.date, 'DD.MM.YY');
			return today.diff(date, 'days') <= MAX_DAYS_RANGE;
		});

		buffer.financialReport = {
			report: _.compact(result),
			settingsLink: host + financial
		};

		buffer.financialReportTitle = config.financial.report.label;
		log.debug('[COMPLETE] Get financial report promise', log.profiler.end('task_financial_report'));
		return Promise.resolve('Done!');
	});
};


module.exports = {
	start: start
};
