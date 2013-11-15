var winston = require('winston');
var config = require('config');
var _ = require('lodash');

function getLogger(module) {
    //отобразим метку с именем файла, который выводит сообщение
    var path = module.filename.split('/').slice(-2).join('/');

    _(config.log.transports).forEach(function(transport) {
        _.defaults(transport, {label: path})
    });

    // Add logger
    winston.loggers.add('main', config.log.transports);

    return winston.loggers.get('main');
}

module.exports = getLogger;
