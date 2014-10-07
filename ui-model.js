
"use strict";

process.on('disconnect', function () {
	process.exit(0);
});

var stateTable = {};

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
	process.send({
		type: 'HyperDeck:add',
		data: item
	});
});

console.log('ui started');

process.on('message', function (message) {

	var deck = message.data;

	if ('HyperDeck:add' === message.type) {
		stateTable[deck.id]	= deck;
		deck.connected = false;
		return;
	}

	if ('HyperDeck:notify' === message.type) {
		console.log('-');
		return;
	}

	deck = stateTable[deck.id];

	if ('object' !== typeof deck) {
		console.error('Unexpected deck for message:\n%s\n',
				JSON.stringify(message, null, 2));
		return;
	}

	if ('HyperDeck:open' === message.type) {
		deck.connected = true;
		return;
	}

	if ('HyperDeck:close' === message.type) {
		deck.connected = false;
		return;
	}

	if ('HyperDeck:remove' === message.type) {
		delete stateTable[deck.id];
		return;
	}

	console.log('UI: Unexpected message: %s\n', JSON.stringify(message, null, 2));

});

process.on('exit', function () {
	console.log(stateTable);
});

process.on('SIGINT', function () {
//	console.log(stateTable);
	process.exit(0);
});

