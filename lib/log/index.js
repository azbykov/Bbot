'use strict';

const winston = require('winston');
const {combine, timestamp, printf, label: labelFormat} = winston.format;

const config = require('config');
const buffer = require('./../buffer');
const Profiler = require('../profiler');
const moment = require('moment');

const labelLang = {
	task_building: config.bot.buildings.label,
	task_friendly: config.bot.friendly.label,
	task_goods: config.bot.goods.label,
	task_near_match: config.bot.nearMatch.label,
	action_addComment: config.bot.comments.label,
	task_optimaze_training: config.bot.optimizeTraining.label
};

const loggerFormat = (label) => combine(
	timestamp(),
	labelFormat({label}),
	printf((info) =>
		`${moment(info.timestamp).format('DD-MM-YYYY HH:mm:ss:ms')} [${info.label}] ${info.level}: ${info.message}`
	)
);


function getLogger(label) {
	// Add logger
	winston.loggers.add(label, {
		format: loggerFormat(label)
	});

	const logger = winston.loggers.get(label);

	Object.keys(config.log.transports).forEach((key) => {
		const transportConfig = config.log.transports[key];

		switch (key) {
			case 'console':
				logger.add(new (winston.transports.Console)(transportConfig));
				break;
			case 'file':
				logger.add(new (winston.transports.File)(transportConfig));
				break;
		}
	});

	logger.on('data', ({level, message}) => {
		if (level === 'info') {
			const record = {
				label: labelLang[label] ? labelLang[label] : label,
				level: level,
				msg: message
			};
			buffer.log.push(record);
		}
	});

	logger.profiler = new Profiler();

	return logger;
}

module.exports = getLogger;
