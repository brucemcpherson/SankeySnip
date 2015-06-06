/* Common app functionality */

var App = (function startApp (app) {
	'use strict';


	// sets up all the app management divs.
	app.initialize = function () {
		var container = Utils.el("container");
		var notification = Utils.elAdd(container,"div","notification");
		notification.id = "notification";
        Utils.elAdd(notification,"div","notification-close").id = "notification-close";
		Utils.elAdd(notification,"div","notification-header").id = "notification-header";
		Utils.elAdd(notification,"div","notification-message").id = "notification-message";
    
		app.showNotification = function (header, text) {
			Utils.el('notification-header').innerHTML=header;
			Utils.el('notification-message').innerHTML =text;
			Utils.show(notification);
		};
        
        app.hideNotification = function () {
          Utils.hide(notification);
        };
        
        Utils.el('notification-close').addEventListener("click", function () {
          Utils.hide(notification);
        },false);

	};

	return app;
})(App || {});

