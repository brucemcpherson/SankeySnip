// stuff that is common to both Apps Script and Office

var View =  (function  (view) {
	'use strict';
	
  // take all the properties in an object and set the equivalent elements to that value

	
    /**
     * build a new select structure 
     * @param {object[]} items the items to build the select with
     * @param {Element} elem of the parent select elem
     * @param {*} defaultValue the default value
     */
    view.buildSelectElem = function (items,elem,defaultValue) {
    
      // clear whatever is there
      elem.value= undefined;
      elem.innerHTML = "";
      var found;
      
      // add the options
      items.forEach (function (d,i,a) {
        // dont set value if its a repeat
        if (!i || !a.slice(0,i).some(function(e) { return e===d; })) {
          var op = DomUtils.addElem (elem,"option");
          op.value = d;
          op.text = d;
          if (d === defaultValue) {
           op.selected = true;
           found = d;
          }
        }
        
      });
      if (!Utils.isUndefined(found)) elem.value = found;
      return found;
    } 

	return view;
})(View || {});

  