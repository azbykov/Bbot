var log = require('../lib/log')('daily-15');
var authentication = require('./actions/getAuthCookies').get();
var friendly = require('./tasks/friendly').start;
var roster = require('./tasks/sendRoster').start;
var goods = require('./tasks/goods').start;
var buildings = require('./tasks/buildings').start;

// Step 1
authentication
	.then(friendly)
//	.then(roster)
	.then(goods)
	.then(buildings)
	.fail(function(error) {
		log.error('error: ', error.message)
	})
;
