
var Home = (function (home) {
  'use strict';
  
  var ns = home;

  // The initialize function must be run to activate elements
  ns.initialize = function (reason) {


    Process.control.buttons.generate.addEventListener('click',function () {
    
      // spin the cursor
      DomUtils.hide ('spinner',false);
      // disable the button
      Process.control.buttons.generate.disabled = true;
      
      Provoke.run("Server","generateTestData")
      .then (function (result) {
        App.toast ("Sample data generated","You can delete this sheet at any time");
        finallyPromise();
      })
      ['catch'](function (err) {
        App.showNotification ("Failed to generate sample data", err);
        finallyPromise();
      });
      
      function finallyPromise  () {
        DomUtils.hide ('spinner', true);
        Process.control.buttons.generate.disabled = false;
      }
    
    });
    // insert in sheet 
    Process.control.buttons.insert.addEventListener('click', function () {    
        try {
          Client.insertImage ( CanvasConvert.svgToPng (Process.control.code.svg.value));
        }
        catch (err) {
          App.showNotification ('Error converting image to PNG format', err);
        }
    });
    
    // if the close button exists then do it.
    if (Process.control.buttons.close) {
      Process.control.buttons.close.addEventListener('click', function () {    
          google.script.host.close();
      });
    }
    
    // watch out for exiting the tab
    var toggles = document.querySelectorAll('[data-mui-controls="' + Process.control.tabs.settings.id + '"]');
    toggles[0].addEventListener ('mui.tabs.hidestart',function () {
      if (Process.applyElementer()) {
        // this would have returned true if any changes happened
        Process.drawChart();
      };
    });

    // which settings to use
    var elementer = Process.control.sankey.elementer;
    var elems = elementer.getElements();

    // this is about applying different settings 
    Process.control.buttons.apply.addEventListener('click', function () { 
      
      // just use the current settings
      Process.control.buttons.apply.disabled=true;
      Object.keys(Process.control.sankey.store).forEach(function(d) {
        try {
          if (elems.controls[d] && elems.controls[d].checked) {
            elementer.applySettings(Process.control.sankey.store[d]);
            // make default values visible for height/width
            if(!parseInt(elems.controls.previewHeight.value,10)){
              elems.controls.previewHeight.value = Process.control.chart.defOptions.height;
            }
            if(!parseInt(elems.controls.previewWidth.value,10)){
              elems.controls.previewWidth.value = Process.control.chart.defOptions.width;
            }
            
            Sankey.mapSettings(elementer);
            Process.drawChart();
            App.toast ("Settings restored", 
                       "Your chart has been reformatted");
          
          }
        }
        catch (err) {
          App.showNotification ("Control element error detected on settings " + d, err);
        }
      });
      
    });

    // this is about enabling the apply button if anything different is selected
    var buts = ['apply','manage'];
    ['use-group','manage-group'].forEach (function (g,i) {
      DomUtils.getGroup (g).forEach(function(d) {
        d.addEventListener('change', function () {
          Process.control.buttons[buts[i]].disabled=false;
        });
      });
    });

    // this is about restoring settings if selected in the settings menus
    Process.control.buttons.reset.forEach(function(d) {
      d.addEventListener('click',function() {
        Process.restoreResetValues (Process.control.sankey.elementer , d.id.match(/resetButton_(\w+)-elem/)[1]);
        d.disabled = true;
      });
    });
    
    //this us about saving and clearing settings in property stores
    Process.control.buttons.manage.addEventListener('click', function () {    
      
      // get all the elements
      Process.control.buttons.manage.disabled=true;
      var elementer = Process.control.sankey.elementer;
      var elems = elementer.getElements();
      var current = elementer.getCurrent();
      
      if (elems.controls.makePermanent.checked) {

        Provoke.run('Props','setDocument', elementer.getCurrent())
        .then (function (result) {
          Process.control.sankey.store.useDocument = current;
          elems.controls.useDocument.disabled = false;
          App.toast ("Settings saved", "Current settings will be applied to all charts in this document in future");
        })
        ['catch'](function(err) {
          App.showNotification("Error setting document properties",err);
        });
      }
      
      else if (elems.controls.makeDefault.checked) {
        // write to user user properties
        Provoke.run('Props','setUser', elementer.getCurrent())
        .then (function (result) {
          Process.control.sankey.store.useUser = current;
          elems.controls.useUser.disabled = false;
          App.toast ("Settings saved", 
            "Current settings will be used as default for all your charts in documents without their own settings");
        })
        ['catch'](function(err) {
          App.showNotification("Error setting user properties",err);
        });

      }

      else if (elems.controls.clearPermanent.checked) {
        // remove perm settings from document, user properties and apply factory values
        Provoke.run ('Props', 'removeDocument')
        .then(function (result) {
          Process.control.sankey.store.useDocument = null;
          elems.controls.useDocument.disabled = true;
          App.toast ("Settings cleared", 
            "Document settings have been removed");
        })
        ['catch'](function(err) {
          App.showNotification("Error removing documentproperties",err);
        });

      }
      
      else if (elems.controls.clearDefault.checked) {
        // remove perm settings from document, user properties and apply factory values
        Provoke.run ('Props', 'removeUser')
        .then(function (result) {
          Process.control.sankey.store.useUser = null;
          elems.controls.useUser.disabled = true;
          App.toast ("Settings cleared", 
            "Your default settings have been removed");
        })
        ['catch'](function(err) {
          App.showNotification("Error removing user properties",err);
        });


      }
      else {
        App.showNotification ("radio group has nothing checked ","manage-group");
      }

    });

    // drop downs for field names
    Object.keys(Process.control.activeHeadings).forEach (function (k) {
      Process.control.activeHeadings[k].elem.addEventListener ('change' , function () {
        Process.selectFields();
        Process.drawChart(true);
      });
    },false);
  
    // type of input data radio buttons
    ['selectedRange','wholeSheet'].forEach (function (d) {
      Process.control.buttons[d].addEventListener ('change' , function () {
        // change the polling scope
        if (Process.control.buttons[d].checked) {
          Process.control.watching.watcher.getWatching().domain.scope = d === "selectedRange" ? "Active" : "Sheet";
        }
        Process.selectFields();
        Process.drawChart(true);
      });
    },false);

  };


  return home;
})(Home || {});
