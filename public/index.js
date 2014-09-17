"use strict";

var App = {};

$(function () {

	App.main = {
		projects: function () {}, //Коллекция списков

		init: function () {
			console.log('App.main.init');

			this.projects = new App.ProjectCollection();

			this.initEvents();
			this.initRoutes();
		},

		//инициализируем DOM события jquery
		initEvents: function () {
			console.log('App.main.initEvents');
			var self = this;

			$(document).on("click", ".new-project__button", function (e) {
				e.preventDefault();
				var $this = $(this);

				var new_project_name = "New Project";

				self.projects.add({
					id: null,
					name: new_project_name
				});
			});
		},

		initRoutes: function () {
			console.log('App.main.initRoutes');
			App.Router = Backbone.Router.extend({
				routes: {
					'': 'index',
					'project/:id': 'getProject',
					'project/:id/edit': 'editProject',
					'*default': 'default'
				},
				index: function () {
					console.log('index route');
				},
				getProject: function (id) {
					console.log('get project with id: %s', id);
				},
				editProject: function (id) {
					console.log('edit project with id: %s', id);
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

	App.Project = Backbone.Model.extend({
		setName: function (name) {
			console.log('App.Project.setName');
			this.set("name", name);
		},
		remove: function () {
			console.log('App.Project.remove');
			this.destroy()
		}
	});

	App.ProjectCollection = Backbone.Collection.extend({
		model: App.Project,
		url: "/projects",
		initialize: function () {
			console.log('App.ProjectCollection.initialize');
			this.initEvents();
			this.fetch();
		},
		initEvents: function () {
			console.log('App.ProjectCollection.initEvents');
			this.on("add", this.listenAdd);
		},
		listenAdd: function (model) {
			console.log('App.ProjectCollection.listenAdd');
			var view = new App.ProjectView({
				model: model
			});
			view.render();
			$(".projects").append(view.$el);
		}
	});

	var projectTemplate = false;
	App.ProjectView = Backbone.View.extend({
		events: {
			"click .project__action_remove": "removeAction"
		},
		initialize: function () {
			console.log('App.ProjectView.initialize');
			this.projectChangeName();
		},
		projectChangeName: function () {
			console.log('App.ProjectView.projectChangeName');
			this.model.on("change:name", function (model, name) {
				console.log('App.ProjectView.projectChangeName on change:name');
				this.$el.find(".project__name").text(name);
			}, this);
		},
		render: function () {
			console.log('App.ProjectView.render');
			if(!projectTemplate) {
				projectTemplate = _.template($("#template__project").text());
			}
			var data = this.model.toJSON();
			var markup = projectTemplate(data);
			this.setElement($(markup).get(0));
			this.initControls();
		},
		initControls: function () {
			console.log('App.ProjectView.initControls');
			var self = this;
			this.$el.find(".project__action_save").on("click", function (e) {
				e.preventDefault();
				self.model.setName(self.$el.find(".project__name").val());
				self.model.save();
			});
		},
		removeAction: function (e) {
			console.log('App.ProjectView.removeAction');
			this.$el.remove();
			this.model.remove();
		}
	});

	// ----------------------------------------------------------------------

	App.main.init();

});

