var	passport = module.parent.require('passport'),
	passportLocal = module.parent.require('passport-local').Strategy,
	plugin = {};

plugin.login = function() {
	winston.info('[login] Registering new local login strategy');
	passport.use(new passportLocal({passReqToCallback: true}, plugin.continueLogin));
};

plugin.continueLogin = function(req, username, password, next) {
    // Do your stuff here (query API or SQL db, etc...)
    
    var uid = 1;
    
    // If the login was successful:
    next(null, {
		uid: uid
	}, '[[success:authentication-successful]]');
	
	// But if the login was unsuccessful, pass an error back, like so:
	next(new Error('[[error:invalid-username-or-password]]'));
};

module.exports = plugin;