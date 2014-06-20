var winston = require('winston');
var config = require('config');
var _ = require('lodash');

function getLogger(label) {
    //отобразим метку с именем файла, который выводит сообщение
    label = label || '';

    _(config.log.transports).forEach(function(transport) {
		transport.label = label;
    });

    // Add logger
    winston.loggers.add(label, config.log.transports);

    return winston.loggers.get(label);
}

module.exports = getLogger;
