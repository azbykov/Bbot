'use strict';

var log = require('../../lib/log')('action_optimize_training');
var config = require('config').bot;
var Vow = require('vow');
var _ = require('lodash');
var strategyConfig = require('../../config/stratege.json');

var DEFAULT_PERCENT_TRAINING = 100;
var ROLES = {
	def: [
		'rd',
		'rwd',
		'cd',
		'sw',
		'ld',
		'lwd'
	],
	mid: [
		'rm',
		'rw',
		'cm',
		'am',
		'dm',
		'lm',
		'lw'
	],
	cf: [
		'lf',
		'cf',
		'rf'
	]
};

var ABILITY_IDS = {
	otbor: 1,
	opeka: 2,
	dribl: 3,
	priem: 4,
	vinoslevost: 5,
	pas: 6,
	silaYdara: 7,
	tothnostYdara: 8
};

var DEFAULT_ABILITY = 'vinoslevost';

var form = {
	step: 1,
	act: 'select',
	type: 'players/train',
	firstpage: '/xml/players/train.php?'
};

var requestParams = {
	uri: config.path.host + config.path.training,
	headers: {
		'Content-Type': 'multipart/form-data'
	},
	qs: {
		act: 'select',
		type: 'players/train'
	},
	form: form
};

module.exports = function(playersData) {
	var promise = Vow.promise();
	var request = global.butsaRequest;

	log.profiler.start('action_optimize_training');

	requestParams.form = prepareFormData(playersData);

	request.post(requestParams, function(error) {
		if (error) {
			log.error('error request', error.message);
			promise.reject(error);
		}
		promise.fulfill('done');
	});
	return promise;
};

var prepareFormData = function(playersData) {
	var players = playersData;
	var result = _.defaults(form, {
		numrows: players.length,
		AbilityID: [],
		PlayerID: [],
		PercentTrain: []
	});

	_.forEach(players, function(player, i) {
		result.AbilityID[i] = getAbilityId(player);
		result.PlayerID[i] = player.id;
		result.PercentTrain[i] = DEFAULT_PERCENT_TRAINING;
	});
	return result;
};

var getAbilityId = function(player) {
	var ability = DEFAULT_ABILITY;
	var tacticByRole;
	// goalkeeper filter
	if (player.position === 'gk') {
		return '';
	}
	// By Player Id
	if (!_.isUndefined(strategyConfig.byPlayerId[player.id])) {
		var strategyByPlayerId = strategyConfig.byPlayerId[player.id];
		if (_.isString(strategyByPlayerId)) {
			if (_.isUndefined(strategyConfig.tactics[strategyByPlayerId])) {
				ability = ABILITY_IDS[strategyByPlayerId];
			} else {
				tacticByRole = strategyConfig.tactics[strategyByPlayerId];
				ability = getStrategyFromArray(tacticByRole, player);
			}
		}

		if (_.isArray(strategyByPlayerId)) {
			ability = getStrategyFromArray(strategyByPlayerId, player);
		}
		if (_.isObject(strategyByPlayerId) && !_.isUndefined(strategyByPlayerId.ability)) {
			ability = getStrategyFromArray(strategyByPlayerId, player);
		}
		return ability;
	}

	// By Position
	if (!_.isUndefined(strategyConfig.byPosition[player.position])) {
		// надо сделать
	}

	// By Role
	var role = getRoleByPlayerPosition(player);
	var tactic = strategyConfig.byRole[role];
	if (!_.isUndefined(tactic) && !_.isUndefined(strategyConfig.tactics[tactic])) {
		tacticByRole = strategyConfig.tactics[tactic];
		ability = getStrategyFromArray(tacticByRole, player);
	}

	return ability;
};


var getStrategyFromArray = function(strategy, player) {
	var ability = _.isArray(strategy) ? strategy : strategy.ability;
	if (_.isUndefined(strategy.min)) {
		var lastIndex = _.findIndex(ability, function(el) {
			return el === player.lastTraining;
		});

		return _.isUndefined(lastIndex) || _.isUndefined(ABILITY_IDS[ability[lastIndex + 1]])
			? ABILITY_IDS[ability[0]]
			: ABILITY_IDS[ability[lastIndex + 1]]
		;
	} else {
		return getMinStrategy(player, ability);
	}
};

var getRoleByPlayerPosition = function(player) {
	var role;

	_.forEach(ROLES, function(rl, key) {
		if (_.includes(rl, player.position)) {
			role = key;
			return false;
		}
	});
	return role;
};

var getMinStrategy = function(player, availableAbility) {
	var skills = player.skills;

	var availableSkills = {};
	_.forEach(skills, function(val, skill) {
		if (_.includes(availableAbility, skill)) {
			availableSkills[skill] = +val;
		}
	});
	var minVal = _.sortBy(availableSkills)[0];

	var minSkill = _.findKey(skills, function(skillVal) {
		return +skillVal === minVal;
	});

	return ABILITY_IDS[minSkill];
};
