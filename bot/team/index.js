'use strict';

let jsdom = require('jsdom');
let config = require('config').bot;
var fs = require('fs');

class Team {
	constructor(options) {
		this.config = options;
		this.players;
		this.youngs;
		this.transfers;
		this.opponents;
		this.finans;
		this.a;
	}

	getPlayers() {
		if (this.players) {
			return this.players;
		}
	}

	getYoungs() {
		if (this.youngs) {
			return this.youngs;
		}
	}

	getTransfers() {
		if (this.transfers) {
			return this.transfers;
		}
	}

	getOpponents() {
		var self = this;
		var requestParams = {
			uri: config.path.host + config.path.office
		};
		return new Promise((resolve, reject) => {
			if (self.opponents) {
				console.log('from cache');
				resolve(self.opponents);
			} else {
				console.log('from request');
				var request = global.butsaRequest;
				request.get(requestParams, function (err, res, body) {
				// 	fs.writeFileSync(require('path').join(__dirname, '/../../', 'tools/stubs/near-match.txt'), body);
				// fs.readFile(require('path').join(__dirname, '/../../', 'tools/stubs/near-match.txt'), function (err, body) {
					body = body.toString();
					if (err) {
						reject(err);
					}
					jsdom.env(
						body,
						['http://code.jquery.com/jquery.js'],
						(err, window) => {
							if (err) {
								reject(err);
							}
							let result = require('./getOpponent')(window);
							self.opponents = result;
							resolve(result);
						}
					);
				});
			}
		});
	}
}

module.exports = new Team(config.team);
