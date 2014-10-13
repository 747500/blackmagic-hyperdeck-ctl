
"use strict";

var util = require('util');
var fs = require('fs');

var _ = require('underscore');
var uuid = require('uuid');

var model = require('./ui-model.js');

module.exports = function (app, io) {

	app.get('/', function (req, res, next) {
		res.render('index', {
			user: req.user,
			message: req.session.messages
		});
	});

	model.on('notify', function (message) {
		io.sockets.emit('deck:message', message);
	});

	model.on('update', function (deck) {
		console.log(deck);
		io.sockets.emit('deck:update', deck);
	});

	io.on('connection', function (socket) {

		console.log('socket.io: client connected');

		console.log('Decks loaded: %s', _(model.table).keys().length);

		_(model.table).keys().forEach(function (k) {
			var deck = model.table[k];
			socket.emit('deck:update', deck);
		});

		_(model.messages).forEach(function (message) {
			socket.emit('deck:message', message);
		});

		socket.on('deck:command', function (cmd) {
			model.sendCommand(cmd);
		});

		socket.on('deck:update', function (deck) {
			model.update(deck);
		});

		socket.on('disconnect', function () {
			console.log('socket.io: client disconnected');
		});

		socket.on('error', function (err) {
			console.log('socket.io: failed with: %s\n', err.stack || err);
		});
	});

};

