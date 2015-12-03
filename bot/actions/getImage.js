var Vow = require('vow');
var request = require('request');
var fs = require('fs');

var getImage = function(url) {
	var imageSrc = Vow.promise();

	var options = {
		url: url,
		headers: {
			'Content-Type': 'charset=utf-8',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'en-US,en;q=0.5'
		},
		encoding: 'binary',
		gzip: true
	};

	request(options, function(err, res, body) {
		if (err) {
			console.log('Error!!', err);
			return imageSrc.reject(err);
		}
		imageSrc.fulfill(new Buffer(body.toString(), "binary").toString("base64"));
	});
	return imageSrc;
};


module.exports = getImage;
