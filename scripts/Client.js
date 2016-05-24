/**
* client stuff that's specific to the type server
*/
var Client = (function(client) {
  
  client.getData = function (polled) {
    
    if(!polled)spinCursor();
    var pc = Process.control;
    
    Provoke.run ('Server', 'getData', pc.result.checksum, pc.buttons.selectedRange.checked)
    .then (
      function(result) {
        if(result.data) {
          Process.syncResult (result);
        }
        resetCursor();
        Process.startPolling();
      },
      function (error) {
        resetCursor();
        App.showNotification ("data retrieval error", error);
      });
  };
  
  
  client.insertImage = function (png) {
  
    spinCursor();
    disableButtons (true);
    
    Provoke.run ('Image', 'place', png)
    .then (
      function(result) {
        resetCursor();
        disableButtons(false);
      },
      function (error) {
        resetCursor();
        App.showNotification ("Failed to insert image", error);
        disableButtons (false);
      });
    
    
    function disableButtons (state) {
      Process.control.buttons.insert.disabled = state;
    }
  };
  
  function resetCursor() {
    DomUtils.hide ('spinner',true);
  }
  function spinCursor() {
    DomUtils.hide ('spinner',false);
  }

  
  return client;
  
})(Client || {});




