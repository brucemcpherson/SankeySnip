// stuff that is common to both Apps Script and Office

var View =  (function  (view) {
	'use strict';
	
	/**
	 * create an options form from the settings data
	 * @param {object} settings the settings
	 * @return {object} the settings
	 */
	view.makeOptions = function (settings) {
	
		var tableElem = Utils.el("settings-table");
		tableElem.innerHTML='';
		var tr;
	
		traverse(settings);

		return settings;
		
		// recursive setting up a form to collect settings values
		function traverse(ob,depth,queue) {
			
			depth = depth || 0;
			queue = queue || [];
			
			Object.keys(ob).forEach (function (d) {
				// if its still an object then we need to do some more
				if (Utils.isObject(ob[d])) {
					queue.push (d);
					traverse(ob[d],++depth,queue);
				}
				else {
					
					// create a text box
					if(queue.length) {
						tr = Utils.elAdd(tableElem,"tr","property-text");
						var td = Utils.elAdd(tr,"td","property");
						td.colSpan = 2;
						Utils.elAdd(td,"label").innerHTML =  queue.join(".");
						queue = [];
					}
					tr = Utils.elAdd(tableElem,"tr","property-text");
					var label = Utils.elAdd(Utils.elAdd(tr,"td","property-text"),"label");
					label.innerHTML  = Array(depth+1).join("&nbsp")+d;
					var input = Utils.elAdd(Utils.elAdd(tr,"td","property-text"),"input");
					input.value = ob[d];
					label['for'] = input.id;					
					// update the object on a new value
					input.addEventListener("change", function(e) {
						ob[d] = e.target.value;
					});
				}
			});
		}
	}
    
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
          var op = Utils.elAdd (elem,"option");
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
