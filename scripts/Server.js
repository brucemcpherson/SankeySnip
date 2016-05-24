/**
* used to expose memebers of a namespace
* @param {string} namespace name
* @param {method} method name
*/
function exposeRun (namespace, method , argArray ) {
  var func = (namespace ? this[namespace][method] : this[method])
  if (argArray && argArray.length) {
    return func.apply(this,argArray);
  }
  else {
    return func();
  }
}



// namespace set up
var Server =  (function(server) {
  /**
  * get the data from the active sheet
  * @param {string} previousChecksum if its the same then no point in returning any data
  * @param {boolean} useSelection where to use acrive selection - default is use the whole page
  * @return {[[]]} sheet data
  */
  server.getData = function (previousChecksum,useSelection) {
    var sheet = SpreadsheetApp.getActiveSheet();
    var range = useSelection ? SpreadsheetApp.getActiveRange() : sheet.getDataRange();
    var data = range.getValues();
    var p = {id:sheet.getSheetId(), range:range.getA1Notation() , data:range.getValues() };
    var thisChecksum = Utils.keyDigest (p);
    
    return {
      checksum :thisChecksum,
      data: (Utils.isUndefined(previousChecksum) || previousChecksum !== thisChecksum) ? data : null
    };

    // not used - it's just to provoke getting the driveapp scope
    function dummy () {
      Drive.Files.list();
    }
  };
  
  return server;
})(Server || {});
