
"use strict";

var util = require('util');
var fs = require('fs');

var _ = require('underscore');
var uuid = require('uuid');
var low = require('lowdb');

var tcp = require('./tcp.js');

var db = low('db.json');

db('recorders').value().map(function (recorder) {
	tcp.memberConnect(recorder);
});

module.exports = function (app, io) {

	app.get('/', function (req, res, next) {
		res.render('index', {
			user: req.user,
			message: req.session.messages
		});
	});

	io.on('connection', function (socket) {

		console.log('socket.io: new socket');

		socket.on('read:recorders', function (data, reply) {
			reply(db('recorders').value());
		});

		socket.on('update:recorders', function (data, reply) {
			var recorder = db('recorders').find({ id: data.id });

			if (!recorder) {
				console.log('recorder not found:\n%s\n', data);
				return;
			}

			recorder.assign(data);
			db.save();

			reply(recorder.value());
		});

		socket.on('create:recorders', function (data, reply) {
			data.id = uuid();
			var recorder = db('recorders').push(data);
			db.save();
			reply(recorder.value());
		});

		socket.on('delete:recorders', function (data, reply) {
			var recorder = db('recorders').find({ id: data.id });

			if (!recorder) {
				console.log('recorder not found:\n%s\n', data);
				return;
			}

			db('recorders').remove({ id: data.id });
			db.save();
			reply({});	
		});

		socket.on('disconnect', function () {
			console.log('socket.io: socket disconnect');
		});

		socket.on('error', function (err) {
			consoe.log('socket.io: socket error:\n%s\n', err.stack || err);
		})

	});

};

