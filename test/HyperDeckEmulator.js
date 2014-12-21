
"use strict";

var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];

var util = require('util');
var net = require('net');
var readline = require('readline');

var state = {
	protocol_version: {
		major: 1,
		minor: 1
	},
	model: 'HyperDeck Studio',
	remote: {
		enable: false,
		override: false
	},
	notify: {				// reply
		transport: false,	// 508 transport info: ...
		slot: false,		// 502 slot info: ...
		remote: false,
		configuration: false
	}
};

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
		var reparsed;

		console.log('>>> %s', line);

		reparsed = line.match(/^remote(:\s+(enable:\s+(true|false)))?(:\s+(override:\s+(true|false)))?/);
		if (null !== reparsed) {

			if (reparsed[2]) {
				state.remote.enabled = JSON.parse(reparsed[3]);
			}
			if (reparsed[5]) {
				state.remote.override = JSON.parse(reparsed[6]);
			}

			socket.write(
				util.format(
					'210 remote info:\n' +
					'enabled: "%s"\n' +
					'override: "%s"\n' +
					'\n',
					state.remote.enabled,
					state.remote.override
					)
				);

			return;
		}

		reparsed = line.match(/^notify(:\s+(transport:\s+(true|false)))?(:\s+(slot:\s+(true|false)))?(:\s+(remote:\s+(true|false)))?(:\s+(configuration:\s+(true|false)))?/);
		if (null !== reparsed) {
			var reply;

			if (reparsed[2]) {
				state.notify.transport = JSON.parse(reparsed[3]);
				reply = '200 ok';
			}

			if (reparsed[5]) {
				state.notify.slot = JSON.parse(reparsed[6]);
				reply = '200 ok';
			}

			if (reparsed[8]) {
				state.notify.remote = JSON.parse(reparsed[9]);
				reply = '200 ok';
			}

			if (reparsed[11]) {
				state.notify.configuration = JSON.parse(reparsed[12]);
				reply = '200 ok';
			}

			if ('undefined' === typeof reply) {
				reply = util.format(
					'209 notify:\n' +
					'transport: "%s"\n' +
					'slot: "%s"\n' +
					'remote: "%s"\n' +
					'configuration: "%s"\n',
					state.notify.transport,
					state.notify.slot,
					state.notify.remote,
					state.notify.configuration
				);
			}

			socket.write(reply + '\n');
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
				'protocol version: %s.%s\n' +
				'model: %s\n' +
				'unique id: {unique alphanumeric identifier}\n' +
				'\n',
				state.protocol_version.major,
				state.protocol_version.minor,
				state.model
			);
			return;
		}

		var replyStr = util.format('100 Syntax error: "%s"\n', line);
		console.log(replyStr);
		socket.write(replyStr);
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


