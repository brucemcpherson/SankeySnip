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

      activeHeadings: {
        from:{
          current:'from',
          elem:elements.controls.fromColumn
        },
        to: {
          current:'to',
          elem:elements.controls.toColumn
        },
        value:{
          current:'value',
          elem:elements.controls.weightColumn
        }
      },
      
      chart: {
        headings:[],
        data:[[]],
        elem:DomUtils.elem("chart"),
        ghost:DomUtils.elem("ghost"),
        defOptions:{
          height:DomUtils.elem("chart").offsetHeight,
          width:DomUtils.elem("chart").offsetWidth
        }
      },
      
      code: {
        svg:elements.controls.svgCode
      },
      
      buttons: {
        insert:elements.controls.insertButton,
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
        interval:4000
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
  * @param {boolean} clear whether to clear current chart first
  */
  process.drawChart = function (clear) {
    
    //disable inserting
    process.control.buttons.insert.disabled  = false;
    
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
    
    process.control.buttons.insert.disabled  =  !svg; 
    
  };
  
  process.selectFields = function () {
    var sc = process.control;
    
    // duplicate removal
    var goodHeadings = sc.headings.filter(function(d,i,a) {
      return a.indexOf(d) === i && d;
    });
    
    
    // make active headings/ deleting them if not there, along with the chart headings
    sc.chart.headings = Object.keys(sc.activeHeadings).map (function(k,i) {
      
      // the object describing each data column
      var d = sc.activeHeadings[k];
      
      // set to the currently selected value
      d.current = d.elem.value || d.current;
      
      // default to positional if we cant find a match .. this would be first time round
      if (goodHeadings.indexOf(d.current) === -1) d.current = goodHeadings.length > i ? goodHeadings[i] : undefined; 
      
      
      // redo the select options
      d.current = View.buildSelectElem (goodHeadings , d.elem , d.current);
      
      
      return d.current;
      
    });
    
    // make the chart data
    sc.chart.data = sc.dataObjects.map (function (row) {
      return sc.chart.headings.map(function(d) {
        return row[d];
      });
    });
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
      
      // enable inserting
      process.control.buttons.insert.disabled = false;
      
    }
  }
  
  
  return process;
  
})( Process || {} );
