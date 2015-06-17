
/**
* called to return latest active sheet data
* @param {number} checksum the checksum for the last data we got
* @param {boolean} useSelection where to use acrive selection - default is use the whole page
* @return {object} object with new checksum and potentially the data if anything has changed
*/
function getData (checksum,useSelection) {
  return Server.getData (checksum,useSelection);
}

/**
* called to display a dialog and save content
* @param {string} content the content
*/

function startPicker (content,pickerContent) {
  showPicker(content,pickerContent);
}

/**
 * called to insert an image in the sheet
 * @param {string} png b64 encoded image
 */
function insertImage (png) {
  return Image.place(png);
}
// namespace set up

var Server =  (function(server) {

  /**
  * get the data from the active sheet
  * @param {number} previousChecksum if its the same then no point in returning any data
  * @param {boolean} useSelection where to use acrive selection - default is use the whole page
  * @return {[[]]} sheet data
  */
  server.getData = function (previousChecksum,useSelection) {
    var sheet = SpreadsheetApp.getActiveSheet();
    var range = useSelection ? SpreadsheetApp.getActiveRange() : sheet.getDataRange();
    var data = range.getValues();
    var p = {id:sheet.getSheetId(), range:range.getA1Notation() , data:range.getValues() };
    var thisChecksum = Utils.checksum (p);
    
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
