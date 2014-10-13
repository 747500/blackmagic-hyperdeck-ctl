
$(function () {


	$('section#main ul.navbar-nav a').click(function (event) {
		$('ul.navbar-nav li').removeClass('active');
		$(this).parent().addClass('active');
	});

	App.router = new Router({
		'/': function () {

		},
		'/settings': function () {

		},
		'/about': function() {


		}
	});
	App.router.configure({
		on: function () {
			var route = window.location.hash.split('/');
			var $section = $('section#' + (route[1] || 'main'));
			$('section').removeClass('active');
			$section.addClass('active');
			document.title = $section.attr('title') + ' - ' + $('.navbar-brand').text();

			var $navbarItem = $('ul.navbar-nav a[href="/#/' + route[1] +'"]');
			$('ul.navbar-nav li').removeClass('active');
			$navbarItem.parent().addClass('active');
		}
	});
	App.router.init();

});
