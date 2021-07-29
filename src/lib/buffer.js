'use strict';

var _buffer = {
	log: []
};

var Buf = {
	getBuffer() {
		return _buffer;
	},
	setValue(key, value) {
		_buffer[key] = value;
	},
	getValue(key) {
		var result = {};
		if (key && _buffer[key]) {
			result = _buffer[key];
		}

		return result;
	},
	removeKey(key) {
		if (key && _buffer[key]) {
			delete _buffer[key];
		}
	}
};

module.exports = Buf.getBuffer();
