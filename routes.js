
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
		console.log('model(notify) >> sockets(deck:message)', message);
		io.sockets.emit('deck:message', message);
	});

	model.on('close', function (deck) {
		io.sockets.emit('deck:disconnect', deck);	
	});

	model.on('open', function (deck) {
		io.sockets.emit('deck:connect', deck);	
	});

	io.on('connection', function (socket) {

		console.log('socket.io: client connected');

		console.log('Decks loaded: %s', _(model.table).keys().length);

		_(model.table).keys().forEach(function (k) {
			var deck = model.table[k];
			socket.emit('deck:create', deck);
		});

		_(model.messages).forEach(function (message) {
			socket.emit('deck:message', message);
		});

		socket.on('deck:command', function (cmd) {
			model.sendCommand(cmd);		
		});

		socket.on('disconnect', function () {
			console.log('socket.io: client disconnected');
		});

		socket.on('error', function (err) {
			console.log('socket.io: failed with: %s\n', err.stack || err);
		});

		// ------------------------------------------------------------------

		socket.on('read:messages', function (data, reply) {
			console.log('client tries to get messages...');
			reply(model.messages);
		});

		socket.on('read:recorders', function (data, reply) {
			console.log('client tries to get all recorders...');
			reply(model.table);
		});

		socket.on('update:recorders', function (data, reply) {
			console.log('client tries to update recorder...');
			reply(data);
		});

		socket.on('create:recorders', function (data, reply) {
			console.log('client tries to create recorder...');
			data.id = uuid();
			reply(data);
		});

		socket.on('delete:recorders', function (data, reply) {
			console.log('client tries to delete recorder...');
			reply(data);
		});

		socket.on('command:recorders', function (data) {
			console.log('client tries to send a command to recorder...');
			reply(data);
		});
	});

};

