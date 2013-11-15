var log = require('../../lib/log')(module);
var request = require('request');
var config = require('config').bot;
var Vow = require('vow');

module.exports.cookies = cookies = Vow.promise();

var requestParams = {
	uri: config.path.domain + config.path.auth,
	method: "POST",
	form: {
		auth_name: config.auth.login,
		auth_pass: config.auth.password
	}
}

log.info('start auth')

request(requestParams, function(error, res, body) {
	if (error) {
		log.error('error request', error.message)
	}
	cookies.fulfill(res.headers['set-cookie'])

});


