'use strict';

const {Alert} = require('./index');
const {host, makeDeposit} = require('../../constants/uri');


class DepositAlert extends Alert {
	constructor({daysLeft, sum, canMoreDeposit}) {
		const type = daysLeft === 0 || canMoreDeposit ? Alert.TYPE.alert : Alert.TYPE.warn;
		super(type);

		this.sum = sum;
		this.period = daysLeft;
		this.link = host + makeDeposit;
	}

	static WARNING_PERIOD = 5;

	warn() {
		return `Вклад на сумму ${this.sum} закончится через ${this.period} дней`;
	}
	alert() {
		return `Нужно срочно сделать <a href="${this.link}" target="_blank">вклад!</a>`;
	}
}

module.exports = DepositAlert;
