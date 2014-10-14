
"use strict";

var util = require('util');
var events = require('events');
var fs = require('fs');

var _ = require('underscore');
var uuid = require('uuid');

process.on('disconnect', function () {
	process.exit(0);
});

function Model() {
	this.table = {};

	this.messagesMax = 10;
	this.messages = [];
}

Model.prototype = new events.EventEmitter();

Model.prototype.messagesExpire = function () {
	while (this.messages.length > this.messagesMax) {
		this.messages.shift();
	}
};

Model.prototype.sendCommand = function (cmd) {
	process.send({
		type: 'HyperDeck:command',
		data: cmd
	});
};

Model.prototype.update = function (deck) {
	delete deck.errors;
	process.send({
		type: 'HyperDeck:update',
		data: deck
	});
};

Model.prototype.dbLoadSync = function () {
	var list = JSON.parse(fs.readFileSync('db.json'));
	_(list).values().forEach(function (deck) {
		process.send({
			type: 'HyperDeck:add',
			data: _(deck).pick(
				'id',
				'name',
				'host',
				'port',
				'disabled',
				'order',
				'createdAt',
				'updatedAt',
				'deletedAt'
			)
		});
	});
};

Model.prototype.dbDump = function () {
	var data = _(this.table).values().map(function (deck) {
		return _(deck).pick(
			'id',
			'name',
			'host',
			'port',
			'disabled',
			'order',
			'createdAt',
			'updatedAt',
			'deletedAt'
		);
	});
	return JSON.stringify(data, null, 2);
};

Model.prototype.dbSave = function (cb) {
	fs.writeFile('db.json', this.dbDump(), cb);
};

var model = new Model();

process.on('message', function (message) {
	var data;
	var deck = _(message.data).pick(
		'id',
		'name',
		'host',
		'port',
		'disabled',
		'order',
		'errors'
	);

	if ('HyperDeck:add' === message.type) {
		deck.connected = false;
		deck.createdAt = new Date();
		deck.errors = [];
		model.table[deck.id] = deck;
		model.emit('update', deck);
		return;
	}

	if ('HyperDeck:notify' === message.type) {
		model.messages.push(message.data);
		model.messagesExpire();
		model.emit('notify', message.data);
		return;
	}

	deck = model.table[deck.id];
	data = message.data;

	if ('object' !== typeof deck) {
		console.error('Unknown deck:\n%s\n',
					  JSON.stringify(message, null, 2));
		return;
	}

	if ('HyperDeck:open' === message.type) {
		deck.connected = true;
		deck.errors = [];
		model.emit('update', deck);
		return;
	}

	if ('HyperDeck:fail' === message.type) {
		deck.errors.push(data.message);
		while (deck.errors.length > 5) {
			deck.errors.shift();
		}
		model.emit('update', {
			id: deck.id,
			errors: deck.errors
		});
		return;
	}

	if ('HyperDeck:update' === message.type) {
		[ 'name', 'host', 'port', 'disabled', 'order' ].forEach(function (k) {
			if (deck[k] === message.data[k]) {
				return; // not changed
			}
			deck[k] = message.data[k];
			deck.updatedAt = new Date();
		});
		console.log('UPDATE: %s', deck);
		model.dbSave(function (err) {
			if (err) {
				console.error('Can not write DB:\n%s\n', err.stack || err);
				return;
			}
			model.emit('update', deck);
		});
		return;
	}

	if ('HyperDeck:close' === message.type) {
		if (false === deck.connected) {
			return; // already disconnected
		}
		deck.connected = false;
		model.emit('update', deck);
		return;
	}

	if ('HyperDeck:remove' === message.type) {
		delete model.table[deck.id];
		model.emit('remove', deck);
		return;
	}

	console.log('UI: Unexpected message: %s\n',
			JSON.stringify(message, null, 2));

});

process.on('exit', function () {
	console.log('exit...');
});

process.on('SIGINT', function () {
	model.dbSave(function () {
		process.exit(0);
	});
});

model.dbLoadSync();

module.exports = model;

