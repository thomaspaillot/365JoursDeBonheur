this.bonheurApp = {
	module: function() {
		var modules = {};

		// Create a new module reference scaffold or load an existing module.
		return function(name) {
			// If this module has already been created, return it.
			if (modules[name]) {
				return modules[name];
			}

			// Create a module and save it under this name
			return modules[name] = { Views: {}, Models: {} };
		};
	}(),

	app: _.extend({}, Backbone.Events)
};


jQuery(function($) {
	var app = bonheurApp.app;

	var Main = bonheurApp.module("main");
	
	var customDate = new Main.Models.CustomDate();
	var photoModel = new Main.Models.Photo({ date: customDate });
	
	var Router = Backbone.Router.extend({
		routes: {
			"": "index"
		},

		index: function() {
			var photo = new Main.Views.Photo({ model: photoModel, date: customDate });
		}
	});

	app.router = new Router();

	// Trigger the initial route and enable HTML5 History API support
	Backbone.history.start({ pushState: true });

	$(document).on("click", "a:not([data-bypass])", function(evt) {
		// Get the anchor href and protcol
		var href = $(this).attr("href");
		var protocol = this.protocol + "//";

		// Ensure the protocol is not part of URL, meaning its relative.
		if (href.slice(0, protocol.length) !== protocol) {
			evt.preventDefault();
			app.router.navigate(href, true);
		}
	});
});
