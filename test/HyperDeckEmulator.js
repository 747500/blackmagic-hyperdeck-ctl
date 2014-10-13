
"use strict";

var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];

var util = require('util');
var net = require('net');
var readline = require('readline');

var server = net.createServer({
	allowHalfOpen: false
}, function(socket) {
	var remoteAddress = socket.remoteAddress,
		remotePort = socket.remotePort,
		localAddress = socket.localAddress,
		localPort = socket.localPort;

	console.log('%s:%s connected %s:%s',
			localAddress, localPort,
			remoteAddress, remotePort);

	socket.on('error', function (err) {
		console.log(err);
	});

	socket.on('close', function () {
		console.log('%s:%s disconnected %s:%s',
				localAddress, localPort,
				remoteAddress, remotePort);
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

		if (line.match(/^remote/)) {
			socket.write('210 remote info:\n' +
					'enabled: "false"\n' +
					'override: "false"\n' +
					'\n');
			return;
		}

		if (line.match(/^ping/)) {
			socket.write('200 Ok\n');
			return;
		}

		if (line.match(/^help/)) {
			socket.write('201 help:\n' +
					'{Help text})\n' +
					'{Help text})\n' +
					'\n');
			return;
		}

		if (line.match(/^quit/)) {
			socket.write('200 ok\n');
			socket.end();
			socket.destroy();
			return;
		}

		if (line.match(/^stop/)) {
			socket.write('200 ok\n');
			return;
		}

		if (line.match(/^record/)) {
			socket.write('200 ok\n');
			return;
		}

		if (line.match(/^play/)) {
			socket.write('200 ok\n');
			return;
		}

		if (line.match(/^device info/)) {
			socket.write(
				'204 device info:\n' +
				'protocol version: {Version}\n' +
				'model: {Model Name}\n' +
				'unique id: {unique alphanumeric identifier}\n' +
				'\n'
			);
			return;
		}

		socket.write(util.format('100 Syntax error: "%s"\n', line));
	});
});

var address = '0.0.0.0';
var port = 9993;

server.listen(port, address, function (err) {

	if (err) {
		console.log('Could not listen: %s\n', err.stack || err);
		process.exit(1);
		return;
	}

	console.log('listen %s:%s...', address, port);

});


