var winston = require('winston');
var cookie = require('cookie-signature');
var request = require('request');

var	passport = module.parent.require('passport'),
	passportLocal = module.parent.require('passport-local').Strategy,
	plugin = {};

plugin.login = function() {
	winston.info('[login] Registering new local login strategy');
	passport.use(new passportLocal({passReqToCallback: true}, plugin.continueLogin));
};

plugin.continueLogin = function(req, username, password, next) {
    // Do your stuff here (query API or SQL db, etc...)
    
    //console.log(req.body);
    winston.info('[login] email is ' + req.query.email);
    winston.info('[login] username is ' + username);
    winston.info('[login] ready to start session login');
    
    var val = cookie.sign('1', 'ruttabegga');
    winston.info('signed is ' + val);
    var val_encoded = new Buffer(val).toString('base64');
    winston.info('encoded is ' + val_encoded);
    
    var val_decoded = new Buffer(username,'base64').toString('ascii');
    winston.info('decoded is ' + val_decoded);
    var externalID = cookie.unsign(val_decoded, 'ruttabegga');
    winston.info('unsigned is ' + val2);
    
    request('https://app.contentblvd.com/v1/users/' + externalID, function (err, response, body) {
			if (err) {
				return next(null, null);
			}
			if (response.statusCode === 200) {
				var data = JSON.parse(body);
				console.log(data);
			}
			next(null, user);
		});
    
    
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