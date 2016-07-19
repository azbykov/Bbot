var config = require('config').bot;

module.exports = function (window) {
	let $ = window.$;
	// center
	var matchLine = $('.maintable').find('img[src="http://butsa.ru/images/icons/edit.png"]')
		.parent().parent().parent().parent().parent().find('tr');

	var result = [];
	matchLine.each((i, match) => {
		match = $(match);
		if (i > 0 && match.find('td:nth-child(7)').find('a').attr('href')) {
			var rivalTeamLink = config.path.protocol + config.path.domain + match.find('td:nth-child(5) center a').attr('href');
			var gameLink = config.path.protocol + config.path.domain + match.find('td:nth-child(7)').find('a').attr('href');
			var gameId = gameLink.split('id=')[1];
			var matchData = {
				gid: match.find('td:nth-child(2)').find('center').text(),
				gameDate: match.find('td:nth-child(3)').find('center').text(),
				tournament: match.find('td:nth-child(4)').text(),
				rivalTeamName: match.find('td:nth-child(5)').find('center').text(),
				rivalTeamLink: rivalTeamLink,
				order: match.find('td:nth-child(6)').find('center').text(),
				link: gameLink,
				emblemLink: $('a[href="/matches/' + gameId + '"]').find('img').attr('src')
			};
			result.push(matchData);
		}
	});

	return result;

};
