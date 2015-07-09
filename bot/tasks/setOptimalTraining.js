var log = require('../../lib/log')('task_optimaze_training');
var config = require('config').bot;
var _ = require('lodash');
var cheerio = require('cheerio');
var Vow = require('vow');
var buffer = require('../../lib/buffer');
var optimizeTraining = require('../actions/optimizeTraining');

var requestParams = {
	uri: config.path.host + config.path.playersAbilities
};


var promise = Vow.promise();

var start = function() {
	log.profiler.start('task_optimaze_training');
	var request = global.butsaRequest;
	log.debug('[START] Optimaze training');
	request(requestParams, function(error, res, body) {
		if (error) {
			log.error('error request', error);
			log.debug('error request with params', requestParams);
			promise.reject(error);
		}
		var $ = cheerio.load(body);

		var trainingTable = $('.maintable')[2];

		trainingTable = $(trainingTable);



		var playersTr = trainingTable.find('tr:not([bgcolor="#D3E1EC"]):not([class="header"])');

		var trainingData = _.map(playersTr, function (player) {
			var playerParams = $(player).find('td');
			var player = {};

			var skills = {
				otbor: $(playerParams[6]).text().replace('\n', ''),
				opeka: $(playerParams[7]).text().replace('\n', ''),
				dribl: $(playerParams[8]).text().replace('\n', ''),
				priem: $(playerParams[9]).text().replace('\n', ''),
				vinoslevost: $(playerParams[10]).text().replace('\n', ''),
				pas: $(playerParams[11]).text().replace('\n', ''),
				silaYdara: $(playerParams[12]).text().replace('\n', ''),
				tothnostYdara: $(playerParams[13]).text().replace('\n', '')
			};

			var lastTrainingVal = playerParams.find('.trained_ability').text().replace('\n', '');

			player.num = $(playerParams[0]).text().replace('\n', '');
			player.name = $(playerParams[1]).text().replace('\n', '');
			// Берем первую позицию
			player.position = $(playerParams[3]).text().replace('\n', '').toLowerCase().split('/')[0];
			player.id = $(playerParams[1]).find('a').attr('href').replace('/players/', '');
			player.totalSkill = $(playerParams[5]).text().replace('\n', '');
			player.skills = skills;
			player.lastTraining = _.findKey(skills, function(chr) {
				return chr === lastTrainingVal;
			});
			return player;
		});

		optimizeTraining(trainingData).then(function (status) {
			log.info('Тренировки обновлены. Посмотреть ' + config.path.host + config.path.training);
			log.debug('[COMPLETE] Optimaze training', log.profiler.end('task_optimaze_training'));
			promise.fulfill('done!');
		}).fail(function (err) {
			log.error('Что-то пошло не так. Ошибка: ' + err);
			promise.reject(err);
		});
	});

	return promise;
};

module.exports = {
	start: start
};
