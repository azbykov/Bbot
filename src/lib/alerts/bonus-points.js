'use strict';

const {Alert} = require('./index');
const {host} = require('../../constants/uri');

const BONUS_LINK = '/xml/players/info.php?act=bonus';

class BonusPointsAlert extends Alert {
	constructor({name, points, link, id}) {
		super(Alert.TYPE.alert);
		this.playerId = id;
		this.playerName = name;
		this.playerLink = link;
		this.points = points;
	}

	getlink() {
		return `${host}${BONUS_LINK}&id=${this.playerId}`;
	}

	getPlayer() {
		return `<a target="_blank" href="${this.playerLink}">${this.playerName}</a>`;
	}
	alert() {
		return `Игроку ${this.getPlayer()} можно поднять <a target="_blank" href="${this.getlink()}">бонус</a>`;
	}
}

module.exports = BonusPointsAlert;
