
const cheerio = require('cheerio');
const {host} = require('../../constants/uri');

const getLink = (uri) => uri ? host + uri : '';

const getClubInfo = (body) => {
	const $ = cheerio.load(body);
	const clubInfoTable = $($('.maintable')[0]);
	const clubInfoTr = clubInfoTable.find('tr');
	const teamInfoTable = $($('.maintable')[1]);
	const teamInfoTableTr = teamInfoTable.find('tr');
	const [stadiumName, seats] = $(clubInfoTr[5]).find('span').text().split(' (');

	return {
		name: $(clubInfoTr[0]).find('a').text(),
		link: getLink($(clubInfoTr[0]).find('a').attr('href')),
		id: $(clubInfoTr[1]).find('input').attr('value'),
		manager: $(clubInfoTr[2]).find('a').text(),
		managerLink: getLink($(clubInfoTr[2]).find('a').attr('href')),
		rang: $(clubInfoTr[3]).find('a').text(),
		city: $(clubInfoTr[4]).find('input').attr('value'),
		stadium: [stadiumName, parseInt(seats)],
		division: $(teamInfoTableTr[0]).find('a').text().split('-'),
		fund: $(teamInfoTableTr[1]).find('input').attr('value'),
		players: $(teamInfoTableTr[2]).find('a').text() || $(teamInfoTableTr[2]).find('span').text(),
		power: $(teamInfoTableTr[3]).find('a').text(),
		power11: $(teamInfoTableTr[4]).find('a').text(),
		viewerRating: $(teamInfoTableTr[5]).find('a').text()
	};
};

module.exports = {
	getClubInfo
};
