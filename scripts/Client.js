/**
* client stuff that's specific to the type server
*/
var Client = (function(client) {
  
  client.start = function () {

    // this'll call sync when there's any data change
    Process.control.watching.watcher.watch(function (current , pack, watcher) {
      Process.syncResult (current);
      resetCursor();
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



