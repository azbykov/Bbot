'use strict';

class Alert {
	constructor(type = Alert.TYPE.warn) {
		this.type = type;
	}

	static TYPE = {
		warn: 'WARN',
		alert: 'ALERT',
	};

	warn() {}

	alert() {}

	getText() {
		return this.type === Alert.TYPE.alert ? this.alert() : this.warn();
	}
}

module.exports = {
	Alert
};
