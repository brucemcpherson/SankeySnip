/**
* manages the connection between the data and the chart
* @namespace Process
*/
var Process = (function (process) {
  'use strict';
  
  process.globals = {
    resetProperty:"ssnipSettings",
    purchaseLevel:'ssnipLevel',
    fullAccess:10,
    openAccess:true,
    version:"2.0.13"
  };
  
  process.applyElementer  = function () {
    var before = Utils.clone (process.control.sankey.settings);
    process.control.sankey.settings =  Sankey.mapSettings (process.control.sankey.elementer);
    return JSON.stringify(before) !== JSON.stringify(process.control.sankey.settings);
  };
  
  
  process.initialize = function () {
    
    var sankeySetup = Sankey.setup();
    
    // this will create the structure for retrieving settings
    var elementer = Sankey.doElementer(sankeySetup);
    var elements = elementer.getElements();
    
    
    process.control = {
      result: {
        data:undefined, 
        checksum:undefined
      },
      sankey:{
        setup:sankeySetup,
        elementer:elementer,
        settings:{},
        store:{
          useInitial:null,
          useStandard:null,
          useUser:null,
          useDocument:null
        },
        auth:{}
      },
      
      tabs: {
        settings:DomUtils.elem("elementer-root")
      },
      
      activeHeadings: {
        from:{
          current:'',
          elem:elements.controls.fromColumn,
          best:'Source'
        },
        to: {
          current:'',
          elem:elements.controls.toColumn,
          best:'Target'
        },
        value:{
          current:'',
          elem:elements.controls.weightColumn,
          best:'Volume'
        }
      },
      
      chart: {
        headings:[],
        data:[[]],
        elem:DomUtils.elem("chart"),
        ghost:DomUtils.elem("ghost"),
        instructions:DomUtils.elem("instructions"),
        defOptions:{
          height:DomUtils.elem("chart").offsetHeight,
          width:DomUtils.elem("chart").offsetWidth
        }
      },
      
      code: {
        svg:elements.controls.svgCode
      },
      
      buttons: {
        insert:DomUtils.elem("insert-button"),
        manage:elements.controls.manageButton,
        apply:elements.controls.applyButton,
        selectedRange:elements.controls.selectedRange,
        wholeSheet:elements.controls.wholeSheet
      },
      
      watching: {
        watcher:ClientWatcher.addWatcher({
          pollingFrequency:3200,
          watch:{sheets:false,active:false},
          domain:{fiddler:false,scope:elements.controls.wholeSheet.checked ? "Sheet" : "Active"}
        })
      },
      
      toast: {
        interval:3500
      }
      
    };


    // get and apply any stored properties  
    return new Promise (function (resolve, reject) {
      
      Provoke.run ('Props','getAll')
      .then( function (result) {
        var pc = Process.control.sankey.store;
        
        // the factory settings
        pc.useStandard = elementer.getStandard();
        pc.auth = result.auth;
        
        // any data found in property stores
        result.saved.forEach(function(d) {
          pc[d.source] = d.settings; 
          elements.controls[d.source].disabled = d.settings ? false : true;
          if (d.settings) {
            elementer.setInitial (d.settings);
          }
        });
        
        
        // the finally decided upon initial values
        pc.useInitial = elementer.getInitial();
        
        // use the defaults for the preview chart dimensions
        if(!parseInt(elements.controls.previewHeight.value,10)){
          elements.controls.previewHeight.value = Process.control.chart.defOptions.height;
        }
        if(!parseInt(elements.controls.previewWidth.value,10)){
          elements.controls.previewWidth.value = Process.control.chart.defOptions.width;
        }
        
        // map the values 
        process.applyElementer();
        resolve (elementer);
      })
      ['catch'](function (err) {
        App.showNotification ("failed while getting saved properties ", err);
        reject (err);
      });
    });

  };
  
  /**
  * draw a sankey chart from the matrix data
  */
  process.drawChart = function () {
    
    //disable inserting.. during construction
    process.control.buttons.insert.disabled  = true;
    
    // no need to clear the chart first
    var clear = true;
    
    var sc = process.control.chart;
    var sts = process.control.sankey.settings;
    var opt = Utils.vanMerge([sc.defOptions, sts.options]);
    
    var svg;
    
    if (sc.data.length) {

      opt.height = opt.height || sc.defOptions.height;
      opt.width = opt.width || sc.defOptions.width;
      
      // the preview
      Sankey.drawChart (opt , sc.headings, sc.data, sc.elem, clear);
      
      // the full sized chart
      svg = scaleChart(clear);
      process.control.code.svg.value = "";
      if (svg && svg.length) {
        // need to tweak any gradient code so it works outside context of apps script
        process.control.code.svg.value = svg[0].replace (/url\([^#]+/g, "url(");
      }
      DomUtils.hide (sc.instructions,true);
      DomUtils.hide (sc.elem,false);
            
      // enable inserting
      process.control.buttons.insert.disabled = false;

    }
    else {
      // no viable data so reveal instructions and disable insertion
      process.control.buttons.insert.disabled  = true;
      DomUtils.hide (sc.elem,true);
      DomUtils.hide (sc.instructions,false);
      
    }
    
    function scaleChart(clear, divScale) {
      
      // scale up the real one
      var big = Utils.clone(sts);
      var scale = divScale || big.scale;
      
      var big = Utils.vanMerge([opt, {
        height: opt.height * scale.height,
        width: opt.width * scale.width,
        sankey: {
        node: {
        label: {
        fontSize: opt.sankey.node.label.fontSize * scale.font
      },
                                labelPadding: opt.sankey.node.labelPadding * scale.width,
                                nodePadding: opt.sankey.node.nodePadding * scale.height,
                                width: opt.sankey.node.width * scale.width
                                }
                                }
                                }]);
      
      
      
      Sankey.drawChart (big , sc.headings, sc.data, sc.ghost, clear);
      // set up svg code for copying
      return sc.ghost.innerHTML.match(/\<svg.*svg\>/);
      
    }
    

    
  };
  
  process.selectFields = function () {
    var sc = process.control;
    
    // goodheadings will contain the potential headings
    var goodHeadings = sc.headings.filter(function(d,i,a) {
      return a.indexOf(d) === i && d;
    });

    // make active headings/ deleting them if not there, along with the chart headings
    sc.chart.headings = Object.keys(sc.activeHeadings).map (function(k) {
        
      // the object describing each data column
      var d = sc.activeHeadings[k];
      var options = DomUtils.getOptions(d.elem);
      
      // sliced the first one which is a null option if it exists
      if (!options.length || !Utils.isSameAs (goodHeadings, options.slice(1))) {
        
        // we have a potentially new set of options, rebuild the select
        var selected = d.elem.value;
        
        d.elem.innerHTML= "";
        d.current = d.elem.value = "";
        
        // add a null option
        DomUtils.addElem (d.elem,"option");
        goodHeadings.forEach(function (e) {
          var op = DomUtils.addElem (d.elem,"option");
          op.value = e;
          op.text = e;
        });
        
        // and if currently selected is no longer in the list then we need to cancel it
        if (goodHeadings.indexOf(selected) === -1) {
          d.elem.value = d.current = "";
        }
        
        else if (selected) {
          d.current = d.elem.value = selected;
        }
      }
      return d;
    })
    .map (function (d,i,a) {
      // now we need to deduce new values
      if (!d.current && !a.some(function(e) { return e.current === d.best })) {
        // we dont have a selection for this one, and its not being used by someone else so use the default
        if (goodHeadings.indexOf(d.best) !== -1) {
          d.current = d.best;
        }
      }
      
      // if that didnt find anything then use the position
      if (!d.current && goodHeadings.length > i && !a.some(function(e) { return e.current === goodHeadings[i] ; })) {
        d.current = goodHeadings[i];
      }
      
      // now set the select value to whatever it now is
      d.elem.value = d.current;
      return d.current;
    });
     
    // make the chart data
    var sh = sc.chart.headings;

    sc.chart.data = sh.every(function(d) { return d;}) && Utils.unique(sh).length === Object.keys(sc.activeHeadings).length ? 
      sc.dataObjects.map ( function (row) {
        return sh.map(function(d) {
          return row[d];
        }) 
      }) : [];
  }
  /**
  * fix up and store data received from server
  * @param {object} result the result
  */
  process.syncResult = function (result) {

    var sc = process.control;
    
    // store it
    sc.result = result;
    
    // make the headings
    if (result.data && (result.data.length || result.clear)) {
      
      sc.headings = result.data.length ? result.data[0] : [];
      sc.data = result.data.length > 1 ? result.data.slice(1) : [];

      
      // make the data into k.v pairs
      sc.dataObjects = sc.data.map(function (row) {
        var i = 0;
        return sc.headings.reduce (function (p,c) {
          p[c] = row[i++];
          return p;
        },{});
      });
      
      process.selectFields();
      process.drawChart();

      
    }
  }
  
  
  return process;
  
})( Process || {} );
