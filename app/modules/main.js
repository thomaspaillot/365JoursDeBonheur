(function(Main) {
	
	var flickr_url = "http://api.flickr.com/services/rest/?jsoncallback=?";
	
	Main.Models.CustomDate = Backbone.Model.extend({
		defaults: {
			min_date: new Date(),
			max_date: new Date()
		},
		initialize: function() {
			var min = this.get("min_date");
			var max = this.get("max_date");
			min.addDays(-1);
			min.setHours(0);
			max.addDays(-1);
			max.setHours(23);
			this.set({ max_date: max, min_date: min });
		},
		incrementDate: function() {
			var min = this.get("min_date");
			var max = this.get("max_date");
			min.addDays(1);
			max.addDays(1);
			
			this.set({ max_date: max, min_date: min });
			this.trigger("change:date");
		},
		decrementDate: function() {
			var min = this.get("min_date");
			var max = this.get("max_date");
			min.addDays(-1);
			max.addDays(-1);
			
			this.set({ max_date: max, min_date: min });
			this.trigger("change:date");
		}
	});
	
	Main.Models.Photo = Backbone.Model.extend({
		defaults: {
			path: "",
			original: "",
			author: "© Flickr",
			day: 0
		},
		initialize: function(date) {
			this.get("date").bind("change:date", this.findPhoto, this);			
			this.findPhoto();
		},
		
		findPhoto: function() {
			var model = this;
			var count = model.get("date").get("min_date").getDayOfYear() + 1;

			$.getJSON(flickr_url,
				{
					method: 		"flickr.photos.search",
					tags: 			"bonheur, happiness",
					api_key: 		"20dcf927582a1508f00c4c42841b4c57",
					sort: 			"interestingness-desc",
					min_taken_date:	model.get("date").get("min_date").toString("yyyy-MM-dd hh:mm:ss"),
					max_taken_date:	model.get("date").get("max_date").toString("yyyy-MM-dd hh:mm:ss"),  
					format: 		"json"
				},
				function(data) {
					
					if(data.photos.total == 0) {
						console.log("Pas de bonheur aujourd'hui");
						return
					};

					var url = "http://farm"+ data.photos.photo[0].farm + ".staticflickr.com/"+ data.photos.photo[0].server +"/"+ data.photos.photo[0].id +"_"+ data.photos.photo[0].secret +"_b.jpg";
					var original_url = "http://www.flickr.com/photos/"+ data.photos.photo[0].owner +"/"+ data.photos.photo[0].id;
					
					$.getJSON(flickr_url,
					{
						method: 	"flickr.people.getInfo",
						user_id:	data.photos.photo[0].owner,
						api_key: 	"20dcf927582a1508f00c4c42841b4c57",
						format: 	"json"
					},
					function(data) {
						var author_name = data.person.username._content;
						model.set({ day: count, path: url, original: original_url, author: author_name });
				});
			});
		}
	});
	
	Main.Views.Photo = Backbone.View.extend({
		el: $("#main"),
		template: "app/templates/photo.html",
		
		initialize: function(model, date) {
			this.model.bind("change", _.bind(this.render, this));
		},
		
		render: function() {
			var view = this;

			$.get('app/templates/photo.html', function(template) {
				var variables = { 
					src_url: view.model.get("path"), 
					author_name: view.model.get("author"),
					link_url: view.model.get("original"),
					day_number: view.model.get("day")
				};
				var t = _.template(template, variables);
				view.el.html(t);
				
				if(view.model.get("day") == Date.today().getDayOfYear()) {
					$("#next").hide();
				}
				
				if(view.model.get("day") == 1) {
					$("#prev").hide();
				}
				
				return this;
			});
		},
		
		events: {
			"click #prev": "previousPhoto",
			"click #next": "nextPhoto"
		},
		
		previousPhoto: function() {
			this.options.date.decrementDate();
		},
		
		nextPhoto: function() {
			this.options.date.incrementDate();
		}
	});
	
})(bonheurApp.module("main"));