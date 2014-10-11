
"use strict";

ko.bindingHandlers.switch = {
	init: function (element, valueAccessor) {
		$(element).bootstrapSwitch({
			size: 'mini',
			onColor: 'success',
			offColor: 'warning'
		});
	}
};

var App = {
	deckSchema: [
		'id', 'name', 'host', 'port', 'disabled'
	]
};

$(function () {

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
		this.id = options.id;
		this.name = ko.observable(options.name);
		this.host = ko.observable(options.host);
		this.port = ko.observable(options.port);
		this.disabled = ko.observable(options.disabled || false);
		this.connected = ko.observable(options.connected || false);

		this.socket = function () {
			return this.host() + ':' + this.port();
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

	// ----------------------------------------------------------------------

	$('.able-view-switch button').click(function (event) {
		var viewType = $(event.target).data('able-view');
		var $view = $('.able-view-content');

		switch (viewType) {
			case 'list':
				$view.removeClass('able-view-grid').addClass('able-view-list');
				break;
			case 'grid':
				$view.removeClass('able-view-list').addClass('able-view-grid');
				break;
		}
	});

	// ----------------------------------------------------------------------


	App.deckDisable = function (model, event) {
		socket.emit('deck:update', {
			id: model.id,
			disabled: !event.currentTarget.checked
		});
		return true;
	};

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

	$('.deck-cmd-remote').change(function (event) {
		console.log(event.currentTarget.checked);
		if (event.currentTarget.checked) {
			socket.emit('deck:command', 'remote: enable: true');
		}
		else {
			socket.emit('deck:command', 'remote: enable: false');
		}
	});
// --------------------------------------------------------------------------

	var socket = io.connect();

	socket.on('disconnect', function () {
		viewModel.recorders([]);
		viewModel.messages([]);
	});

	socket.on('deck:create', function (deck) {
		deckById[deck.id] = new Recorder(deck);
		viewModel.recorders.push(deckById[deck.id]);
	});

	socket.on('deck:update', function (data) {
		var deck = deckById[data.id];

		_(data).keys().forEach(function (k) {
			if ('function' !== typeof deck[k]) {
				return; // is not observable
			}
			if (data[k] === deck[k]()) {
				return; // is not changed
			}
			deck[k](data[k]);
		});
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
