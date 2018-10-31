
/*
* extend SpreadsheetApp with some stuff from the 
* the sheets v4 API for this to work
* @constructor SheetsMore
*/
var SheetsMore = function() {
  
  var self  = this, accessToken_, id_, filters_, applyFilterViews_ =true;
  
  /**
  * whether to apply filterviews
  * @param {boolean} applyViews whether to apply
  * @return {SheetsMore} self
  */
  self.enableFilterViews = function (applyViews) {
    applyFilterViews_ = applyViews;
    return self;
  };
  
  // synonym to be deprecataed
  self.setApplyFilterViews = self.enableFilterViews;
  
  /**
  * set filters in place in this sheet
  * @return {SheetsMore} self
  */
  self.applyFiltersToData = function() {
    
    var result = urlExecute_ (id_,  [encodeFields_ (getSheetIdDefs_() , getFilterViewDefs_() , getFilterDefs_())]);
    if (result.success) {
      filters_ = result.data.sheets;
    }
    else {
      throw JSON.stringify(result);
    }
    
    return self;
  };
  
  // deprecate this eventually
  self.applyFilters = self.applyFiltersToData;
  
 /**
  * see if any filters overlap
  * @param {Range} range the range=SpreadsheetApp.getActiveRange()
  * @return {boolean} if filters overlap
  */
  self.isDataFiltered = function (range) {
    return getFiltered_(range).length ? true : false;
  };
  // to be deprecated
  self.isFiltered = self.isDataFiltered;
  
  /**
  * set up the access token
  * you can use script app.gettoken for this
  * @param {string} accessToken the token to use
  * @return {SheetsMore} self
  */
  self.setAccessToken = function (accessToken) {
    accessToken_ = accessToken;
    return self;
  };
  
  /**
  * set the spreadsheet
  * @param {string} id the spreadsheet id
  * @return {SheetsMore) self
  */
  self.setId = function (id) {
    id_ = id;
    return self;
  };
  
  /**
  * get the spreadsheet
  * @return {string} the id 
  */
  self.getId = function () {
    return id_;
  };
  
  /**
  * get the values, but apply the filter if there is one
  * @param {Range} range the range that the values are required for
  * @param {[string]} params any parameters
  * @return {object} the values {values:[[]], filtered:[[]],isFilter:boolean}
  */
  self.getValues = function (range, params) {
    
    /* this is API version - better to use the built in apps script to get the values
    var result = urlExecute_ (id_+'/values/'+range.getSheet().getName() + "!" + range.getA1Notation(),params); 
    var values = result.data.values;
    
    //found somethig different here - the array is jagged in this API, so pad it out to make it look like apps script
    var maxWidth = result.data.values.reduce(function (p,c) {
    return Math.max (c.length, p);
    }, 0);
    
    var values = result.data.values.map (function (d) {
    for (var i = d.length; i < maxWidth ;i++) {
    d.push("");
    }
    return d;
    });
    */
    
    // get values with Apps Script replaces the API version above.
    var values = Utils.expBackoff( function () {
      return range.getValues();
    });
    
    // get any filtering that needs to be done
    var filters = getFiltered_(range);
    
    
    // play around with validation for filter rules .. dont think this approach will be viable
    var play = null;  // probably wont do this... containsConditions_(filters) ?  copyToValidate_ (range) : null;
    
    // filter those values
    var filterMap = filterMap_ (filters, values,range);
    
    // deletet that play sheet
    if (play) {
      Utils.expBackoff (function () {
        return play.getParent().deleteSheet(play);
      });
    }
    
    return {
      allValues:values,
      filteredValues:filters.length ? filterMap.map(function(d) { return values[d]; }) : values,
      filters:filters,
      filterMap:filterMap
    };
    
    // see if there are any conditions int he filters
    function containsConditions_ (filters) {
      return filters.some (function (d) {
        return d.criteria && Object.keys(d.criteria).some(function (e) {
          return d.criteria[e].condition;
        });
      });
    }
  };
  

  
  /**
  * see what filters overlap
  * @param {Range} range the range=SpreadsheetApp.getActiveRange()
  * @return {[object]} array of objects overlapping this range
  */
  function getFiltered_ (range) {
    
    // the given range
    var sci = range.getColumn(),
        sri = range.getRowIndex(),
        eci = range.getNumColumns()+ sci -1,
          eri = range.getNumRows() + sri - 1,
            sheet = range.getSheet(),
              sheetId = sheet.getSheetId();
    
    // for this sheets, find any matching- 
    return (filters_||[]).filter (function (d) {
      return d.properties.sheetId === sheetId; 
    }).reduce(function (p,c) {
      if (c.basicFilter && overlap_ (c.basicFilter.range)) {
        p.push (c.basicFilter);
      }
      if (applyFilterViews_) {
        (c.filterViews || []).forEach(function (d) {
          if ( overlap_ (d.range)) p.push (d);
        });
      }
      return p;
    },[]);
    
    function overlap_ (ob) {
      // start row/column are zero based, ends are 1 based
      return !ob || !( sci > ob.endColumnIndex || eci < ob.startColumnIndex +1 || sri > ob.endRowIndex || eri < ob.startRowIndex +1);
    }
    
  };
  
  
  
  // Local functions 
  
  function copyToValidate_ (range) {
    
    // add a sheet to do validation stuff in
    var sheet= range.getSheet();
    return Utils.expBackoff ( function () {
      var copy = sheet.copyTo(sheet.getParent());
      copy.setName("delete-" + sheet.getName() + "-" + new Date().getTime().toString(32));
      return copy;
    });
    
  }
  
  function filterMap_ (filters, values,range) {
    
    // generate a map to show which row indexes were included
    // TODO some offset work if the values don't correspond to the sheet datarange... 
    // if the filterrange,valuesrange start at different places there's a bug in here that I havent tracked down
    // also Romain reported that he's found some filters with no crieria column definiion in some sheets 
    // not sure what that means to the logic, but for now they wont work
    // if anyone figures out how to treat such filters tehn comment here
    var rowStartOffset = range.getRow() - 1;
    var colStartOffset = range.getColumn() - 1;
    
    // this is the offset within the values
    var rowOffset = 0;
    
    return values.reduce(function (p,row) {
      
      if (filters.every(function (f) {
        
        return !f.criteria || Object.keys(f.criteria).every(function(c){
          // the criteria column numbers are 0 based
          var colOffset = parseInt (c , 10);
          
          // but the effective column needs to take account of the start of the tested range & filter range 
          var valuesColumn = colOffset + f.range.startColumnIndex  - colStartOffset;
          
          // returns true if it's a keepable value
          var keep = true;
          
          // always keep the header row,, otherwise check if its within range
          
          if ( (rowOffset || rowStartOffset !==f.range.startIndex)  && applies_(f.range,rowOffset + rowStartOffset,colOffset + colStartOffset)) {
            
            // there are no hidden value matches
            
            if (keep && f.criteria[colOffset].hiddenValues) {
              keep = !f.criteria[colOffset].hiddenValues.some(function (h) {
                return matches_ (row[valuesColumn] , h) ; 
              });
            }
            
            // there are no hidden value matches
            if (keep && f.criteria[colOffset].condition) {
              keep =  conditionValueMatches_ (row[valuesColumn] , f.criteria[colOffset].condition) ; 
            }
            
          }
          return keep;
          
        }); 
      })){
        p.push (rowOffset);
      }
      rowOffset++;
      return p;      
    },[]);
    
    function applies_ (ob,rowOffset, colOffset) {
      // starts seem to be offsets (0 based), ends are indexes (1 based)
      return !ob || (
        !(colOffset >= ob.endColumnIndex  || colOffset < ob.startColumnIndex || rowOffset >= ob.endRowIndex || rowOffset < ob.startRowIndex));
      
    }
    
    // there will probably be fuzzy versions of this to introduce
    function matches_ (a,b) {
      // do a == instead of ===  for now as types could be all mixed up -- need to check how filter handles different types and adjust later.
      return a == b;
    }
    
    // there will probably be fuzzy versions of this to introduce .. TODO
    function conditionValueMatches_ (a,condition) {
      try {
        return conditionValueMatch_[condition.type] (a,condition);
      }
      catch (err) {
        throw new Error('condition ' + condition.type + ' not yet implemented');
      }
    }
    
  }
  // 
  var conditionValueMatch_ = (function () {
    
    // utility matchers
    function textContains (a,b) {
      return a.indexOf(b) !== -1;
    }
    function isNumber(a) {
      return typeof a === 'number';
    }
    function checkArgs(condition,n) {
      if (condition.values.length !== n) throw new Error ('condition ' + condition.type + ' requires ' + n + ' values');
      return true;
    }
    
    // also a value can be a formula    
    // if its a number test.. then non numbers are filtered out
    return {
      TEXT_NOT_CONTAINS: function (a,b) {
        return checkArgs (b,1) && !textContains (a,b.values[0].userEnteredValue);
      },
      TEXT_CONTAINS: function (a,b) {
        return checkArgs (b,1) && textContains (a,b.values[0].userEnteredValue);
      },
      NUMBER_GREATER: function (a,b) {
        return checkArgs (b,1) && isNumber(a) && a > b.values[0].userEnteredValue;
      },
      NUMBER_GREATER_THAN_EQ: function (a,b) {
        return checkArgs (b,1) && isNumber(a) && b.values[0].userEnteredValue > a;
      },
      NUMBER_LESS: function (a,b) {
        return checkArgs (b,1) && isNumber(a) && a <  b.values[0].userEnteredValue;
      },
      NUMBER_LESS_THAN_EQ: function (a,b) {
        return checkArgs (b,1) && isNumber(a) &&  b.values[0].userEnteredValue < a;
      },
      NUMBER_EQ: function (a,b) {
        return checkArgs (b,1) && isNumber(a) && a ===  b.values[0].userEnteredValue;
      },
      NUMBER_NOT_EQ: function (a,b) {
        return checkArgs (b,1) && a !==  b.values[0].userEnteredValue;
      },
      TEXT_STARTS_WITH: function (a,b) {
        return checkArgs (b,1) && a.match(new regExp ("^" +  b.values[0].userEnteredValue,"m"));
      },
      TEXT_ENDS_WITH: function (a,b) {
        return checkArgs (b,1) && a.match(new regExp (  b.values[0].userEnteredValue + "$","m"));
      },
      TEXT_EQ: function (a,b) {
        return checkArgs (b,1) && a === b.values[0].userEnteredValue;
      },
      NUMBER_BETWEEN: function (a,b) {
        return checkArgs (b,2) && isNumber(a) && a >= b.values[0].userEnteredValue &&  a <= b.values[1].userEnteredValue;
      },
      NUMBER_NOT_BETWEEN: function (a,b) {
        return checkArgs (b,2) && (a < b.values[0].userEnteredValue ||  a > b.values[1].userEnteredValue || !isNumber(a));
      }
      
    }
    
    
  })();
  
  /* examples
  [{criteria={2={condition={values=[{userEnteredValue=2}, {userEnteredValue=3}], type=NUMBER_BETWEEN}}}, range={endColumnIndex=3, endRowIndex=8, sheetId=1786114223, startColumnIndex=0, startRowIndex=0}}]
  [{criteria={0={condition={values=[{userEnteredValue=hide}], type=TEXT_NOT_CONTAINS}}}, range={endColumnIndex=2, endRowIndex=5, sheetId=1750522359, startColumnIndex=0, startRowIndex=0}}]
  */
  /**
  * execute a API request
  * @param {string} urlTail the url appendage
  * @param {[string]} [params] the params
  * @param {string} [options] any options to be merged in
  * @return {object} a standard response object
  */
  function urlExecute_ ( urlTail , params , options) {
    
    // set default options
    options = Utils.vanMerge ([{
      method:"GET",
      muteHttpExceptions:true,
      headers: {
        "Authorization": "Bearer " + accessToken_
      }
    }, options]);
    
    // the param string
    if (params) {
      var paramString = params.isArray ? params.join ("&") : params;
    }
    paramString = paramString ? "?"+paramString : "";
    
    var response = Utils.expBackoff( function () {
      return UrlFetchApp.fetch(getBaseUrl_ () + urlTail + paramString, options);
    });
    
    // trnsmit what happened
    if (response.getResponseCode() !== 200) {
      
      return {
        response:response, 
        success:false,
        err:response.getContentText()
      }
    }
    else {
      try {
        var ob = JSON.parse (response.getContentText());
        
        return{
          response:response,
          data:ob,
          success:!ob.error,
          err:ob.error
        }; 
        
        
      }
      catch (err) {
        return {
          response:response,
          success:false,
          err:err
        }
      }
    }
  };
  
  
  /**
  * return the base API Url
  * @return {string} the base api url
  */
  function getBaseUrl_ () {
    return "https://sheets.googleapis.com/v4/spreadsheets/";
  }
  
  /**
  * these are the partial field definitions for basic filter definitions
  * @return {string} fields needed
  */
  function getFilterDefs_ () {
    return 'sheets(basicFilter(criteria,range))';
  }
  
  /**
  * these are the partial field definitions for basic filter definitions
  * @return {string} fields needed
  */
  function getFilterViewDefs_ () {
    return 'sheets(filterViews(criteria,range))';
  }
  
  /**
  * get the sheetid
  * @return {string} id field
  */
  function getSheetIdDefs_ () {
    return 'sheets(properties(sheetId,title))';
  }
  
  /**
  * encode partial field definitions
  * @param {[string]} varArray actually this is any number of args
  * @return {string} the encoded fields
  */
  function encodeFields_ () {
    if (arguments.length) {
      return "fields="+encodeURIComponent(Array.prototype.slice.apply(arguments).join(","));                      
    }
    else {
      return "";
    }
  }
  
  
};


