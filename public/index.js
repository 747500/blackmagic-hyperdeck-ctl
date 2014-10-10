
"use strict";

$(function () {

	console.log('blah');

	$('#ThemeSelect a').click(function (event) {
		var $el = $(event.currentTarget);
		var $parent = $el.parent();
		var themeName = $el.text().toLowerCase();

		$parent.siblings().removeClass('active');
		$parent.addClass('active');

		var $navbar = $('div.navbar');

		switch(themeName) {
		case 'inverse':
			$navbar.removeClass('navbar-default').addClass('navbar-inverse');
			break;
		default:
			$navbar.addClass('navbar-default').removeClass('navbar-inverse');
			break;
		}

		return false;
	});

// --------------------------------------------------------------------------

	var deckById = {};

	var Recorder = function(options) {
		this.name = options.name;
		this.host = options.host;
		this.port = options.port;
		this.disabled = options.disabled;
		this.socket = function () {
			return this.host + ':' + this.port;
		};
	};

	var Message = function (options) {
		this.data = options;
		this.message = function () {
			return JSON.stringify(this.data, null, 2);
		};
		this.timestamp = function () {
			return this.data.message.timestamp;
		};
		this.code = function () {
			return this.data.message.code;
		};
		this.text = function () {
			return this.data.message.text.replace(/(\n)/g, '<br/>');
		};
		this.deckName = function () {
			return deckById[this.data.deckId].name;		
		};
	};

	var viewModel = {
		recorders: ko.observableArray(),
		messages: ko.observableArray()
	};

	ko.applyBindings(viewModel);

// --------------------------------------------------------------------------

	var $cmdForm = $('form.deck-command');
	
	$cmdForm.submit(function (event) {
		var cmd = $('input', $cmdForm).val();
		console.log(cmd);
		socket.emit('deck:command', cmd);
		return false;
	});

	var $ctlForm = $('form.deck-control button');

	$ctlForm.click(function (event) {
		var cmd = $(this).text().toLowerCase().replace(/\s+/g, '');
		console.log(cmd);
		socket.emit('deck:command', cmd);
		return false;
	});

// --------------------------------------------------------------------------

	var socket = io.connect();

	socket.on('disconnect', function () {
		console.log(
			viewModel.messages()
		);
	});

	socket.on('deck:create', function (deck) {
		console.log('deck: ', deck);
		deckById[deck.id] = deck;
		viewModel.recorders.push(new Recorder(deck));
	});

	socket.on('deck:connect', function (deck) {
		console.log('connected: ', deck);
	});

	socket.on('deck:disconnect', function (deck) {
		console.log('disconnected: ', deck);
	});

	socket.on('deck:message', function (data) {
		if ('message' === data.type) {
			viewModel.messages.unshift(new Message(data));
			while (viewModel.messages().length > 10) {
				viewModel.messages.pop();
			}
		}
	//	console.log('message: ', message);
	});

});

