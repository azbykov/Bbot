'use strict';

const {Alert} = require('./index');

class TalentAlert extends Alert {
	constructor({days, name, talent, link}) {
		const type = days === 0 ? Alert.TYPE.alert : Alert.TYPE.warn;
		super(type);

		this.player = name;
		this.talent = talent;
		this.period = days;
		this.link = link;
	}

	static WARNING_PERIOD = 5;

	getPlayer() {
		return `<a target="_blank" href="${this.link}">${this.player}</a>`;
	}

	warn() {
		return `Игрок ${this.getPlayer()} достигнет таланта ${this.talent} через ${this.period} дней`;
	}
	alert() {
		return `Игрока ${this.getPlayer()} можно перевести в основу! Он достиг таланта ${this.talent}`;
	}
}

module.exports = TalentAlert;
