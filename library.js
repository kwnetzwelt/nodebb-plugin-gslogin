(function(module) {
	"use strict";

	/*
		Welcome to the SSO OAuth plugin! If you're inspecting this code, you're probably looking to
		hook up NodeBB with your existing OAuth endpoint.

		Step 1: Fill in the "constants" section below with the requisite informaton. Either the "oauth"
				or "oauth2" section needs to be filled, depending on what you set "type" to.

		Step 2: Give it a whirl. If you see the congrats message, you're doing well so far!

		Step 3: Customise the `parseUserReturn` method to normalise your user route's data return into
				a format accepted by NodeBB. Instructions are provided there. (Line 137)

		Step 4: If all goes well, you'll be able to login/register via your OAuth endpoint credentials.
	*/

	var User = module.parent.require('./user'),
		Groups = module.parent.require('./groups'),
		meta = module.parent.require('./meta'),
		passport = module.parent.require('passport'),
		BearerStrategy = require('passport-http-bearer').Strategy,
		fs = module.parent.require('fs'),
		path = module.parent.require('path'),
		nconf = module.parent.require('nconf'),
		winston = module.parent.require('winston'),
		async = module.parent.require('async'),
		cookie = require('cookie-signature'),
    request = require('request'),

		constants = Object.freeze({
			name: 'contentblvd',	// Something unique to your OAuth provider in lowercase, like "github", or "nodebb"
			userRoute: ''	// This is the address to your app's "user profile" API endpoint (expects JSON)
		}),
		CB = {}, passportOAuth, opts;
	

	CB.getStrategy = function(strategies, callback) {
    passport.use(new BearerStrategy({}, function(token, done) {
  		// Find the user by token.  If there is no user with the given token, set
  		// the user to `false` to indicate failure.  Otherwise, return the
  		// authenticated `user`.  Note that in a production-ready application, one
  		// would want to validate the token for authenticity.
  		
  		// do decodin, unsigning, fetch user here
  		var token_decoded = new Buffer(token,'base64').toString('ascii');
      winston.info('decoded is ' + token_decoded);
      var CBid = cookie.unsign(token_decoded, 'ruttabegga');
      winston.info('unsigned is ' + CBid);
      
      request('https://app.contentblvd.com/v1/users/' + CBid, function (err, response, body) {
  			if (err) {
  				return done(null, null);
  			}
  			if (response.statusCode === 200) {
  				var data = JSON.parse(body);
  				console.log(data);
  				var profile = {};
      		profile.id = data.id;
      		profile.displayName = data.name;
      		profile.emails = [{ value: data.email }];
      		if (data.default_role == 'admin') {
      		  profile.isAdmin = 1;
      		}
      		
      		CB.login({
    				CBid: profile.id,
    				handle: profile.displayName,
    				email: profile.email,
    				isAdmin: profile.isAdmin
    			}, function(err, user) {
    				if (err) {
    					return done(err);
    				}
    				done(null, user);
    			});
  			}
  			
  		});
  		
  	}));

		strategies.push({
			name: constants.name,
			url: '/auth/' + constants.name,
			callbackURL: '/auth/' + constants.name + '/callback',
			icon: 'fa-check-square'
		});

		callback(null, strategies);

	};

	CB.login = function(payload, callback) {
		CB.getUidByCBid(payload.CBid, function(err, uid) {
			if(err) {
				return callback(err);
			}

			if (uid !== null) {
				// Existing User
				callback(null, {
					uid: uid
				});
			} else {
				// New User
				var success = function(uid) {
					// Save provider-specific information to the user
					User.setUserField(uid, constants.name + 'Id', payload.CBid);
					db.setObjectField(constants.name + 'Id:uid', payload.CBid, uid);

					if (payload.isAdmin) {
						Groups.join('administrators', uid, function(err) {
							callback(null, {
								uid: uid
							});
						});
					} else {
						callback(null, {
							uid: uid
						});
					}
				};

				User.getUidByEmail(payload.email, function(err, uid) {
					if(err) {
						return callback(err);
					}

					if (!uid) {
						User.create({
							username: payload.handle,
							email: payload.email
						}, function(err, uid) {
							if(err) {
								return callback(err);
							}

							success(uid);
						});
					} else {
						success(uid); // Existing account -- merge
					}
				});
			}
		});
	};

	CB.getUidByCBid = function(CBid, callback) {
		db.getObjectField(constants.name + 'Id:uid', CBid, function(err, uid) {
			if (err) {
				return callback(err);
			}
			callback(null, uid);
		});
	};

	CB.deleteUserData = function(uid, callback) {
		async.waterfall([
			async.apply(User.getUserField, uid, constants.name + 'Id'),
			function(CBIdToDelete, next) {
				db.deleteObjectField(constants.name + 'Id:uid', CBIdToDelete, next);
			}
		], function(err) {
			if (err) {
				winston.error('[sso-cb] Could not remove CBId data for uid ' + uid + '. Error: ' + err);
				return callback(err);
			}
			callback(null, uid);
		});
	};

	module.exports = CB;
}(module));