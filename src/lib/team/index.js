'use strict';

const _ = require('lodash');
const log = require('../log')('team_manager');
const {finance, deposit} = require('./office');
const {nearMatch} = require('./match');
const {youngs, players} = require('./training');
const {roster, playerParams, playersAbilities} = require('./club');

class CreateManager {
	constructor(provider, data) {
		this._value = data || [];
		this.provider = provider;
		this.pendingPromise = null;
	}

	get value() {
		let promise;
		let provider = this.provider;

		if (!_.isEmpty(this._value)) {
			log.debug('form cache');
			promise = Promise.resolve(this._value);
		} else if (!this.provider) {
			promise = Promise.reject('Provider not registred');
		} else if (this.pendingPromise && !this.pendingPromise.isResolved()) {
			log.debug('from pending promise');
			return this.pendingPromise;
		} else {
			log.debug('create promise');
			this.pendingPromise = provider().then((result) => {
				this._value = result;
				this.pendingPromise = null;
				return result;
			});
			promise = this.pendingPromise;
		}

		return promise;
	}
}

class Team {
	constructor(cfg) {
		this._config = cfg;
		this._players = [];
		this._office = {};
		this._matches = [];
		this._youngs = [];
		this._finance = {};
		this._buildings = {};
	}
}

// Players
Team.prototype.trainingMainTeam = new CreateManager(players);

// Youngs
Team.prototype.youngs = new CreateManager(youngs);

// Finance
Team.prototype.finance = new CreateManager(async() => {
	try {
		const financeReport = await finance();
		const depositReport = await deposit();

		return {
			financeReport,
			deposit: depositReport
		};
	} catch (e) {
		throw new Error(e);
	}
});

Team.prototype.nearMatch = new CreateManager(nearMatch);

Team.prototype.club = new CreateManager(async() => {
	try {
		const {players: playerRoster, goods, clubInfo} = await roster();

		const playerAdditionalParams = await playerParams();
		const abilities = await playersAbilities();
		const rosterValue = [
			...playerRoster.concat(playerAdditionalParams).concat(abilities).reduce((map, result) =>
				map.set(result.id, Object.assign(map.get(result.id) || {}, result)),
			new Map()).values()
		];

		return {
			goods,
			clubInfo,
			roster: rosterValue
		};
	} catch (e) {
		throw new Error(e);
	}
});

const team = new Team();

module.exports = team;
