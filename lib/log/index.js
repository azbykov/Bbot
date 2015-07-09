var winston = require('winston');
var config = require('config');
var _ = require('lodash');
var buffer = require('./../buffer');
var Profiler = require('../profiler');

var labelLang = {
	task_building: config.bot.buildings.label,
	task_friendly: config.bot.friendly.label,
	task_goods: config.bot.goods.label,
	task_near_match: config.bot.nearMatch.label,
	action_addComment: config.bot.comments.label,
	task_optimaze_training: config.bot.optimizeTraining.label,
};


function getLogger(label) {
    //отобразим метку с именем файла, который выводит сообщение
    label = label || '';

    _(config.log.transports).forEach(function(transport) {
		transport.label = label;
    });

    // Add logger
    winston.loggers.add(label, config.log.transports);

	var logger = winston.loggers.get(label);
	logger.on('logged', function(level, msg) {
		if (level != 'info') {
			return false;
		}
		var record = {
			label: labelLang[label] ? labelLang[label] : label,
			level: level,
			msg: msg
		};
		buffer.log.push(record);
	});

	logger.profiler = new Profiler();

    return logger;
}

module.exports = getLogger;
