
"use strict";

var events = require('events');
var net = require('net');

var readline = require('readline');

var Party;

Party = function () {
	this.list = {};

};

Party.prototype = new events.EventEmitter();

Party.prototype.memberConnect = function (info) {
	var self = this;
	var socket = this.list[info.id];

	if ('undefined' !== typeof socket) {
		console.log('memberConnect: socket listed:\n%s\n', info);
		return;
	}

	socket = net.connect({
		host: info.host,
		port: info.port
	});

	var rd = readline.createInterface({
		input: socket,
//		output: process.stdout,
		terminal: false
	});

	var lastMessage = {
		incomplete: true,
		data: ''
	};

	rd.on('line', function (data) {
		if (lastMessage.incomplete) {
			lastMessage.data += data.toString();
		}

		console.log('socket: data:\n%s\n', data.toString());
	});

	socket.on('connect', function () {
		console.log('socket: connect');

		socket.write('ping\r\n');
	});

	socket.on('end', function () {
		console.log('socket: end:\n%s\n', arguments);
		delete self.list[info.id];

	});

	socket.on('error', function (err) {
		delete self.list[info.id];

		console.log('socket err:\n%s\n', err.stack || err);
		socket.destroy();
	});

	this.list[info.id] = socket;

};

Party.prototype.memberDisconnect = function (data) {

	var socket = this.list[data.id];
	
	if ('object' !== typeof socket) {
		console.log('memberConnect: socket unlisted:\n%s\n', info);
		return;
	}

	socket.end();
	delete this.list[info.id];
};

Party.prototype.memberIsConnected = function (data) {
	var socket = this.list[data.id];
	return 'object' === typeof socket;
};

module.exports = new Party();

/*
process.on('recorder:connect', function (data) {

	console.log('CONNECT\n%s\n', data);

	party.memberConnect(data);

});

process.on('recorder:disconnect', function (data) {

	console.log('DISCONNECT\n%s\n', data);

	party.memberDisconnect(data);

});
*/

