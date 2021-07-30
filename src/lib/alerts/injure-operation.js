'use strict';

const {Alert} = require('./index');

class InjureOperation extends Alert {
	constructor({name, injure, link}) {
		super(Alert.TYPE.alert);

		this.playerName = name;
		this.playerLink = link;
		this.injureDays = injure;
	}

	getPlayer() {
		return `<a target="_blank" href="${this.playerLink}">${this.playerName}</a>`;
	}
	alert() {
		return `У игрока ${this.getPlayer()} травма! Количество дней: ${this.injureDays}. Ему необходимо сделать операцию`;
	}
}

module.exports = InjureOperation;
