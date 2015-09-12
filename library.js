var winston = require('winston');

var	passport = module.parent.require('passport'),
	passportLocal = module.parent.require('passport-local').Strategy,
	plugin = {};

plugin.login = function() {
	winston.info('[login] Registering new local login strategy');
	passport.use(new passportLocal({passReqToCallback: true}, plugin.continueLogin));
};

plugin.continueLogin = function(req, username, password, next) {
    // Do your stuff here (query API or SQL db, etc...)
    
    console.log(req.body);
    winston.info('[login] email is ' + req.query.email);
    winston.info('[login] username is ' + username);
    winston.info('[login] ready to start session login');
    var uid = 1;
    
    if (uid) {
      
      next(null, {
  		  uid: uid
  	  }, '[[success:authentication-successful]]');
  	  
  	} else{  
	
    	// But if the login was unsuccessful, pass an error back, like so:
    	next(new Error('[[error:invalid-username-or-password]]'));
    	
    }
};

module.exports = plugin;