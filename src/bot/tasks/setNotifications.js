'use strict';

const log = require('../../lib/log')('task_set_notification');
const team = require('../../lib/team');
const {notification} = require('../../lib/notification');

const BonusPointsAlert = require('../../lib/alerts/bonus-points');
const TalentAlert = require('../../lib/alerts/talent');
const DepositAlert = require('../../lib/alerts/deposit');

const DEFAULT_MAX_DEPOSIT_SUM = 240000000;

const getPointsAlerts = async() => {
	const {roster} = await team.club.value;

	roster.forEach(({points, name, id, link}) => {
		const [current, levelPoint] = points.split('(');
		const levelPointNum = levelPoint.replace(')', '');
		if (Number(current) >= Number(levelPointNum)) {
			notification.alerts.push(new BonusPointsAlert({
				name,
				id,
				link,
				points
			}));
		}
	});
};

const getTalentAlerts = async() => {
	const {players} = await team.youngs.value;

	players.forEach(({talent, name, link}) => {
		if (talent) {
			const alertTalent = Object.keys(talent).find((days) => {
				return days <= TalentAlert.WARNING_PERIOD;
			});

			if (alertTalent) {
				notification.alerts.push(new TalentAlert({
					days: talent[alertTalent],
					talent: alertTalent,
					name,
					link
				}));
			}
		}
	});
};

const getDepositAlerts = async() => {
	const {deposit} = await team.finance.value;

	const {deposits, total} = deposit;

	deposits.forEach(({toursLeft, sum}) => {
		if (toursLeft <= DepositAlert.WARNING_PERIOD) {
			notification.alerts.push(new DepositAlert({
				sum,
				daysLeft: toursLeft,
				canMoreDeposit: total.sum < DEFAULT_MAX_DEPOSIT_SUM
			}));
		}
	});
};

const start = async() => {
	log.profiler.start('task_set_notifications');
	log.debug('[START] Set notifications');

	try {
		return Promise.all([
			getPointsAlerts(),
			getTalentAlerts(),
			getDepositAlerts()
		]);
	} catch (e) {
		throw new Error(e);
	} finally {
		log.debug('[COMPLETE] Set notifications', log.profiler.end('task_set_notifications'));
	}
};

module.exports = {
	start
};
