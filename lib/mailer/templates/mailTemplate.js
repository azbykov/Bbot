var moment = require('moment');
moment.lang('ru');

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
