/* Common app functionality */

var App = (function startApp (app) {
  'use strict';
  
  
  // sets up all the app management divs.
  app.initialize = function () {
    
    app.showNotification = function (header, text, toast) {
      DomUtils.elem('notification-header').innerHTML=header;
      DomUtils.elem('notification-message').innerHTML =text;
      DomUtils.hide('notification-area',true, toast ? "notification-toast-header" : "notification-error-header"); 
      DomUtils.hide('notification-header',true, toast ? "notification-toast-header" : "notification-error-header");  
      DomUtils.hide('notification-message',true, toast ? "notification-toast-message" : "notification-error-message"); 
      DomUtils.hide('notification-area',false);
    };
    
    app.hideNotification = function () {
      DomUtils.hide('notification-area',true);
    };
    
    app.toast = function (header,text) {
      app.showNotification (header,text,true);
      setTimeout (function () {
        app.hideNotification();
      },Process.control.toast.interval);
    }
    
    DomUtils.elem('notification-close').addEventListener("click", function () {
      DomUtils.hide('notification-area',true);
    },false);
    
  };
  
  return app;
})(App || {});

