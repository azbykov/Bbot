var log = require('../../lib/log')('action_getOrder');
var config = require('config').bot;
var Vow = require('vow');
var _ = require('lodash');

var Order = require('../models/order');


var ORDER_PARAM_SEP = ';';

module.exports.orders = orders = Vow.promise();

var requestParams = {
	uri: config.path.protocol + config.path.domain + config.path.order + config.path.orderParams +
		'&filename=' + config.orderName+'&load=1'
};


module.exports.get = function(options) {
	log.info('Get order object (gameId: %s)', options.gameId);
	var request = options.request;
	request.get(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request gameId: ' + options.gameId, error.message);
		}
		var orderParams = {
			id: options.gameId
		};
//		parser.parseComplete(body);
//		orderParams = getPlayers(body, orderParams);
//		orderParams = getReserve(body, orderParams);
//		orderParams = getMatch(body, orderParams);
//		orderParams = getRoles(body, orderParams);
		console.log(body)
		var order = new Order(orderParams);
//		console.log(order, 'or')
		log.info('Build order complete (gameId %d)', options.gameId);
		orders.fulfill({request: request, orders: {}});
	});
};

var getPlayers = function(body, orderParams) {
	var players = body.match(/\[(\d+)\],(\d+)/ig);
	var zones = [];
	if (players) {
		zones = players.join(';').match(/\[(\d+)\]/ig).join(';').match(/\d+/ig);
		orderParams.zones = getZones(zones);
		players = players.join(';').match(/,(\d+)/ig).join(';').match(/\d+/ig);
		players.unshift(players.length);
		orderParams.players = players.join(';')
	}
	return orderParams;
};

var getReserve = function(body, orderParams) {
	var resPlayer = body.match(/win.AddReservePlayer\((\d+)/ig);
	if (resPlayer) {
		resPlayer = resPlayer.join(';').match(/(\d+)/ig);
		resPlayer.unshift(resPlayer.length);
		orderParams.reserveplayers = resPlayer.join(';');
	}
	return orderParams;
};

var getMatch = function(body, orderParams) {
	var match_tactics = body.match(/match_tactics\'\)\)\.SetValue\(([0-9]+)\)/ig);
	match_tactics = match_tactics[0].match(/([0-9]+)/ig)[0];
	orderParams.match_tactics = match_tactics;

	var match_passes = body.match(/match_passes'\).value = ([0-9]+)/ig);
	match_passes = match_passes[1].match(/([0-9]+)/ig)[0];
	orderParams.match_passes = match_passes;

	var match_strategy = body.match(/match_strategy'\).value = ([0-9]+)/ig);
	match_strategy = match_strategy[1].match(/([0-9]+)/ig)[0];
	orderParams.match_strategy = match_strategy;

	var match_pressing = body.match(/match_pressing'\).checked = (\w*)/ig);
	match_pressing = match_pressing[1].split(' = ')[1] ? '1' : '0';
	orderParams.match_pressing = match_pressing;

	var match_pressing_flank = body.match(/match_pressing_flank\'\)\)\.SetValue\(([0-9]+)\)/ig);
	match_pressing_flank = match_pressing_flank[0].match(/([0-9]+)/ig)[0];
	orderParams.match_pressing_flank = match_pressing_flank;

	var match_pressing_attack_defence = body.match(/match_pressing_attack_defence\'\)\)\.SetValue\(([0-9]+)\)/ig);
	match_pressing_attack_defence = match_pressing_attack_defence[0].match(/([0-9]+)/ig)[0];
	orderParams.match_pressing_attack_defence = match_pressing_attack_defence;

	return orderParams;
};

var getRoles = function(body, orderParams) {

	function getProperty(property) {
		if (property && property[0]) {
			property = property[0].match(/(\d+)/ig)[0];
		} else {
			property = '';
		}
		return property;
	}

	var captain = body.match(/'role_Captain'\)\.value=(\d+)/ig);
	var leftCorner = body.match(/'role_LeftCorners'\)\.value=(\d+)/ig);
	var rightCorner = body.match(/'role_RightCorners'\)\.value=(\d+)/ig);
	var freeKick = body.match(/'role_FreeKicks'\)\.value=(\d+)/ig);
	var penalty = body.match(/'role_Penalties'\)\.value=(\d+)/ig);

	orderParams.role_Captain = getProperty(captain);
	orderParams.role_LeftCorners = getProperty(leftCorner);
	orderParams.role_RightCorners = getProperty(rightCorner);
	orderParams.role_FreeKicks = getProperty(freeKick);
	orderParams.role_Penalties = getProperty(penalty);

	return orderParams;
};

var getZones = function(array) {
	var zones = {};
	for (var i = 0; i < 17; i++) {
		zones[i] = 0;
	}
	for (var i = 0; i < array.length; i++) {
		var key = array[i];
		zones[key]++
	}
	zones = _.values(zones);
	zones.unshift(zones.length);
	return zones.join(';');
};
