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
      .startPicker(Process.control.code.svg.value);
  }
  
  return client;
  
})(Client || {});

