
"use strict";

var path = require('path');

var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var bodyParser = require('body-parser');

module.exports = function (app, config) {

	app.set('showStackError', true);

	app.use(morgan('dev')); // { format: ':method ":url" :status' }

/*
	// should be placed before express.static
	app.use(express.compress({
		filter: function (req, res) {
			var h = rsdfes.getHeader('Content-Type');
			return /json|text|javascript|css/.test(h)
		},
		level: 6
	}));
*/

	app.use(express.static(path.join(config.root, 'public')));

	//app.set('views', path.join(config.root, 'views'));
	//app.set('view engine', 'jade');

	app.set('views', path.join(config.root, 'views'));
	app.set('view engine', 'ejs');
	app.engine('ejs', require('ejs-locals'));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.use(cookieParser());

	app.use(errorHandler({
		showStack: true,
		dumpExceptions: true
	}));

	app.locals.pretty = true;

};
