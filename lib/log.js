var winston = require('winston');
var config = require('config');
var _ = require('lodash');

function getLogger(label) {
    //отобразим метку с именем файла, который выводит сообщение
    label = label || '';

    _(config.log.transports).forEach(function(transport) {
        _.defaults(transport, {label: label})
    });

    // Add logger
    winston.loggers.add('main', config.log.transports);

    return winston.loggers.get('main');
}

module.exports = getLogger;
