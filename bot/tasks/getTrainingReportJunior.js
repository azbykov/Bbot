'use strict';

var log = require('../../lib/log')('task_junior_training_report');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');

var TALENTS = [7, 8, 9];

var requestParams = {
	uri: config.path.host + config.path.trainingJunior,
	qs: {act: 'report'}
};


var promise = Vow.promise();

var start = function() {
	log.profiler.start('task_junior_training_report');
	var request = global.butsaRequest;
	log.debug('[START] Get junior training');

	request(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error);
			log.debug('error request with params', requestParams);
			promise.reject(error);
		}
		var $ = cheerio.load(body);

		var table = $('#mainarea_rigth table');

		var trainingObject = table.first().children('tr');
		var trainingProgress = getTrainingObj(trainingObject, $);


		buffer.trainingJunior = {
			progress: trainingProgress,
			settingsLink: config.path.host + config.path.trainingJunior,
			trainingsLeft: $('#mainarea_rigth').text().split('\n')[1]
		};
		buffer.trainingTitleJunior = config.trainingJunior.label;
		log.debug('[COMPLETE] Get junior training', log.profiler.end('task_junior_training_report'));
		promise.fulfill('done!');
	});

	return promise;
};

module.exports = {
	start: start
};


function getTitle(tr) {
	return {
		name: tr.find('td:nth-child(3)').text(),
		pos: tr.find('td:nth-child(5)').text(),
		old: tr.find('td:nth-child(6)').text(),
		mas: tr.find('td:nth-child(7)').text(),
		attrName: tr.find('td:nth-child(8)').text(),
		attrUp: tr.find('td:nth-child(9)').text(),
		attrTotal: tr.find('td:nth-child(10)').text()
	};
}

function getYoungs(tr) {
	var playerName = tr.find('td:nth-child(2) a').text();
	var playerLink = tr.find('td:nth-child(2) a').attr('href')
		? config.path.host + tr.find('td:nth-child(2) a').attr('href')
		: '';
	var playerPos = tr.find('td:nth-child(4) center').text();
	var playerOld = tr.find('td:nth-child(5) center').text();
	var playerMas = tr.find('td:nth-child(6) center').text();
	var attrName = tr.find('td:nth-child(7) center').text();
	var playerParamUp = tr.find('td:nth-child(8) center').text();
	var playerParamTotal = tr.find('td:nth-child(9) div').text();
	var playerTalent = getPlayerTalent(attrName, playerMas, playerParamTotal);

	return {
		name: playerName,
		link: playerLink,
		pos: playerPos,
		old: playerOld,
		mas: playerMas,
		attrName: attrName,
		attrUp: playerParamUp,
		attrTotal: playerParamTotal,
		talent: playerTalent
	};
}

function getPlayerTalent(attr, mas, attrTotal) {
	if (attr.toLowerCase() !== 'талант') {
		return false;
	}
	return TALENTS.reduce(function (talents, talent2) {
		if (talent2 > attrTotal) {
			talents[talent2] = getTalentDays(mas, attrTotal, talent2);
		}
		return talents;
	}, {});

}

function getTalentDays(mas, total, talent2 ) {
	var a = 3.378;
	var b = 1638.976;
	var c = 48.095;
	var D1 = ((a * mas + b) / 100000) * (total - 1) * ((total - 1) * (total - 1) * (total - 1) + c * (total - 1) + 40)
		+ c * (total - 1) * (total - 1) * (total - 1) / 1000;
	var D2 = ((a * mas + b) / 100000) * (talent2 - 1) * ((talent2 - 1) * (talent2 - 1) * (talent2 - 1)
		+ c * (talent2 - 1) + 40) + c * (talent2 - 1) * (talent2 - 1) * (talent2 - 1) / 1000;
	return Math.ceil(D2) - Math.ceil(D1);
}

var getTrainingObj = function(trs, $) {
	return _.map(trs, function(tr, i) {
		tr = $(tr);
		var data;
		if (i === 0) {
			data = getTitle(tr);
		} else {
			data = getYoungs(tr);
		}
		return data;
	});
};
