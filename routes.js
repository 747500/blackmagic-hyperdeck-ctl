
"use strict";

var fs = require('fs');

var _ = require('underscore');
var low = require('lowdb');

module.exports = function (app) {

	app.get('/', function(req, res){
		res.render('index', {
			user: req.user,
			message: req.session.messages
		});
	});

};
