var Server = (function (ns) {
  
  ns.generateTestData = function () {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.insertSheet();
    var data = getTestData ();
    sh.getRange(1, 1, data.length, data[0].length).setValues(data);
    ss.setActiveSheet(sh);
    return data;
  };
  
  function getTestData  () {
  return [["Source","Target","Volume"],["CHP","Electricity",58],["CHP","Losses",60],["Electricity","Domestic",71],["Electricity","Industry",87],["Electricity","Other final",77],["Electricity","Losses",42],["Electricity","Non-energy",13],["Natural gas","CHP",62],["Natural gas","Industry",90],["Natural gas","Losses",22],["Natural gas","Non-energy",13],["Natural gas","Power",53],["Coal","CHP",61],["Coal","Other",64],["Coal","Power",153],["Crude oil","Export",58],["Crude oil","Refineries",573],["Nuclear","Power",228],["Petroleum products","Refineries",324],["Power","Electricity",222],["Power","Losses",285],["Refineries","Domestic",38],["Refineries","Export",370],["Refineries","Industry",30],["Refineries","Non-energy",84],["Refineries","Other final",33],["Refineries","Transport",329],["Renewables","CHP",75],["Renewables","Domestic",41],["Renewables","Other final",5],["Renewables","Power",74],["Renewables","Transport",15],["CHP","Industry",80]]
  
  }
  return ns;
})(Server || {});