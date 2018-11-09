'use strict';

var Profiler = function() {
	this._times = {};
};

Profiler.prototype.start = function(label) {
	this._times[label] = Date.now();
};

Profiler.prototype.end = function(label) {
	var time = this._times[label];
	if (!time) {
		throw new Error('No such label: ' + label);
	}
	var duration = Date.now() - time;
	return duration + 'ms';
};

module.exports = Profiler;

