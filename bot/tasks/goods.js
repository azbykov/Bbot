var log = require('../../lib/log')('task_goods');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');

var params = _.defaults(config.goods, {
	step: 1,
	type: 'finance/shop',
	firstpage: '/xml/finance/shop.php?type=finance/shop&act=buy2',
	act: 'buy'
});


var requestParams = {
	uri: config.path.protocol + config.path.domain
};

var goodsPromise = Vow.promise();

var start = function() {
	var request = global.butsaRequest;
	log.debug('Start buy goods');
	var currentGoods = Vow.promise();
	request.get(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error.message);
			goodsPromise.reject(error);
		}
		var $ = cheerio.load(body);
		var goods = $('img[title = "Товар на складе"]').next('b').children('a').text().split('.');
		currentGoods.fulfill(_.parseInt(goods[0] + goods[1]));
	});

	currentGoods.then(function(currentGoods) {
		var maxGoods = config.goods.goods * config.goods.games;
		if (currentGoods < maxGoods) {
			requestParams = {
				uri: requestParams.uri + config.path.goods,
				form: params
			};
			requestParams.form.Amount = (maxGoods - currentGoods);
			request.post(requestParams, function(error, res, body) {
				if (error) {
					log.error('Error request', error.message);
					goodsPromise.reject(error);
				}

				if (res.headers && res.headers.location) {
					log.debug('Check status');
					var uri = config.path.protocol + config.path.domain + res.headers.location;
					request.get(uri, function(err, res, body) {
						var $ = cheerio.load(body);
						var label = $('#mainarea_rigth table td table').first().text();
						log.info('Status: ' + label + '(' + currentGoods + ')' + '. Товара на складе '
								+ (requestParams.form.Amount + currentGoods));
						goodsPromise.fulfill(label);
					});
				} else {
					var $ = cheerio.load(body);
					var label = $('#mainarea_rigth table font').text();
					log.error('Error post buy goods message:' + label);
					log.debug('Error! ' + label +'. with params', params);
					goodsPromise.fulfill(label);
				}
			});
		} else {
			var label = 'Товара на складе уже закупленно ' + currentGoods;
			log.warn(label);
			goodsPromise.fulfill(label);
		}
	});

	return goodsPromise;
};

module.exports = {
	start: start
};
