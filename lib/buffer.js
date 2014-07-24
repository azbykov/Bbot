var _buffer = {
	log: []
};

var Buf = {
	getBuffer: function() {
		return _buffer;
	},
	setValue: function(key, value) {
		_buffer[key] = value;
	},
	getValue: function(key) {
		var result = {};
		if (key && _buffer[key]) {
			result =  _buffer[key];
		}
		return result;
	},
	removeKey: function(key) {
		if (key && _buffer[key]) {
			delete _buffer[key]
		}
	}
};

module.exports = Buf.getBuffer();
