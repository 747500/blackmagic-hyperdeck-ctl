
"use strict";

var util = require('util');
var net = require('net');
var readline = require('readline');

var server = net.createServer(function(socket) {

	console.log('client connected');

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

		if (line.match(/^ping/)) {
			socket.write('200 Ok\n');
			return;
		}

		socket.write(util.format('100 Unsupported command: "%s"\n', line));
	});
});

server.listen(9993, '127.0.0.1');
