'use strict';

const winston = require('winston');
const {combine, timestamp, printf, label: labelFormat} = winston.format;

const {log: logConfig, bot: botConfig} = require('config');
const buffer = require('../buffer');
const Profiler = require('../profiler');
const moment = require('moment');

const labelLang = {
	task_building: botConfig.buildings.label,
	task_friendly: botConfig.friendly.label,
	task_goods: botConfig.goods.label,
	task_near_match: botConfig.nearMatch.label,
	action_addComment: botConfig.comments.label,
	task_optimization_training: botConfig.optimizeTraining.label
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

	Object.keys(logConfig.transports).forEach((key) => {
		const transportConfig = logConfig.transports[key];

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
