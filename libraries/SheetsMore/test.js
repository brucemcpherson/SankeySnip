function test () {


  // this creates a new filter processing ob
  var sMore = new SheetsMore()
  .setAccessToken(ScriptApp.getOAuthToken())
  .setId("1CfYSJDTWtpCByMAzCsJ82iZVo_FPxQbo0cFTCiwnfp8")
  .enableFilterViews(true);
  
  // this should be done to fetch and apply the current filter state
  sMore.applyFiltersToData();

  // test out all the sheets in the given book
  var testBook = SpreadsheetApp.openById(sMore.getId());
  testBook.getSheets()
  .forEach(function(d) {
    // tells if the data is filtered for the given range
    Logger.log(d.getName() +':'+sMore.isDataFiltered (d.getDataRange()));
    
    // gets the values + the filtered values -- THIS IS WORK IN PROGRESS and writes the selected data out to another sheet
    var result = sMore.getValues(d.getDataRange());
    
    // use the filtered values (for allValues use result.allValues);
    var values = result.filteredValues;
    
    // write out a copy of the sheet with just the filtered values.
    var resultSheet = testBook.getSheetByName(d.getName()+"Results");
    if (resultSheet) {
      resultSheet.clearContents();
      if (values.length) {
        resultSheet.getRange(1,1,values.length,values[0].length).setValues(values);
      }
    }
    
    // do a partial range test
    var partialSheet = testBook.getSheetByName(d.getName()+"Partial");
    if (partialSheet) {
      var result = sMore.getValues(d.getRange('b2:d4'));
      var values = result.filteredValues;
      partialSheet.clearContents();
      if (values.length) {
        partialSheet.getRange(1,1,values.length,values[0].length).setValues(values);
      }
    }
  });
}