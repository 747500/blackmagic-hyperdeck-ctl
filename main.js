
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
	console.log('notify %s', JSON.stringify(params, null, 2));

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

	if ('HyperDeck:command' === message.type) {
		pool.command(message.data, function (reply) {
			reply.type = 'message';
			ui.send({
				type: 'HyperDeck:notify',
				data: reply
			})
		});
		return;
	}

	console.error('Unexpected "message" ignored:\n%s\n',
			JSON.stringify(message, null, 2));
});

console.log('Init completed');

