'use strict';

const log = require('../../lib/log')('action_optimize_training');
const config = require('config').bot;
const Vow = require('vow');
const _ = require('lodash');
const strategyConfig = require('../../config/stratege.json');

const DEFAULT_PERCENT_TRAINING = 100;
const GOALKEEPER_ROLE = 'gk';
const ROLES = {
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

const ABILITY_IDS = {
	otbor: 1,
	opeka: 2,
	dribl: 3,
	priem: 4,
	vinoslevost: 5,
	pas: 6,
	silaYdara: 7,
	tothnostYdara: 8
};

const DEFAULT_ABILITY = 'vinoslevost';

const form = {
	step: 1,
	act: 'select',
	type: 'players/train',
	firstpage: '/xml/players/train.php?'
};

const requestParams = {
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

module.exports = (playersData) => {
	const promise = Vow.promise();
	const request = global.butsaRequest;

	log.profiler.start('action_optimize_training');

	requestParams.form = prepareFormData(playersData);

	request.post(requestParams, (error) => {
		if (error) {
			log.error('error request', error.message);
			promise.reject(error);
		}
		promise.fulfill('done');
	});
	return promise;
};

const prepareFormData = (playersData) => {
	const players = playersData;
	const result = _.defaults(form, {
		numrows: players.length,
		AbilityID: [],
		PlayerID: [],
		PercentTrain: []
	});

	_.forEach(players, (player, i) => {
		result.AbilityID[i] = getAbilityId(player);
		result.PlayerID[i] = player.id;
		result.PercentTrain[i] = DEFAULT_PERCENT_TRAINING;
	});
	return result;
};

const getAbilityId = (player) => {
	let ability = DEFAULT_ABILITY;
	let tacticByRole;
	// goalkeeper filter
	if (player.position === GOALKEEPER_ROLE) {
		return '';
	}
	// By Player Id
	if (!_.isUndefined(strategyConfig.byPlayerId[player.id])) {
		const strategyByPlayerId = strategyConfig.byPlayerId[player.id];
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
	const role = getRoleByPlayerPosition(player);
	const tactic = strategyConfig.byRole[role];
	if (!_.isUndefined(tactic) && !_.isUndefined(strategyConfig.tactics[tactic])) {
		tacticByRole = strategyConfig.tactics[tactic];
		ability = getStrategyFromArray(tacticByRole, player);
	}

	return ability;
};


const getStrategyFromArray = (strategy, player) => {
	const ability = _.isArray(strategy) ? strategy : strategy.ability;
	if (_.isUndefined(strategy.min)) {
		const lastIndex = _.findIndex(ability, (el) => {
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

const getRoleByPlayerPosition = (player) => {
	let role;

	_.forEach(ROLES, (rl, key) => {
		if (_.includes(rl, player.position)) {
			role = key;
			return false;
		}
		return role;
	});
	return role;
};

const getMinStrategy = (player, availableAbility) => {
	const skills = player.skills;

	const availableSkills = {};
	_.forEach(skills, (val, skill) => {
		if (_.includes(availableAbility, skill)) {
			availableSkills[skill] = +val;
		}
	});
	const minVal = _.sortBy(availableSkills)[0];

	const minSkill = _.findKey(skills, (skillVal) => {
		return +skillVal === minVal;
	});

	return ABILITY_IDS[minSkill];
};
