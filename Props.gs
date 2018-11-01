/**
 * handles storing.retrieving app properties
 * @namespace Props
 */
var Props = (function (ns) {
  
  'use strict';
  ns.getAll = function () {
    
    // has he unlocked this option?
    var level = ns.get (PropertiesService.getUserProperties(), Process.globals.purchaseLevel) ;
    
    // return all the things allowed
    return {
      saved:[
        { source:'useUser' , settings: ns.getUser() },
        { source:'useDocument' , settings: ns.getDocument() }
      ],
      auth: {
        done:ns.isAuthDone(),
        level:level,
        ok:(level && level.value >= Process.globals.fullAccess ) || Process.globals.openAccess
      }};
  };
  
  ns.removeDocument = function () {
    PropertiesService.getDocumentProperties().deleteProperty(Process.globals.resetProperty);
  };
  
  ns.removeUser = function () {
    PropertiesService.getUserProperties().deleteProperty(Process.globals.resetProperty);
  };
  
  ns.removeAll = function () {
    ns.removeDocument();
    ns.removeUser();
  };
  
  ns.isAuthDone = function () {
    return ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL)
    .getAuthorizationStatus() === ScriptApp.AuthorizationStatus.NOT_REQUIRED;
  }
  
  ns.get = function (props,optKey ) {
    var item = ns.isAuthDone() ? props.getProperty(optKey || Process.globals.resetProperty) : null;
    return item ? JSON.parse(item) : item;
  };
  
  ns.set = function (props , ob) {
    return ns.isAuthDone() ? props.setProperty(Process.globals.resetProperty,JSON.stringify(ob)) : null;
  };
  
  ns.setDocument = function (ob) {
    return ns.isAuthDone() ? ns.set (PropertiesService.getDocumentProperties(), ob) : null;
  };
  
  ns.setUser = function (ob) {
    return ns.isAuthDone() ? ns.set (PropertiesService.getUserProperties(), ob) : null;
  };
  
  ns.getDocument = function () {
    return ns.isAuthDone() ? ns.get (PropertiesService.getDocumentProperties()) : null;
  };
  
  ns.getUser = function () {
    return ns.isAuthDone() ? ns.get (PropertiesService.getUserProperties()) : null;
  };
  
  return ns;
})(Props || {});