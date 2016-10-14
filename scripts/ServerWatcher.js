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
/**
 * simulate binding with apps script
 * various changes server side can be watched for server side
 * and resolved client side
 * @constructor SeverBinder
 */
var ServerWatcher = (function (ns) {
  
  
  /**
   * polled every now and again to report back on changes
   * @param {object} watch instructions on what to check
   * @retun {object} updated status
   */
  ns.poll = function (watch) {
    
    // get the active stuff
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getActiveSheet();
    var aRange = ss.getActiveRange();

    // first select the sheet .. given or active
    var s = watch.domain.sheet ? ss.getSheetByName(watch.domain.sheet) : sh;
    
    // if the scope is "sheet", then it will always be the datarange used
    if (watch.domain.scope === "Sheet") {
      var r = s.getDataRange();
    }
    
    // the scope is range - if there's a given range use it - otherwise use the datarange on the selected sheet
    else if (watch.domain.scope === "Range") {
      var r = (watch.domain.range ? sh.getRange(watch.domain.range) : sh).getDataRange();
    }
    
    // regardless of any other settings always use the active range
    else if (watch.domain.scope === "Active") {
      var r = aRange;
    }
    
    // otherwise its a mess up
    else {
      throw 'scope ' + watch.domain.scope + ' is not valid scope - should be Sheet, Range or Active';
    }
    
    // start building the result
    var pack = {
      checksum:watch.checksum,
      changed:{},
      dataSource:{
        id:ss.getId(),
        sheet:sh.getName(),
        range:r.getA1Notation(),
        dataRange:sh.getDataRange().getA1Notation()
      }
    };

    // get data if requested
    if (watch.rules.data) {

      // see if filters are being respected
      if (watch.domain.applyFilters && watch.domain.property === "Values") {

          var v = new SheetsMore()
          .setAccessToken(ScriptApp.getOAuthToken())
          .setId(SpreadsheetApp.getActiveSpreadsheet().getId())
          .enableFilterViews(false)
          .applyFiltersToData()
          .getValues(r);
        
          // but we just want the filteredvalues
          var values = v.filteredValues;
        
      }
      else {
        var values = r['get'+watch.domain.property]();
      }
      var cs = Utils.keyDigest(values);
      pack.changed.data = cs !== pack.checksum.data;
      if (pack.changed.data) {
        pack.data = values;
        pack.checksum.data = cs;
      }
    }
    
    // provide sheets if requested
    if (watch.rules.sheets) {
      var sheets = ss.getSheets().map(function(d) { return d.getName(); });
      var cs = Utils.keyDigest(sheets);
      pack.changed.sheets = cs !== pack.checksum.sheets;
      if (pack.changed.sheets) {
        pack.sheets = sheets;
        pack.checksum.sheets = cs;
      }
    }
    
    // provide active if requested
    if (watch.rules.active) {
      var a = {
        id:ss.getId(),
        sheet:sh.getName(),
        range:aRange.getA1Notation(),
        dataRange:sh.getDataRange().getA1Notation(),
        dimensions: {
          numRows : aRange.getNumRows(),
          numColumns : aRange.getNumColumns(),
          rowOffset : aRange.getRowIndex(),
          colOffset : aRange.getColumn()
        }
      }
      var cs = Utils.keyDigest (a);
      pack.changed.active = cs !== pack.checksum.active;
      if (pack.changed.active) {
        pack.active = a;
        pack.checksum.active = cs;
      }
      
    }
    return pack;

  };
  return ns;
})(ServerWatcher || {});
