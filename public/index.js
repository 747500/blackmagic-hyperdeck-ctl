"use strict";

var App = {};

$(function () {

	var socket = io.connect();

	socket.on('recorder', function (data) {
		console.log(data);
		socket.emit('my other event', { my: 'data' });
	});

	App.main = {
		recorders: function () {}, //Коллекция списков

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

			$(document).on("submit", ".new-recorder form", function (e) {
				e.preventDefault();
				var $this = $(this);
				var recorderId = $this.find('.recorder__id').val();
				var model = self.recorders.find({ id: recorderId });

				if (!model) {
					model = self.recorders.add({
						id: null,
						name: $this.find('.recorder__name').val(),
						address: $this.find('.recorder__address').val(),
						port: (parseInt($this.find('.recorder__port').val(), 10) || 9993).toString()
					});
				}
				else {
					model.set({
						name: $this.find('.recorder__name').val(),
						address: $this.find('.recorder__address').val(),
						port: (parseInt($this.find('.recorder__port').val(), 10) || 9993).toString()
					});
				}

				model.save();

				$this.find('.recorder__id').val(null);
				$this.find('.recorder__name').val('');
				$this.find('.recorder__address').val('');
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
		setAddress: function (address) {
			console.log('App.Recorder.setAddress');
			this.set("address", address);
		},
		remove: function () {
			console.log('App.Recorder.remove');
			this.destroy()
		}
	});

	App.RecorderCollection = Backbone.Collection.extend({
		model: App.Recorder,
		url: "/recorders",
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
					console.log(k);
					if ('id' === k) {
						self.$el.data('recorder-id', model.changed[k]);
					}
					else {
						self.$el.find('.recorder__' + k).text(model.changed[k]);
					}
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
				$editForm.find('.recorder__address').val(self.$el.find(".recorder__address").text());
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

	App.main.init();

});

