'use strict';

const reqreq = require('../../reqreq');
const {host, roster: rosterPath} = require('../../../constants/uri');

const roster = require('./roster');
const playerParams = require('./player-params');
const abilities = require('./abilities');

module.exports = {
	roster() {
		const requestParams = {
			uri: host + rosterPath
		};

		return reqreq().request('request_roster', requestParams, roster);
	},
	playerParams() {
		const requestParams = {
			uri: host + rosterPath,
			qs: {
				act: 'parameters'
			}
		};

		return reqreq().request('request_player_params', requestParams, playerParams);
	},

	playersAbilities() {
		const requestParams = {
			uri: host + rosterPath,
			qs: {
				act: 'abilities'
			}
		};

		return reqreq().request('request_player_abilities', requestParams, abilities);
	}
};
