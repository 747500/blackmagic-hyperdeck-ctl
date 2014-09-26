
"use strict";

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var util = require('util');
var net = require('net');
var readline = require('readline');

var server = net.createServer({
	allowHalfOpen: false
}, function(socket) {

	console.log('client connected');

	socket.on('error', function (err) {
		console.log(err);
	});

	socket.on('close', function () {
		console.log('client disconnected');
	});

	socket.write(
		'500 connection info:\n' +
		'protocol version: 1.1\n' +
		'model: HyperDeck Studio\n' +
		'\n'
	);

	var rd = readline.createInterface({
		input: socket,
//		output: process.stdout,
		terminal: false
	});

	rd.on('line', function(line) {

		console.log('>>> %s', line);

		if (line.match(/^ping/)) {
			socket.write('200 Ok\n');
			return;
		}

		if (line.match(/^quit/)) {
			socket.write('200 Ok\n');
			socket.end();
			return;
		}

		socket.write(util.format('100 Unsupported command: "%s"\n', line));
	});
});

var address = '127.0.0.1';
var port = 9993;

server.listen(port, address, function (err) {

	if (err) {
		console.log('Could not listen: %s\n', err.stack || err);
		process.exit(1);
		return;
	}

	console.log('%s:%s...', address, port);

});
