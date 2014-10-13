
"use strict";

ko.bindingHandlers.switch = {
	init: function (element, valueAccessor) {
		$(element).bootstrapSwitch({
			size: 'mini', // mini, small
			onColor: 'success',
			offColor: 'warning'
		});
	}
};

ko.bindingHandlers.tablist = {
	init: function (element, valueAccessor) {
		$('a.tab-link', element).click(function (event) {
			event.preventDefault();
			$(this).tab('show');
		});
	}
};

var App = {
	deckSchema: [
		'id', 'name', 'host', 'port', 'disabled'
	]
};

$(function () {

	var $sortable = $('.sortable');
	$sortable.sortable({
		tolerance: "intersect",
		update: function(event, ui) {
			$('>div', this).each(function (i, el) {
				App.deckById[el.id].order(i);
			});
		}
	});
	$sortable.disableSelection();


	var Connected = function (state) {
		var self;

		var cc = 'label ';
		function bindValue() {
			return cc + (self.state ? 'label-success' : 'label-default');
		};

		self = function (state) {
			if (0 < arguments.length) {
				self.state = state ? true : false;
				self.binding(bindValue());
			}
			return self.state;
		};
		self.state = state ? true : false;
		self.binding = ko.observable(bindValue());
		return self;
	};


	App.deckById = {};
	var deckOnline = {};

	var Recorder = function(options) {
		this.order = ko.observable(0);

		this.connected = new Connected(options.connected);

		this.id = options.id;
		this.name = ko.observable(options.name);
		this.host = ko.observable(options.host);
		this.port = ko.observable(options.port);
		this.disabled = ko.observable(options.disabled || false);
	//	this.connected = ko.observable(options.connected || false);
		this.errors = ko.observableArray();
		this.errorsUnread = ko.observable(false);
		this.showSettings = ko.observable(false);
		this.socket = function () {
			return this.host() + ':' + this.port();
		};
		this.toggleSettings = function () {
			this.showSettings(this.showSettings() ? false : true);
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
			return App.deckById[this.data.deckId].name;
		};
	};

	App.viewModel = {
		recorders: ko.observableArray(),
		messages: ko.observableArray(),
		recordersOnline: ko.observable(0)
	};

	App.viewModel.recordersSorted = ko.computed(function() {
		return App.viewModel.recorders().sort(function (left, right) {
			return left.order() == right.order() ?
			0 : (left.order() < right.order() ? -1 : 1);
		});
	});

	ko.applyBindings(App.viewModel);

	// ----------------------------------------------------------------------

	App.deckDisable = function (deck, event) {
		socket.emit('deck:update', {
			id: deck.id,
			disabled: !event.currentTarget.checked
		});
		return true;
	};

	App.deckErrors = function (deck, event) {
		deck.errorsUnread(false);
		return true;
	};

	App.deckSettings = function (deck, event) {
		deck.toggleSettings();
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
		App.viewModel.messages([]);
	});

	socket.on('deck:update', function (data) {
		var deck = App.deckById[data.id];

		if ('object' !== typeof deck) {
			deck = new Recorder(data);
			App.deckById[deck.id] = deck;
			App.viewModel.recorders.push(deck);

			if (deck.connected) {
				App.viewModel.recordersOnline(
					1 + App.viewModel.recordersOnline()
				);
			}
		}
		else {
			_(data).keys().forEach(function (k) {
				if ('function' !== typeof deck[k]) {
					return; // is not observable
				}
				if (data[k] === deck[k]()) {
					return; // is not changed
				}
				if ('errors' === k && 0 === data[k].length) {
					deck.errorsUnread(false);
				}
				//console.log('>>>', k, data[k]);
				deck[k](data[k]);
			});
		}

		if (deck.connected.state) {
			deckOnline[deck.id] = true;
		}
		else {
			delete deckOnline[deck.id];
		}
		App.viewModel.recordersOnline(_(deckOnline).keys().length);
	});

	socket.on('deck:message', function (data) {
		if ('message' === data.type) {
			App.viewModel.messages.unshift(new Message(data));
			while (App.viewModel.messages().length > 50) {
				App.viewModel.messages.pop();
			}
		}
	//	console.log('message: ', message);
	});

});
