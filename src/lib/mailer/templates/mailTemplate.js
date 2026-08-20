'use strict';

const {formatReportTimestamp} = require('../../date');

var template = {
	header: {
		title: '',
		date: formatReportTimestamp()
	},
	content: {},
	footer: {
		label: 'Butsa bot'
	}
};
module.exports = template;
