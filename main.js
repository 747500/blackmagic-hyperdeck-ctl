
"use strict";

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var util = require('util');
var child_process = require('child_process');

var _ = require('underscore');
var uuid = require('uuid');

var HyperDeckPool = require('./HyperDeckPool.js');


// -----------------------------------------------------------------------

var pool = new HyperDeckPool();

var ui = child_process.fork('./ui.js');

pool.on('open', function (params) {
//	console.log('open   %j', params);
	
	ui.send({
		type: 'HyperDeck:open',
		data: params	
	});
});

pool.on('close', function (params) {
//	console.log('close  %j', params);

	ui.send({
		type: 'HyperDeck:close',
		data: params	
	});
});

pool.on('notify', function (params) {
//	console.log('notify %s', JSON.stringify(params, null, 2));

	ui.send({
		type: 'HyperDeck:notify',
		data: params	
	});
});

pool.on('add', function (params) {
//	console.log('add    %j',  params);

	ui.send({
		type: 'HyperDeck:add',
		data: params	
	});
});

pool.on('update', function (params) {
//	console.log('update %j', params);

	ui.send({
		type: 'HyperDeck:update',
		data: params	
	});
});

pool.on('remove', function (params) {
//	console.log('remove %j', params);

	ui.send({
		type: 'HyperDeck:remove',
		data: params	
	});
});

ui.on('message', function (message) {
//	console.log('Incoming message:\n%s\n',
//			JSON.stringify(message, null, 2));

	if ('object' !== typeof message) {
		console.error('Incoming "message" is not an "object": "%s"',
				typeof message);
		return;
	}

	if ('string' !== typeof message.type) {
		console.error('Incoming "message.type" is not a "string": "%s"',
				typeof message.type);
		return;
	}

	if ('HyperDeck:add' === message.type) {
		pool.add(message.data);
		return;
	}

	if ('HyperDeck:update' === message.type) {
		pool.update(message.data);
		return;
	}

	if ('HyperDeck:remove' === message.type) {
		pool.remove(message.data);
		return;
	}

	console.error('Unexpected "message" ignored:\n%s\n',
			JSON.stringify(message, null, 2));
});

console.log('Init completed');

/*
var items = [
	{
		id: '1',
		name: 'Cam1',
		host: '127.0.0.1',
		port: 9993
	},
	{
		id: '2',
		name: 'Cam2',
		host: '127.0.0.2',
		port: 9993
	},
	{
		id: '3',
		name: 'Cam3',
		host: '127.0.0.3',
		port: 9993
	},
	{
		id: '4',
		name: 'Cam4',
		host: '127.0.0.4',
		port: 9993
	},
	{
		id: '5',
		name: 'Cam5',
		host: '127.0.0.5',
		port: 9993,
		disabled: true
	},
	{
		id: '6',
		name: 'Cam6',
		host: '127.0.0.6',
		port: 9993,
		disabled: true
	}
];

items.forEach(function (item) {
	pool.add(item);
});

setTimeout(function () {

	pool.update({
		id: '2',
		host: '127.0.0.222'
	});

}, 5 * 1000);


setTimeout(function () {

	pool.update({
		id: '3',
		disabled: true
	});

}, 6 * 1000);

setTimeout(function () {

	pool.remove({
		id: '1'
	});

}, 7 * 1000);

setTimeout(function () {

	pool.update({
		id: '5',
		disabled: false
	});

}, 8 * 1000);

setTimeout(function () {

	pool.command('ping', function (reply) {
		pool.emit('notify', reply);
	});

}, 9 * 1000);

setTimeout(function () {
	process.exit(0);
}, 10 * 1000);

*/

// -----------------------------------------------------------------------

/*
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
		console.log('--------');
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
		console.log('--------');
	}

}, 1000);
*/

