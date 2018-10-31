// responsible for placing a png image on a sheet
var Image = (function(image) {
  'use strict';
  
  // insert an image at row / column in the sheet
  image.insert = function ( range,  png , offx, offy) {
    range.getSheet().insertImage ( png ,  range.getColumn(), range.getRow(),offx || 0 , offy || 0);
    
  };
  
  // place an image
  image.place = function (png) {
    return image.insert ( SpreadsheetApp.getActiveRange() , png , 10,6);
  }
  
  return image;
}) (Image || {});


