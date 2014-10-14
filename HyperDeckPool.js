
"use strict";

var util = require('util');
var events = require('events');
var _ = require('underscore');

var HyperDeckConnector = require('./HyperDeckConnector.js');

var deckSchema = [
	'id',
	'host',
	'port',
	'name',
	'disabled',
	'order'
];

function HyperDeckPool() {
	this.pool = {};
	this.reconnectDelay = 1000;
}

HyperDeckPool.prototype = new events.EventEmitter();

HyperDeckPool.prototype.connect = function (params) {
	var self = this;

	if (params.socket) {
		console.log('alredy connected %s', params);
		process.nextTick(function () {
			self.emit('open', _(params).omit('socket'));
		});
		return;
	}

	params.socket = new HyperDeckConnector({
		host: params.host,
		port: params.port
	});

	params.socket.once('connect', function () {
		self.emit('open', _(params).omit('socket'));
	});

	params.socket.on('error', function (err) {
		params.socket.end();
		self.emit('fail', {
			id: params.id,
			message: err
		});
	});

	params.socket.on('notify', function (data) {
		self.emit('notify', {
			type: 'message',
			deckId: params.id,
			message: data
		});
	});

	params.socket.once('close', function (had_error) {
		delete params.socket;

		self.emit('close', params);

		if (params.disabled) {
			return;
		}

		if ('object' !== typeof self.pool[params.id]) {
			self.emit('remove', params);
			return;
		}

		setTimeout(function () {
			self.connect(params);
		}, self.reconnectDelay);
	});
}

HyperDeckPool.prototype.disconnect = function (params) {
	params.socket.end();
	params.socket.removeAllListeners();
	delete params.socket;
}

HyperDeckPool.prototype.add = function (params) {

	if ('string' !== typeof params.id) {
		console.error('%j bad id', params);
		return;
	}

	if ('object' === typeof this.pool[params.id]) {
		console.error('%j exists', params);
		return;
	}

	this.pool[params.id] = {
		id: params.id,
		name: params.name,
		host: params.host,
		port: (params.port || 9993),
		disabled: (params.disabled || false),
		order: (params.order || 0)
	};

	this.emit('add', this.pool[params.id]);

	if (this.pool[params.id].disabled) {
		return;
	}

	this.connect(this.pool[params.id]);
}

HyperDeckPool.prototype.remove = function (params) {

	if (!this.pool[params.id]) {
		console.error('%j not exists', params);
		return;
	}

	if (this.pool[params.id].socket) {
		this.disconnect(this.pool[params.id]);
	}

	delete this.pool[params.id];

	this.emit('remove', {
		id: params.id
	});
}

HyperDeckPool.prototype.update = function (params) {
	var deck = this.pool[params.id];
	var count = 0;

	if (!deck) {
		console.error('%j not exists', params);
		return;
	}

	deckSchema.forEach(function (k) {
		if ('undefined' !== typeof params[k]) {
			deck[k] = params[k];
			count ++;
		}
	});

	if (0 === count ) {
		return;
	}

	this.emit('update', _(deck).omit('socket'));

	if (!deck.socket && !deck.disabled) {
		this.connect(deck);
		return;
	}

	if (deck.socket && deck.disabled) {
		this.disconnect(deck);
		return;
	}

	if (deck.socket && deck.host !== deck.socket.remoteAddress) {
		this.disconnect(deck);
		return;
	}

	if (deck.socket && deck.port !== deck.socket.remotePort) {
		this.disconnect(deck);
		return;
	}

}

HyperDeckPool.prototype.command = function (cmd, cb) {
	_(this.pool).each(function (deck) {
		if (deck.socket) {
			deck.socket.command(cmd, function (reply) {
				cb({
					type: 'reply',
					deckId: deck.id,
					message: reply
				});
			});
		}
	});
}

module.exports = HyperDeckPool;

