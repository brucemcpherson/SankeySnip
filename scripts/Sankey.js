// namespace set up

var Sankey = (function(sankey) {
	'use strict';

	/**
	 * draw a sankey
     * @param {object} settings the chart settings
	 * @param {string[]} headers
	 * @param {[[string,string,number]]} data
     * @param {element} chartElem where to put it
     * @param {boolean} clear whether to clear current chart.
	 */
	 sankey.drawChart = function (settings,headers, data, chartElem,clear) {
		
        if(clear) {
          chartElem.innerHTML = "";
        }
        
        // this might fail since we could pick up the data at any point - but that's ok
        try {
          // assuming the data is all clean here
          var dataTable = new google.visualization.DataTable();
          
          dataTable.addColumn ('string' , headers[0]);
          dataTable.addColumn ('string' , headers[1]);	
          dataTable.addColumn ('number' , headers[2]);
          
          // assign data - be lenient with mismatched data types
          dataTable.addRows(data.map(function(d) {
            return [d[0].toString(), d[1].toString() , parseInt (d[2],10)];
          })
		  .filter(function(d){
			  // get rid of blank rows
			  return d[0] && d[1] && !isNaN(d[2]);
		  }));
          // Set chart options
          settings.width = settings.width || chartElem.offsetWidth; 
          settings.height = settings.height || chartElem.offsetHeight; 
          
          
          // Instantiate and draw our chart, passing in some options.
          var chart = new google.visualization.Sankey(chartElem);
          chart.draw(dataTable, settings);
        }
        catch (err) {
          // no need -  probably just means the line is not complete yet
        }
	};
	
    sankey.initialize = function () {
      sankey.settings = {
          height: 0,
          width: 0,
          scale: {
            width:4,
            height:3,
            font:2
          },
          sankey:{
              link: {
                  color: {
                      fill: '#eee',     // Color of the link.
                      fillOpacity: 0.7, // Transparency of the link.
                      stroke: 'black',  // Color of the link border.
                      strokeWidth: 0    // Thickness of the link border (default 0).
                  }
              },
              node:{
                  label:{
                      fontName:'Roboto',
                      fontSize: 10,
                      color: '#000',
                      bold: false,
                      italic: false
                  },
                  labelPadding: 6, // Horizontal distance between the label and the node.
                  nodePadding: 10, // Vertical distance between nodes.
                  width: 5         // Thickness of the node.
              }	
          }
      };
     
    };
	
	return sankey;
	
})(Sankey || {});
