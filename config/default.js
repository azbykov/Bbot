'use strict';

const path = require('path');

module.exports = {
	bot: {
		server: {
			port: process.env.PORT || 3000
		},

		auth: {
			login: 'login',
			password: 'password'
		},

		team: {
			name: '',
			id: ''
		},

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
		},
		mail: {
			label: 'Новые письма'
		},
		optimizeTraining: {
			label: 'Оптимизация тренировок'
		},

		comments: {
			label: 'Пресс-центр'
		},
		stubDir: path.join(__dirname, '../bot/stubs/')
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
				json: false
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
