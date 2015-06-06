var Utils= (function (utils) {

	'use strict';

    /**
    * wrap up svg element in xml
    * @param {string} content the svg stuff
    * @return {string}  
    */
    utils.svgWrap = function(content) {
      var q = "?";
      
      return '<' + q + 'xml version="1.0" encoding="UTF-8"' + q + '>' + 
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + content;
    
    };
    
	/**
	 * a little like the jquery.extend() function
	 * the first object is extended by the 2nd and subsequent objects - its always deep
	 * @param {object} ob to be extended
	 * @param {object...} repeated for as many objects as there are
	 * @return {object} the first object extended
	 */
	utils.extend = function extend () {
	
	  // we have a variable number of arguments
	  if (!arguments.length) {
	    // default with no arguments is to return undefined 
	    return undefined;
	  }
	  
	  // validate we have all objects
	  var extenders = [],targetOb;
	  for (var i = 0; i < arguments.length; i++) {
	    if(arguments[i]) {
	      if (!utils.isObject(arguments[i])) {
	        throw 'extend arguments must be objects not ' + arguments[i];
	      }
	      if (i ===0 ) {
	        targetOb = arguments[i];
	      } 
	      else {
	        extenders.push (arguments[i]);
	      }
	    }
	  };
	  
	  // set defaults from extender objects
	  extenders.forEach(function(d) {
	      recurse(targetOb, d);
	  });
	  
	  return targetOb;
	 
	  // run do a deep check
	  function recurse(tob,sob) {
	    Object.keys(sob).forEach(function (k) {
	    
	      // if target ob is completely undefined, then copy the whole thing
	      if (utils.isUndefined(tob[k])) {
	        tob[k] = sob[k];
	      }
	      
	      // if source ob is an object then we need to recurse to find any missing items in the target ob
	      else if (utils.isObject(sob[k])) {
	        recurse (tob[k] , sob[k]);
	      }
	      
	    });
	  }
	};

	/** 
	 * check if item is undefined
	 * @param {*} item the item to check
	 * @return {boolean} whether it is undefined
	 **/
	utils.isUndefined = function (item) {
	  return typeof item === 'undefined';
	};
	
	/** 
	 * check if item is undefined
	 * @param {*} item the item to check
	 * @param {*} defaultValue the default value if undefined
	 * @return {*} the value with the default applied
	 **/
	utils.applyDefault = function (item,defaultValue) {
		return utils.isUndefined(item) ? defaultValue : item;
	};
	
  /** 
	* isObject
	* check if an item is an object
	* @param {object} obj an item to be tested
	* @return {boolean} whether its an object
	**/
	utils.isObject = function (obj) {
	  return obj === Object(obj);
	};
	
	/** 
	* clone
	* clone a stringifyable object
	* @param {object} obj an item to be cloned
	* @return {object} the cloned object
	**/
	utils.clone = function (obj) {
	  return utils.isObject(obj) ? JSON.parse(JSON.stringify(obj)) : obj;
	};
	
	/**
	* convenience getbyid
	* @param {string} id element id
	* @return {element} the element
	*/
	utils.el = function(id) {
	  return document.getElementById(id);
	};
	/**
	 * convenience aqdd element
	 * @param {element} parent the parent
	 * @param {string} type the element type
	 * @param {string} aclass the optional class list
	 * @return {element} the element
	 */ 
	utils.elAdd = function (parent, type, aclass) {
	  var elem = document.createElement(type || "div");
	  if(aclass) elem.className = aclass;
	  parent.appendChild(elem);
	  return elem;
	};
	/**
	 * convenience aqdd text element
	 * @param {element} parent the parent
	 * @param {string} text the text to assign
	 * @return {element} the element
	 */ 
	utils.textAdd = function (parent, text) {
	  var elem = document.createTextNode(text);
	  parent.appendChild(elem);
	  return elem;
	};
	/**
	 * create a column label for sheet address, starting at 1 = A, 27 = AA etc..
	 * @param {number} columnNumber the column number
	 * @return {string} the address label 
	 */
	utils.columnLabelMaker = function (columnNumber,s) {
	  s = String.fromCharCode(((columnNumber-1) % 26) + 'A'.charCodeAt(0)) + ( s || '' );
	  return columnNumber > 26 ? utils.columnLabelMaker ( Math.floor( (columnNumber-1) /26 ) , s ) : s;
	};

	/**
	 * hide an element
	 * @param {element} element to hide
	 * @return {element} for chaining
	 */
	utils.hide = function (element) {
		return utils.show(element,"none");	 
	};
	
	/**
	 * show an element
	 * @param {element} element to hide
	 * @param {string} display style (default block)
	 * @return {element} for chaining
	 */
	utils.show = function (element,display) {
		element.style.display=display || "block";
		return element;	 
	};
    
     /** 
     * checksum
     * create a checksum on some string or object
     * @param {*} o the thing to generate a checksum for
     * @return {number} the checksum
     **/
    utils.checksum = function (o) {
      // just some random start number
      var c = 23;
      if (!utils.isUndefined(o)){
        var s =  (utils.isObject(o) || Array.isArray(o)) ? JSON.stringify(o) : o.toString();
        for (var i = 0; i < s.length; i++) {
          c += (s.charCodeAt(i) * (i + 1));
        }
      }
      
      return c;
    };
    

    
	return utils;
    
})(Utils || {});

