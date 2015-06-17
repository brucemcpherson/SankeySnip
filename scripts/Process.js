// stuff that is common to both Apps Script and Office



// define it
var Process = (function (process) {
	'use strict';

    process.initialize = function () {
      process.control = {
        result: {
          data:undefined, 
          checksum:undefined
        },
        
        activeHeadings: {
          from:{
            current:'from',
            elem:Utils.el('from-column')
          },
          to: {
            current:'to',
            elem:Utils.el('to-column')
          },
          value:{
            current:'value',
            elem:Utils.el('value-column')
          }
        },
        
        chart: {
          headings:[],
          data:[[]],
          elem:Utils.el("chart"),
          ghost:Utils.el("ghost"),
          picker:Utils.el("picker-preview")
        },
        
        code: {
          svg:Utils.el("chart-code-svg"),
          picker:Utils.el("picker-code-svg"),
          pickerHeight:520*.7,
          pickerWidth:600*.9
        },
        
        buttons: {
          save: Utils.el("save-button")
        },
        
        polling: {
          interval:2000,
        }
        
      };
      
    };
    
	/**
	 * draw a sankey chart from the matrix data
     * @param {boolean} clear whether to clear current chart first
	 */
	process.drawChart = function (clear) {
     
      // enable.disable save button
      
      var sc = process.control.chart;
      var svg;
      
      if (sc.data.length) {
        // the preview
        Sankey.drawChart (Sankey.settings , sc.headings, sc.data, sc.elem, clear);
        
        // the full sized
        svg = scaleChart(clear);
        process.control.code.svg.value =  (svg && svg.length ? svg[0] : '');
        
        // the picker sized
        svg = scaleChart(clear, {
          width:   process.control.code.pickerWidth / sc.elem.offsetWidth , 
          height:  process.control.code.pickerHeight / sc.elem.offsetHeight,
          font:  process.control.code.pickerHeight / sc.elem.offsetHeight
        } );
        
        process.control.code.picker.value = (svg && svg.length ? svg[0] : '');
       
      }
      
      function scaleChart(clear, divScale) {
        
        // scale up the real one
        var big = Utils.clone(Sankey.settings);
        var scale = divScale || big.scale;
        
        big.height = Sankey.settings.height * scale.height;
        big.width = Sankey.settings.width * scale.width;
        big.sankey.node.label.fontSize = Sankey.settings.sankey.node.label.fontSize * scale.font;
        big.sankey.node.labelPadding = Sankey.settings.sankey.node.labelPadding * scale.width;
        big.sankey.node.nodePadding = Sankey.settings.sankey.node.nodePadding * scale.height;
        big.sankey.node.width = Sankey.settings.sankey.node.width * scale.height;
        
        Sankey.drawChart (big , sc.headings, sc.data, sc.ghost, clear);
        // set up svg code for copying
        return sc.ghost.innerHTML.match(/\<svg.*svg\>/);
        
      }
      
      
      process.control.buttons.save.disabled =  !svg; 
      
    };

    process.selectFields = function () {
      var sc = process.control;
      
      // duplicate removal
      var goodHeadings = sc.headings.filter(function(d,i,a) {
        return a.indexOf(d) === i;
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
        process.drawChart(result.clear);
      }
    }
    

    
    /**
     * every now and again, go and get the latest data
     */
    process.startPolling = function () {
      setTimeout(function(){ 
        Client.getData();
      }, process.control.polling.interval);
    }
    
    return process;
	
})( Process || {} );
