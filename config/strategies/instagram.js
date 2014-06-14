'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	url = require('url'),
	InstagramStrategy = require('passport-instagram').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users');

module.exports = function() {
	// Use twitter strategy
	passport.use(new InstagramStrategy({
			consumerKey: config.instagram.clientID,
			consumerSecret: config.instagram.clientSecret,
			callbackURL: config.instagram.callbackURL
		},
		function(req, token, tokenSecret, profile, done) {
			// Set the provider data and include tokens
			console.log(profile);
			//var providerData = profile._json;
			//providerData.token = token;
			//providerData.tokenSecret = tokenSecret;

			//// Create the user OAuth profile
			//var providerUserProfile = {
			//	displayName: profile.displayName,
			//	username: profile.username,
			//	provider: 'twitter',
			//	providerIdentifierField: 'id_str',
			//	providerData: providerData
			//};

			//// Save the user OAuth profile
			//users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};
