
"use strict";

var HyperDeckConnector = require('../HyperDeckConnector.js');


var hyperdeck = new HyperDeckConnector({
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

var pingTimer = setInterval(function () {
	hyperdeck.command('ping', function (data) {
		console.log('alive');
	});

	if (cmdList.length === 0) {
		clearInterval(pingTimer);
		process.emit('worker done', {});
	}
}, 300);

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
		process.emit('worker done', {});
	}

}, 1000);

var workers = 2;

process.on('worker done', function () {
	workers --;

	if (0 === workers) {
		hyperdeck.end();
	}

});
