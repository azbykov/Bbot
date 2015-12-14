var Order = function(options) {
	this.filename = options.filename || this.filename;
	this.id = options.id || this.id;
	this.load = 0;
	this.main_players = options.main_players || '';
	this.match = options.match || '';
	this.match_type = options.match_type || 0;
	this.players = options.players || '';
	this.reserveplayers = options.reserveplayers || '';
	this.roles = options.roles || '';
	this.subs = options.subs || '';
	this.subsCount = options.subsCount || 0;
	this.tasks = options.tasks || '';
	this.tasksCount = options.tasksCount || '';
	this.tour = options.tour || 0;
	this.zones = options.zones || '';

	//matches elements
	this.match_tactics = options.match_tactics || 50;
	this.match_passes = options.match_passes || 0;
	this.match_strategy = options.match_strategy || 0;
	this.match_pressing = options.match_pressing || 0;
	this.match_pressing_flank = options.match_pressing_flank || 50;
	this.match_pressing_attack_defence = options.match_pressing_attack_defence || 50;

	//roles
	this.role_Captain = options.role_Captain || '';
	this.role_LeftCorners = options.role_LeftCorners || '';
	this.role_RightCorners = options.role_RightCorners || '';
	this.role_FreeKicks = options.role_FreeKicks || '';
	this.role_Penalties = options.role_Penalties || '';
};

Order.prototype.setMatch = function(match) {
	this.match = [
		this.match_tactics,
		this.match_passes,
		this.match_strategy,
		this.match_pressing,
		this.match_pressing_flank,
		this.match_pressing_attack_defence
	].join(';');
};

Order.prototype.setRoles = function() {
	this.roles = [
		this.role_Captain,
		this.role_LeftCorners,
		this.role_RightCorners,
		this.role_FreeKicks,
		this.role_Penalties
	].join(';');
};

module.exports = Order;
