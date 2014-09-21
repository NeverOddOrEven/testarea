'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
	http = require('http'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	twitter = require('ntwitter'),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path');

module.exports = function(db) {
	// Initialize express app
	var app = express();
	var server = http.createServer(app);
	var io = require('socket.io').listen(server);

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + ':// ' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded());
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Enable jsonp
	app.enable('jsonp callback');

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		})
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.iexss());
	app.use(helmet.contentTypeOptions());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});
  
    // TODO - Put all these in environment variables
    var twitterClient =  new twitter({
                  consumer_key: process.env.TWITTER_KEY || 'UNDEFINED',
                  consumer_secret: process.env.TWITTER_SECRET || 'UNDEFINED',
                  access_token_key: process.env.TWITTER_ACCESS_KEY || 'UNDEFINED',
                  access_token_secret: process.env.TWITTER_ACCESS_SECRET || 'UNDEFINED'
              }),
        stream = null,
        users = [];
    
    io.on('connection', function (socket) {
        console.log('user connected');
        
        // The user it's added to the array if it doesn't exist
        if(users.indexOf(socket.id) === -1) {
            users.push(socket.id);
        }
      
        socket.on('start stream', function() {
            // The stream will be started only when the 1st user arrives
            if(stream === null) {
                twitterClient.stream('statuses/filter', {
                    //'locations':'38.46,-85.11,41.88,-80.37' // ohio
                    'locations' : '-83.1226,39.868,-82.8808,40.12' // NYC/NE
                }, function(s) {
                    stream = s;
                    stream.on('data', function(data) {
                        // only broadcast when users are online
                        if(users.length > 0) {
                            // This emits the signal to all users but the one
                            // that started the stream
                            socket.broadcast.emit('new tweet', data);
                            // This emits the signal to the user that started
                            // the stream
                            socket.emit('new tweet', data);
                        }
                        else {
                            // If there are no users connected we destroy the stream.
                            // Why would we keep it running for nobody?
                            console.log('users have all disconnected');
                            stream.destroy();
                            stream = null;
                        }
                    });
                  
                    stream.on('error', function(type, code, description) {
                        console.log(type + ' ' + code + ': ' + description);
                    });
                });
            }
        });

        // This handles when a user is disconnected
        socket.on('disconnect', function(o) {
            console.log('user disconnected');
            // find the user in the array
            var index = users.indexOf(socket.id);
            if(index != -1) {
                // Eliminates the user from the array
                users.splice(index, 1);
            }
          
            console.log('number of users connected: ' + users.length);
        });

        // Emits signal when the user is connected sending
        // the tracking words the app it's using
        socket.emit('connected', {
            tracking: ''
        });
  	});

	return server;
};
