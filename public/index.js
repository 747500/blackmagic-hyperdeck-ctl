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

			$(document).on("click", ".new-recorder__button", function (e) {
				e.preventDefault();
				var $this = $(this);

				self.recorders.add({
					id: null,
					name: "New Recorder",
					address: "1.2.3.4:9993"
				});
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
			console.log('App.RecorderView.initialize');
			this.recorderChangeName();
			this.recorderChangeAddress();
		},
		recorderChangeName: function () {
			console.log('App.RecorderView.recorderChangeName');
			this.model.on("change:name", function (model, name) {
				console.log('App.RecorderView.recorderChangeName on change:name');
				this.$el.find(".recorder__name").text(name);
			}, this);
		},
		recorderChangeAddress: function () {
			console.log('App.RecorderView.recorderChangeAddress');
			this.model.on("change:address", function (model, address) {
				console.log('App.RecorderView.recorderChangeAddress on change:address');
				this.$el.find(".recorder__address").text(address);
			}, this);
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
			this.$el.find(".recorder__action_save").on("click", function (e) {
				e.preventDefault();
				self.model.setName(self.$el.find(".recorder__name").val());
				self.model.setAddress(self.$el.find(".recorder__address").val());
				self.model.save();
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

