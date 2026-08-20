const log = require('../../lib/log')('task_financial_report');
const config = require('config').bot;
const _ = require('lodash');
const buffer = require('../../lib/buffer');
const {isWithinPastDays, parseButsaDate} = require('../../lib/date');
const team = require('../../lib/team');
const {host, financial} = require('../../constants/uri');

const MAX_DAYS_RANGE = 1;

const start = () => {
	log.profiler.start('task_financial_report');
	log.debug('[START] Get financial report promise');

	return team.finance.value.then(({financeReport}) => {
		const result = financeReport.filter((operation) => {
			const date = parseButsaDate(operation.date);
			return isWithinPastDays(date, MAX_DAYS_RANGE);
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
