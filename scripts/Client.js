/**
* client stuff that's specific to the type server
*/
var Client = (function(client) {

  client.getData = function () {

    google.script.run
    .withFailureHandler(function(error) {
      App.showNotification ("data retrieval error", error);
      
    })
    .withSuccessHandler(function(result){
     
      if(result.data) {
        Process.syncResult (result);
      }
      Process.startPolling();
    })
    .getData(Process.control.result.checksum, Utils.el("input-data-type-selection").checked);
  };
  
  client.startPicker = function () {
  
    google.script.run
      .withFailureHandler(function(error) {
        App.showNotification ("Failed to save", error);
      })
      .withSuccessHandler(function (result) {
      })
      .startPicker(Process.control.code.svg.value,Process.control.code.picker.value);
  };
  
  client.insertImage = function (png) {
  
    spinCursor();
    
    google.script.run
      .withFailureHandler(function(error) {
        resetCursor();
        App.showNotification ("Failed to insert image", error);
      })
      .withSuccessHandler(function (result) {
        resetCursor();
      })
      .insertImage(png);
  };
  
  function resetCursor() {
    Utils.el ('spinner').style.display = "none";
  }
  function spinCursor() {
    Utils.el ('spinner').style.display = "block";
  }

  
  return client;
  
})(Client || {});

