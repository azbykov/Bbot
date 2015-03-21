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
			host: 'http://www.butsa.ru',
			auth: '/index.php?login=1',
			office: '/office',
			order: '/builder',
			orderParams: '/test.php?start_debug=1',
			friendly: '/xml/office/organizer.php?type=office/organizer&act=friendly',
			goods: '/xml/finance/shop.php?type=finance/shop&act=buy',
			buildings: '/xml/team/buildings.php?type=team/buildings&act=repairall2',
			matches: '/matches',
			training: '/xml/players/train.php',
			trainingJunior: '/xml/school/train.php',
			financial: '/finances/report.php'
		},

		team: [
			{
				name: '',
				id: ''
			}
		],

//		orderName: 'test'
		orderName: 'auto',
		friendly: {
			label: 'Отправка тов. матча',
			alreadyDone: 'Вы уже играете в этом туре',
			params: {
				step: 1,
				type: 'office/organizer',
				act: 'friendly',
				Type: 0,
				minvr: 1, 	// Минимальный ЗР
				minp11: 1, 	// Минимальная средняя С11
				maxp11: 200 // Максимальная средняя С11
			}
		},
		goods: {
			label: 'Покупка товара',
			goods: 300000,
			games: 2,
			params: {
				step: 1,
				type: 'finance/shop',
				firstpage: '/xml/finance/shop.php?type=finance/shop&act=buy2',
				act: 'buy'
			}
		},
		buildings: {
			label: 'Ремонт построек',
			alreadyDone: 'Ваши постройки не требуют ремонта!',
			params: {
				step: 1,
				type: 'team/buildings',
				firstpage: '/xml/team/buildings.php?act=repairall',
				act: 'repairall2'
			}
		},
		nearMatch: {
			label: 'Ближайший матч'
		},
		resultMatches: {
			label: 'Результат последнего матча'
		},
		training: {
			label: 'Результаты тренировок'
		},
		trainingJunior: {
			label: 'Тренировки ДЮСШ'
		},
		financial: {
			report: {
				label: 'Финансовый отчет'
			}
		}
	},

	log: {
		transports: {
			console: {
				level: 'info',
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
	},

	mail: {
		service: '',
		auth: {
			user: '',
			pass: ''
		}
	},

	mailUsers: [
		{
			email: '',
			name: {
				first: '',
				last: ''
			}
		}
	],

	reports: {
		daily: {
			subject: 'Daily report (Ежедневный отчет)'
		},
		error: {
			subject: 'Bbot error'
		}
	}
};
