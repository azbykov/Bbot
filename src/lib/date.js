'use strict';

const pad = (value, size = 2) => String(value).padStart(size, '0');

const parseButsaDate = (value) => {
	const [day, month, shortYear] = value.split('.').map(Number);
	const year = shortYear < 100 ? 2000 + shortYear : shortYear;

	return new Date(year, month - 1, day);
};

const calendarDayNumber = (date) => Date.UTC(
	date.getFullYear(),
	date.getMonth(),
	date.getDate()
) / 86400000;

const isWithinPastDays = (date, days, now = new Date()) => {
	const difference = calendarDayNumber(now) - calendarDayNumber(date);

	return difference >= 0 && difference <= days;
};

const formatLogTimestamp = (value) => {
	const date = new Date(value);

	return [
		`${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`,
		`${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}:${pad(date.getMilliseconds(), 3)}`
	].join(' ');
};

const formatReportTimestamp = (value = new Date()) => new Intl.DateTimeFormat('ru-RU', {
	weekday: 'long',
	day: '2-digit',
	month: 'long',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
}).format(value);

module.exports = {
	formatLogTimestamp,
	formatReportTimestamp,
	isWithinPastDays,
	parseButsaDate
};
