'use strict';

var moment = require('moment');
moment.locale('ru');

var template = {
	header: {
		title: '',
		date: moment().format('dddd DD MMMM YYYY, HH:mm')
	},
	content: {},
	footer: {
		label: 'Butsa bot'
	}
};
module.exports = template;
