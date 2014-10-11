
"use strict";

var util = require('util');
var events = require('events');
var fs = require('fs');

var _ = require('underscore');
var uuid = require('uuid');
var low = require('lowdb');

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
	process.send({
		type: 'HyperDeck:update',
		data: deck
	});
};

var model = new Model();

var db = low('db.json');

//
// Init parent - HyperDeck tcp pool
//
db('recorders').value().map(function (deck) {
	process.send({
		type: 'HyperDeck:add',
		data: _(deck).pick(
			'id',
			'name',
			'host',
			'port',
			'disabled'
		)
	});
});

process.on('message', function (message) {

	var deck = _(message.data).pick(
		'id',
		'name',
		'host',
		'port',
		'disabled'
	);

	if ('HyperDeck:add' === message.type) {
		deck.connected = false;
		model.table[deck.id] = deck;
		model.emit('add', deck);
		return;
	}

	if ('HyperDeck:notify' === message.type) {
		console.log('-');
		model.messages.push(message.data);
		model.messagesExpire();
		model.emit('notify', message.data);
		return;
	}

	deck = model.table[deck.id];

	if ('object' !== typeof deck) {
		console.error('Unexpected deck for message:\n%s\n',
				JSON.stringify(message, null, 2));
		return;
	}

	if ('HyperDeck:open' === message.type) {
		deck.connected = true;
		model.emit('update', deck);
		return;
	}

	if ('HyperDeck:update' === message.type) {
		model.emit('update', deck);
		return;
	}

	if ('HyperDeck:close' === message.type) {
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
	db.save();
});

process.on('SIGINT', function () {
	process.exit(0);
});

module.exports = model;

