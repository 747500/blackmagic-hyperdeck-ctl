
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
		'id', 'name', 'host', 'port', 'disabled', 'order'
	]
};

$(function () {
	var socket = io.connect();

	var $sortable = $('.sortable');
	$sortable.sortable({
		disabled: true,
		tolerance: 'intersect'
	});

	$('#reorder-toggle').click(function (event) {
		$(this).toggleClass('active btn-success btn-default');

		if ($(this).hasClass('active')) {
			$sortable.disableSelection();
			$sortable.sortable('enable');
			return;
		}

		$sortable.sortable('disable');
		$sortable.enableSelection();
		$sortable.children().each(function (i, el) {
			if (App.deckById[el.id].order() === i) {
				return;
			}

			App.deckById[el.id].order(i);
			socket.emit('deck:update', {
				id: el.id,
				order: i
			});
		});

	});

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
		//console.log(options);

		this.order = ko.observable(parseInt(options.order || 0));

		this.connected = new Connected(options.connected);

		this.id = options.id;
		this.name = ko.observable(options.name);
		this.host = ko.observable(options.host);
		this.port = ko.observable(options.port);
		this.disabled = ko.observable(options.disabled || false);
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

	var $cmdForm = $('form#deck-ctl-command');

	$cmdForm.submit(function (event) {
		var cmd = $('input', $cmdForm).val();
		console.log(cmd);
		socket.emit('deck:command', cmd);
		return false;
	});


	App.deckCtl = {
		record: function () {
			socket.emit('deck:command', 'record');
		},
		stop: function () {
			socket.emit('deck:command', 'stop');
		},
		command: function () {
			console.log(this, arguments);
		},
		remote: function (data, event) {
			socket.emit('deck:command', 'remote: enable: ' +
					event.currentTarget.checked.toString());

			$(event.currentTarget.parentElement)
					.toggleClass('btn-success btn-default');
		}
	};

// --------------------------------------------------------------------------

	ko.applyBindings(App.viewModel);

// --------------------------------------------------------------------------

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
