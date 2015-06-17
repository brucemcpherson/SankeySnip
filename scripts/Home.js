
var Home = (function (home) {
	'use strict';
  
  // The initialize function must be run to activate elements
  home.initialize = function (reason) {
    
    
    // show settings for modification
    Utils.el('settings-button').addEventListener ( 'click', function () {      
	  Utils.hide(Utils.el("container"));
	  Utils.show(Utils.el("settings"));
      home.settings = Utils.clone(Sankey.settings);
      View.makeOptions(home.settings);
    },false);
    
    // give up on setting changes
    Utils.el('cancel-settings-button').addEventListener ('click' , function () {
      Utils.hide (Utils.el("settings"));
      Utils.show (Utils.el("container"));
    },false);
    
    // save setting changes
    Utils.el('close-settings-button').addEventListener ('click' , function () {
      Utils.hide (Utils.el("settings"));
      Utils.show (Utils.el("container"));
      Sankey.settings = home.settings;
      Process.drawChart();
    },false);
    
    // insert in sheet
    Utils.el('insert-button').addEventListener('click', function () {    
        // convert to png and ask the server to do it
        try {
          Client.insertImage ( CanvasConvert.svgToPng (Process.control.code.picker.value));
        }
        catch (err) {
          App.showNotification ('Converting image to PNG format', err);
        }
    });
      
    // drop downs for field names
    Object.keys(Process.control.activeHeadings).forEach (function (k) {
      Process.control.activeHeadings[k].elem.addEventListener ('change' , function () {
        Process.selectFields();
        Process.drawChart(true);
      });
    },false);
  
    // type of input data radio buttons
    ['input-data-type-whole','input-data-type-selection'].forEach (function (d) {
      Utils.el(d).addEventListener ('click' , function () {
        Process.selectFields();
        Process.drawChart(true);
      });
    },false);
    
    // bring up the picker
    Utils.el('save-button').addEventListener ( 'click' , function (e) {
      Client.startPicker();
    },false);
  };


  return home;
})(Home || {});
