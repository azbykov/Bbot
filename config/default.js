var path = require('path');

module.exports = {
	bot: {
		server: {
			port: process.env.PORT || 3000
		},

		auth: {
			login: 'mygen',
			password: 2770236
		},

		path: {
			"domain": 'http://www.butsa.ru',
			"auth": '/index.php?login=1',
			"getOrder": '/builder',
			"sendOrder": '/builder/test.php?start_debug=1'
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
		]
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
                timestamp: true
            }
        }
    }
};
