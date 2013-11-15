var log = require('../../lib/log')(module);
var request = require('request');
var config = require('config').bot;
var Vow = require('vow');

module.exports = function(cookies) {
	return
}

	.defaultOrder = defaultOrder = Vow.promise();

var requestParams = {
	uri: config.path.domain + config.path.getOrder
}

log.info('start construct order')

request(requestParams, function(error, res, body) {
	if (error) {
		log.error('error request', error.message)
	}
	cookies.fulfill(res.headers['set-cookie'])

});
