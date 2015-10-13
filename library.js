(function(module) {
  "use strict";

  var	passport = module.parent.require('passport'),
  	passportLocal = module.parent.require('passport-local').Strategy,
  	User = module.parent.require('./user'),
    Groups = module.parent.require('./groups'),
    meta = module.parent.require('./meta'),
    db = module.parent.require('../src/database'),
    fs = module.parent.require('fs'),
    path = module.parent.require('path'),
    nconf = module.parent.require('nconf'),
    winston = module.parent.require('winston'),
    async = module.parent.require('async'),
    cookie = require('cookie-signature'),
    request = require('request'),
    constants = Object.freeze({
      name: 'contentblvd'
    }),
  	plugin = {};

  plugin.login = function() {
  	winston.info('[login] Registering new local login strategy');
  	passport.use(new passportLocal({passReqToCallback: true}, plugin.continueLogin));
  };

  plugin.continueLogin = function(req, username, password, next) {
    
      var val_decoded = new Buffer(username,'base64').toString('ascii');
      winston.info('decoded is ' + val_decoded);
      var externalID = cookie.unsign(val_decoded, process.env.FORUM_SSO_SECRET);
      winston.info('unsigned is ' + externalID);
    
      request('https://app.contentblvd.com/v1/users/' + externalID, function (err, response, body) {
  			if (err) {
  				return next(null, null);
  			}
  			if (response.statusCode === 200) {
  				var data = JSON.parse(body);
  				// console.log(data);
  				var fullName = data.first_name + ' ' + data.last_name;
  				fullName = fullName.trim();
  				if (!fullName) {
  				  if (data.media_properties.length > 0)
  				    fullName = data.media_properties[0].name;
  				}
  				if (!fullName) {
  				  if (data.brands.length > 0)
  				    fullName = data.brands[0].name;
  				}
  				var profile = {};
          profile.id = data.id;
          profile.displayName = fullName;
          profile.email = data.email;
          profile.picture = data.avatar;
          if (data.default_role == 'admin') {
            profile.isAdmin = 1;
          }
          plugin.moreLogin({
            CBid: profile.id,
            handle: profile.displayName,
            email: profile.email,
            isAdmin: profile.isAdmin,
            picture: profile.picture
          }, function(err, user) {
            if (err) {
              return next(err);
            }
            var duration = 1000*60*60*24*parseInt(meta.config.loginDays || 14, 10);
      			req.session.cookie.maxAge = duration;
      			req.session.cookie.expires = new Date(Date.now() + duration);
            next(null, user);
          });
  			}
  		});
  };

  plugin.getUidByCBid = function(CBid, callback) {
    db.getObjectField(constants.name + 'Id:uid', CBid, function(err, uid) {
      if (err) {
        return callback(err);
      }
      callback(null, uid);
    });
  };

  plugin.moreLogin = function(payload, callback) {
    if (payload) {
      winston.info('[payload]' + payload);
      plugin.getUidByCBid(payload.CBid, function(err, uid) {
        if (err) {
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
              
              if (payload.picture) {
                var picture = payload.picture;
                if ( picture.match(/^http/i) ) {
                  // already has domain
                } else {
                  picture = 'https://d2m2amo0drgja.cloudfront.net/w400/' + picture;
                }
  							User.setUserField(uid, 'uploadedpicture', picture);
  							User.setUserField(uid, 'picture', picture);
              }

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
            if (err) {
              return callback(err);
            }

            if (!uid) {
              User.create({
                username: payload.handle,
                email: payload.email
              }, function(err, uid) {
                if (err) {
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
    } else {
      winston.error('[missing payload]');
      if (callback) {
        callback(new Error('[[error:missing-payload]]'));
      }
    }
  };

  module.exports = plugin;
}(module));