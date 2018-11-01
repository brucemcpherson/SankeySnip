var Server = (function (ns) {
  
  ns.generateTestData = function (data) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.insertSheet();
    sh.getRange(1, 1, data.length, data[0].length).setValues(data);
    ss.setActiveSheet(sh);
    return data;
  };

  return ns;
})(Server || {});