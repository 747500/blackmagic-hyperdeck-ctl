
"use strict";

var fs = require('fs');

var _ = require('underscore');
var uuid = require('uuid');
var low = require('lowdb');

var db = low('db.json');

console.log(db('recorders').value());

module.exports = function (app) {

	app.get('/', function (req, res, next) {
		res.render('index', {
			user: req.user,
			message: req.session.messages
		});
	});

	app.get('/recorders', function (req, res, next) {
		res.status(200).send(db('recorders').value());
	});

	app.post('/recorders', function (req, res, next) {
		var recorder = req.body;
		recorder.id = uuid();

		db('recorders').push(recorder);

		res.status(200).send(recorder);
	});

	app.put('/recorders/:id', function (req, res, next) {

		if (req.params.id !== req.body.id) {
			res.status(400).send('recorder id does not match');
			return;
		}

		var recorder = db('recorders').find({ id: req.params.id });

		if (!recorder) {
			res.status(404).send('recorder not found');
			return;
		}

		recorder.assign(req.body);

		res.status(200).send(recorder);
	});

	app.delete('/recorders/:id', function (req, res, next) {

		var recorder = db('recorders').find({ id: req.params.id });

		if (!recorder) {
			res.status(404).send('recorder not found');
			return;
		}

		db('recorders').remove({ id: req.params.id });

		res.status(200).send({});	
	});
};

