// responsible for placing a png image on a sheet
var Image = (function(image) {
  'use strict';
  
  // insert an image at row / column in the sheet
  image.insert = function ( range,  png) {
    range.getSheet().insertImage ( png ,  range.getColumn(), range.getRow());
    
  };
  
  // place an image
  image.place = function (png) {
    return image.insert ( SpreadsheetApp.getActiveRange() , png);
  }
  
  return image;
}) (Image || {});


