'use strict';

const Vow = require('vow');
const _ = require('lodash');
const reqq = require('./reqreq');
const config = require('config').bot;
const cheerio = require('cheerio');
const log = require('../lib/log')('team_manager');

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
			promise = Vow.resolve(this._value);
		} else if (!this.provider) {
			promise = Vow.reject('Provider not registred');
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
Team.prototype.players = new CreateManager(() => {
	const requestParams = {
		uri: config.path.host + config.path.training,
		qs: {act: 'report'}
	};

	return reqq().request('request players', requestParams);
});

// Youngs
Team.prototype.youngs = new CreateManager(() => {
	const requestParams = {
		uri: config.path.host + config.path.trainingJunior,
		qs: {act: 'report'}
	};

	return reqq().request('request young players', requestParams);
});

// Finance
Team.prototype.finance = new CreateManager(() => {
	const requestParams = {
		uri: config.path.host + config.path.financial
	};

	return reqq().request('request finance', requestParams, (res) => {
		const body = res.body;
		const $ = cheerio.load(body);

		const table = $('.maintable').first();
		const tr = table.find('tr');

		const result = _.map(tr, (trData) => {
			trData = _.compact($(trData).text().split('\n'));
			return {
				date: trData[0],
				comment: trData[1],
				money: trData[2],
				contrAgent: trData[3],
				balance: trData[4]
			};
		});
		result.shift();
		result.pop();
		return result;
	});
});

Team.prototype.nearMatch = new CreateManager(() => {
	const requestParams = {
		uri: config.path.host + config.path.office
	};

	return reqq().request('request near match', requestParams);
});

module.exports = new Team();
