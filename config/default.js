var path = require('path');

module.exports = {
	bot: {
		server: {
			port: process.env.PORT || 3000
		},

		auth: {
			login: 'login',
			password: 'password'
		},

		path: {
			protocol: 'http://',
			domain: 'www.butsa.ru',
			auth: '/index.php?login=1',
			office: '/office',
			order: '/builder',
			orderParams: '/test.php?start_debug=1',
			friendly: '/xml/office/organizer.php?type=office/organizer&act=friendly',
			goods: '/xml/finance/shop.php?type=finance/shop&act=buy',
			buildings: '/xml/team/buildings.php?type=team/buildings&act=repairall2'
		},

		team: [
			{
				"name": "livar",
				"id": 3923
			},
			{
				"name": "international",
				"id": 10687
			}
		],

//		orderName: 'test'
		orderName: 'auto',
		friendly: {
		},
		goods: {
			goods: 300000,
			games: 2
		},
		buildings: {
		}
	},

	log: {
		transports: {
			console: {
				level: 'debug',
				colorize: true
			},
			file: {
				level: 'debug',
				filename: path.join(__dirname, '../log/', 'node.log'),
				json: false,
				timestamp: function() {
					var date = new Date();
					var dateArr = [
						date.getDate(),
						date.getMonth()+1,
						date.getFullYear()
					];
					var timeArr =[
						('00' + date.getHours()).slice(-2),
						('00' + date.getMinutes()).slice(-2),
						('00' + date.getSeconds()).slice(-2),
						('000' + date.getMilliseconds()).slice(-3)
					];
					return dateArr.join('.') + ' ' + timeArr.join(':')
				}
			}
		}
	}
};
