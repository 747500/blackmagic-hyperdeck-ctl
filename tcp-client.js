
"use strict";


var net = require('net');
var readline = require('readline');

function HyperDeck(options) {

	var socket = net.connect(options);

	var rd = readline.createInterface({
		input: socket,
		terminal: false
	});

	var cmdQueue = [];
	var reply = [];

	rd.on('line', function (data) {

		data = data.toString();
		reply.push(data);

		if (1 === reply.length && data.match(/:$/)) {
			return;
		}

		if (1 < reply.length && 0 !== data.length) {
			return;
		}

		var text = reply.join('\n');
		reply = [];

		var parsed = text.match(/^(\d+)\s+([^]*)$/);

		var result = {
			code: '000',
			text: ''
		};

		if (parsed) {
			result.code = parsed[1];	
			result.text = parsed[2];
		}
		else {
			result.text = text;
		}

		if (result.code >= 500) {
			socket.emit('notify', result);
			return;
		}

		var item = cmdQueue.shift();

		clearTimeout(item.timeout);

		result.command = item.command;
		item.cb(result);

		if (cmdQueue.length) {
			setTimeout(function () {
				socket.write(cmdQueue[0].command + '\n');
			}, 1000);
		}
	});

	// interface

	var O = function () {};

	O.prototype = socket;

	O.prototype.command = function (cmd, cb) {

		cmdQueue.push({
			command: cmd,
			cb: cb,
			timeout: setTimeout(function () {
				socket.emit('error', new Error('Command timed out'));
				socket.destroy();
			}, 1000)
		});

		if (cmdQueue.length === 1) {
			socket.write(cmdQueue[0].command + '\n');
		}

	};
	
	return new O();
};


// -----------------------------------------------------------------------

var hyperdeck = new HyperDeck({
	host: '127.0.0.1',
	port: 9993
});

hyperdeck.once('error', function (err) {

	console.error('remote failed: %s', err.toString());
	process.exit(1);

});

hyperdeck.on('close', function () {
	console.log('remote disconnected');
});

hyperdeck.on('notify', function (data) {
	console.log('notify: %s', JSON.stringify(data, null, 2));
});

var cmdList = [
	'help 1',
	'device info 2',
	'help 3',
	'ping',
	'device info 4',
	'help 5',
	'device info 6',
	'help 7',
	'device info 8',
	'help 9',
	'device info 10'
];
/*
var pingTimer = setInterval(function () {
	hyperdeck.command('ping', function (data) {
		console.log('alive');
	});
	
	if (cmdList.length === 0) {
		clearInterval(pingTimer);
		console.log('--------');
	}
}, 300);
*/
var cmdTimer = setInterval(function () {

	var cmd = cmdList.shift();

	if (cmd) {
		console.log('> %s', cmd);
		
		hyperdeck.command(cmd, function (data) {
			console.log('%s', JSON.stringify(data, null, 2));
		});

	}
	else {
		clearInterval(cmdTimer);
		console.log('--------');
	}

}, 1000);

