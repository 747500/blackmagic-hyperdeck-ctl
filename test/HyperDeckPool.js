
"use strict";

var util = require('util');
var child_process = require('child_process');

var _ = require('underscore');
var uuid = require('uuid');

var HyperDeckPool = require('../HyperDeckPool.js');

// -----------------------------------------------------------------------

var pool = new HyperDeckPool();

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

pool.on('open', function (params) {
	console.log('open   %j', params);
});

pool.on('close', function (params) {
	console.log('close  %j', params);
});

pool.on('notify', function (params) {
	console.log('notify %s', JSON.stringify(params, null, 2));
});

pool.on('add', function (params) {
	console.log('add    %j',  params);
});

pool.on('update', function (params) {
	console.log('update %j', params);
});

pool.on('remove', function (params) {
	console.log('remove %j', params);
});



items.forEach(function (item) {
	pool.add(item);
});

setTimeout(function () {

	pool.update({
		id: '2',
		host: '127.0.0.222'
	});

}, 1 * 1000);


setTimeout(function () {

	pool.update({
		id: '3',
		disabled: true
	});

}, 3 * 1000);

setTimeout(function () {

	pool.remove({
		id: '1'
	});

}, 4 * 1000);

setTimeout(function () {

	pool.update({
		id: '5',
		disabled: false
	});

}, 5 * 1000);

setTimeout(function () {

	pool.command('ping', function (reply) {
		pool.emit('notify', reply);
	});

}, 6 * 1000);

setTimeout(function () {
	process.exit(0);
}, 7 * 1000);
