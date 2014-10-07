
"use strict";

var util = require('util');

var net = require('net');
var readline = require('readline');
var _ = require('underscore');

function HyperDeckConnector(options) {

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

		result.command = item.command;
		item.cb(result);

		if (cmdQueue.length) {
			socket.write(cmdQueue[0].command + '\n');
		}
	});

	// interface

	var O = function () {};

	O.prototype = socket;

	O.prototype.command = function (cmd, cb) {
		var self = this;

		cmdQueue.push({
			command: cmd,
			cb: cb
		});

		if (cmdQueue.length === 1) {
			self.write(cmdQueue[0].command + '\n');
		}

	};

	return new O();
};

module.exports = HyperDeckConnector;


