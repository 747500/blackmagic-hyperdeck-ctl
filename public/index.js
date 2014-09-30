
"use strict";

var App = {};

$(function () {

	var socket = io.connect();

	var bbsync = Backbone.sync;

	Backbone.sync = function(method, model, options) {
		var evName, evData;

		if ('read' === method) {
			evName = method + ':' + model.url;
			evData = {};
		}
		else {
			evName = method + ':' + model.collection.url;
			evData = model.attributes;
		}

		socket.emit(evName, evData, options.success);

	//	console.log(method);
	//	console.log(model);
	//	console.log(options);
	};

	App.main = {
		recorders: function () {},

		init: function () {
			console.log('App.main.init');

			this.recorders = new App.RecorderCollection();

			this.initEvents();
			this.initRoutes();
		},

		//инициализируем DOM события jquery
		initEvents: function () {
			console.log('App.main.initEvents');
			var self = this;

			$(document).on("submit", ".commander form", function (e) {
				e.preventDefault();
				var command = $(this).find('.command').val();
				socket.emit('command:recorders', command);
			});

			$(document).on("submit", ".new-recorder form", function (e) {
				e.preventDefault();
				var $this = $(this);
				var recorderId = $this.find('.recorder__id').val();
				var model = self.recorders.find({ id: recorderId });

				if (!model) {
					model = self.recorders.add({
						id: null,
						name: $this.find('.recorder__name').val(),
						host: $this.find('.recorder__host').val(),
						port: (parseInt($this.find('.recorder__port').val(), 10) || 9993).toString()
					});
				}
				else {
					model.set({
						name: $this.find('.recorder__name').val(),
						host: $this.find('.recorder__host').val(),
						port: (parseInt($this.find('.recorder__port').val(), 10) || 9993).toString()
					});
				}

				model.save();

				$this.find('.recorder__id').val(null);
				$this.find('.recorder__name').val('');
				$this.find('.recorder__host').val('');
				$this.find('.recorder__port').val('');

//				$this.hide();
			});
		},

		initRoutes: function () {
			console.log('App.main.initRoutes');
			App.Router = Backbone.Router.extend({
				routes: {
					'': 'index',
					'recorder/:id': 'getRecorder',
					'recorder/:id/edit': 'editRecorder',
					'*default': 'default'
				},
				index: function () {
					console.log('index route');
				},
				getRecorder: function (id) {
					console.log('get recorder with id: %s', id);
				},
				editRecorder: function (id) {
					console.log('edit recorder with id: %s', id);
				},
				default: function (route) {
					console.log('undefined route (404): %s', route);
				}
			});
			new App.Router();
			Backbone.history.start();
		}
	}

	// ----------------------------------------------------------------------

	App.Recorder = Backbone.Model.extend({
		setName: function (name) {
			console.log('App.Recorder.setName');
			this.set("name", name);
		},
		setHost: function (host) {
			console.log('App.Recorder.setost');
			this.set("host", host);
		},
		remove: function () {
			console.log('App.Recorder.remove');
			this.destroy()
		},
		addMessage: function (data) {
			var text = data.createdAt.toString() +
					' ' + (data.error || data.message || '');
			this.set('message', text);
		}
	});

	App.RecorderCollection = Backbone.Collection.extend({
		model: App.Recorder,
		url: "recorders",
		initialize: function () {
			console.log('App.RecorderCollection.initialize');
			this.initEvents();
			this.fetch();
		},
		initEvents: function () {
			console.log('App.RecorderCollection.initEvents');
			this.on("add", this.listenAdd);
		},
		listenAdd: function (model) {
			console.log('App.RecorderCollection.listenAdd');
			var view = new App.RecorderView({
				model: model
			});
			view.render();
			$(".recorders").append(view.$el);
		}
	});

	var recorderTemplate = false;
	App.RecorderView = Backbone.View.extend({
		events: {
			"click .recorder__action_remove": "removeAction"
		},
		initialize: function () {
			var self = this;
			console.log('App.RecorderView.initialize');
			
			this.model.on('change', function (model, options) {
				_(model.changed).keys().forEach(function (k) {

					if ('id' === k) {
						self.$el.data('recorder-id', model.changed[k]);
						return;
					}

					if ('message' === k) {
						self.$el.find('.messages tbody').append(
							'<tr><td>' + model.changed[k] + '</td><tr>'
						);
						return;
					}

					self.$el.find('.recorder__' + k).text(model.changed[k]);
				});
			});
		},
		render: function () {
			console.log('App.RecorderView.render');
			if(!recorderTemplate) {
				recorderTemplate = _.template($("#template__recorder").text());
			}
			var data = this.model.toJSON();
			var markup = recorderTemplate(data);
			this.setElement($(markup).get(0));
			this.initControls();
		},
		initControls: function () {
			console.log('App.RecorderView.initControls');
			var self = this;
			this.$el.find(".recorder__action_edit").on("click", function (e) {
				e.preventDefault();
				var $editForm = $('.new-recorder form');

				$editForm.find('.recorder__id').val(self.$el.data('recorder-id'));
				$editForm.find('.recorder__name').val(self.$el.find(".recorder__name").text());
				$editForm.find('.recorder__host').val(self.$el.find(".recorder__host").text());
				$editForm.find('.recorder__port').val(self.$el.find(".recorder__port").text());
//				$editForm.show();
			});
		},
		removeAction: function (e) {
			console.log('App.RecorderView.removeAction');
			this.$el.remove();
			this.model.remove();
		}
	});

	// ----------------------------------------------------------------------

	socket.on('event:recorders', function (data) {
	//	console.log(data);
		var ddClass = 'message';

		if (data.error) {
			ddClass = 'error';
		}

		var text = data[ddClass];
		var model = App.main.recorders.get(data.recorder.id);

		model.addMessage({
			createdAt: data.createdAt,
			message: text
		});

	});

	App.main.init();

});

