'use strict';
const Vow = require('vow');
const _ = require('lodash');
const reqq = require('./reqreq');
const config = require('config').bot;
const cheerio = require('cheerio');

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
			console.log('form cache');
			promise = Vow.resolve(this._value);
		} else if (!this.provider) {
			promise = Vow.reject('Provier not registred');
		} else if (this.pendingPromise && !this.pendingPromise.isResolved()) {
			console.log('from pending promise');
			return this.pendingPromise;
		} else {
			console.log('form provider');
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
	constructor() {
		this.players = [];
		this.office = {};
		this.matches = [];
		this.youngs = [];
		this.finance = {};
	}
}

let team = new Team();

// Players
team.players = new CreateManager(() => {
	let requestParams = {
		uri: config.path.host + config.path.training,
		qs: {act: 'report'}
	};

	return reqq().request('request players', requestParams);
});

// Youngs
team.youngs = new CreateManager(() => {
	let requestParams = {
		uri: config.path.host + config.path.trainingJunior,
		qs: {act: 'report'}
	};

	return reqq().request('request young players', requestParams);
});

// Finance
team.finance = new CreateManager(() => {
	let requestParams = {
		uri: config.path.host + config.path.financial
	};

	return reqq().request('request finance', requestParams, (res) => {
		const body = res.body;
		const $ = cheerio.load(body);

		const table = $('.maintable').first();
		const tr = table.find('tr');

		const result = _.map(tr, function(trData) {
			trData = _.compact($(trData).text().split('\n'));
			// return trData;
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

team.nearMatch = new CreateManager(() => {
	let requestParams = {
		uri: config.path.host + config.path.office
	};

	return reqq().request('request near match', requestParams);
});



module.exports = team;
