'use strict';

const reqreq = require('../../reqreq');
const youngs = require('./youngs');
const mainTeam = require('./main-team');
const {host, trainingJunior, training} = require('../../../constants/uri');

module.exports = {
	players() {
		const requestParams = {
			uri: `${host}${training}`,
			qs: {act: 'report'}
		};

		return reqreq().request('request players', requestParams, mainTeam);
	},
	youngs() {
		const requestParams = {
			uri: `${host}${trainingJunior}`,
			qs: {act: 'report'}
		};

		return reqreq().request('request young players', requestParams, youngs);
	}
};
