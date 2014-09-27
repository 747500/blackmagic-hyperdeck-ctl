
"use strict";

var events = require('events');
var net = require('net');

var _ = require('underscore');
var readline = require('readline');

var Party;

Party = function () {
	this.list = {};

};

Party.prototype = new events.EventEmitter();

Party.prototype.memberConnect = function (info) {
	var self = this;

	if ('undefined' !== typeof this.list[info.id]) {
		console.log('memberConnect: socket listed:\n%s\n', info);
		return;
	}

	var recorder = this.list[info.id] = {
		socket: undefined,
		reply: ''
	};

	var socket = net.connect({
		host: info.host,
		port: info.port
	});

	recorder.socket = socket;

	var rd = readline.createInterface({
		input: socket,
//		output: process.stdout,
		terminal: false
	});

	rd.on('line', function (data) {
	
		data = data.toString();

		if (recorder.reply.length === 0) {
			if (data.match(/:$/)) {
				recorder.reply += data + '\n';
				return;
			}

			self.emit('event:recorders', {
				createdAt: new Date(),
				message: data + '\n',
				recorder: info
			});
			return;		
		}

		if (0 !== data.length) {
			recorder.reply += data + '\n';
			return;
		}

		self.emit('event:recorders', {
			createdAt: new Date(),
			message: recorder.reply,
			recorder: info
		});
		
		recorder.reply = '';
	});

	socket.on('connect', function () {
		console.log('socket: connect');
	});

	socket.on('end', function () {
		console.log('socket: end');
		delete self.list[info.id];
	});

	socket.on('error', function (err) {
		delete self.list[info.id];

		console.log('socket err:\n%s\n', err.stack || err);
		socket.destroy();
		
		self.emit('event:recorders', {
			createdAt: new Date(),
			error: err.toString(),
			recorder: info
		});
	});

};

Party.prototype.memberDisconnect = function (data) {

	var recorder = this.list[data.id];
	
	if ('object' !== typeof recorder) {
		console.log('memberConnect: socket unlisted:\n%s\n', data);
		return;
	}

	recorder.socket.end();
	delete this.list[data.id];
};

Party.prototype.memberIsConnected = function (data) {
	var recorder = this.list[data.id];
	return 'object' === typeof recorder;
};

Party.prototype.memberCommand = function (command) {
	console.log('>>> %s', _(this.list).keys().length);
	
	_(this.list).values().map(function (recorder) {
		recorder.socket.write(command + '\n');
	});

};

// singleton
module.exports = new Party();

