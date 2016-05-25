// namespace set up

var Sankey = (function(sankey) {
  'use strict';
  
  
  /**
  * draw a sankey
  * @param {object} sets the chart settings
  * @param {string[]} headers
  * @param {[[string,string,number]]} data
  * @param {element} chartElem where to put it
  * @param {boolean} clear whether to clear current chart.
  */
  sankey.drawChart = function (sets,headers, data, chartElem,clear) {
    
    // clone the settings
    var settings = Utils.clone (sets);
    
    if(clear) {
      chartElem.innerHTML = "";
    }
    
    // this might fail since we could pick up the data at any point - but that's ok
    try {
      
      // dont let the from and to field be the same
      if (headers[0] === headers[1]) return;
      
      // assuming the data is all clean here
      var dataTable = new google.visualization.DataTable();
      
      dataTable.addColumn ('string' , headers[0]);
      dataTable.addColumn ('string' , headers[1]);	
      dataTable.addColumn ('number' , headers[2]);
      dataTable.addColumn({type: 'string', role: 'tooltip'});
      // assign data - be lenient with mismatched data types
      dataTable.addRows(data.map(function(d) {
        return [d[0].toString(), d[1].toString() , parseInt (d[2],10) ,  d[0] + ">" + d[1] + "(" + d[2] + ")"];
      }).filter(function(d){
        // get rid of blank rows
        return d[0] && d[1] && !isNaN(d[2]);
      }));
      
      
      // Instantiate and draw our chart, passing in some options.
      var chart = new google.visualization.Sankey(chartElem);
      chart.draw(dataTable, settings);
    }
    catch (err) {
      // no need -  probably just means the line is not complete yet
    }
  };
  
  sankey.doElementer = function (setup) {
    
    return new Elementer()
    .setMain('container')
    .setContainer('elementer-content')
    .setRoot('elementer-root')
    .setLayout(setup.layout)
    .setDetail(setup.detail)
    .build();
    
  };
  
  sankey.mapSettings = function (arger) {
    
    var ec = arger.getElements().controls;
    
    return {
      height: parseInt(ec.previewHeight.value, 10),
      width: parseInt(ec.previewWidth.value, 10),
      scale: {
        width: parseFloat(ec.scaleWidth.value),
        height: parseFloat(ec.scaleHeight.value),
        font: parseFloat(ec.scaleFont.value)
      },
      options:{
        
        height:parseInt(ec.previewHeight.value, 10),
        width:parseInt(ec.previewWidth.value, 10),
        
        tooltip:{
          textStyle:{
            fontName: ec.tooltipFontName.value,
            fontSize: parseInt(ec.tooltipFontSize.value, 10),
            color: ec.tooltipFontColor.value,
            bold: ec.tooltipFontBold.checked,
            italic: ec.tooltipFontItalic.checked
          },
          isHtml:false
        },    
        
        sankey: {
          link: {
            colorMode:ec.linkColorMode.value,
            color: {
              fill: ec.linkFillColor.value, // Color of the link.
              fillOpacity: parseFloat(ec.linkOpacity.value), // Transparency of the link.
              stroke: ec.linkBorderColor.value, // Color of the link border.
              strokeWidth: parseInt(ec.linkBorderWidth.value, 10) // Thickness of the link border 
            }
          },
          
          node: {
            label: {
              fontName: ec.labelFontName.value,
              fontSize: parseInt(ec.labelFontSize.value, 10),
              color: ec.labelFontColor.value,
              bold: ec.labelFontBold.checked,
              italic: ec.labelFontItalic.checked
            },
            labelPadding: parseInt(ec.labelPadding.value, 10), // Horizontal distance between the lab
            nodePadding: parseInt(ec.nodePadding.value, 10), // Vertical distance between nodes.
            width: parseInt(ec.nodeWidth.value, 10) // Thickness of the node.
          }
        }
      }
    };
    
    
    
  };
  
  sankey.setup = function() {
    return {
      detail: {
        sourceDivider: {
          template: "dividerTemplate",
          label: "Source data"
        },
        
        columnDivider: {
          template: "dividerTemplate",
          label: "Columns"
        },
        
        useDivider: {
          template: "dividerTemplate",
          label:"Apply settings",    
        },
        
        manageDivider: {
          template: "dividerTemplate",
          label:"Current settings",    
        },
        
        useStandard: {
          template: "radioTemplate",
          label: "Standard",
          icon: "tuner",
          properties:{
            name:"use-group"
          },
          values:{
            resetable:false
          }
        },
        useDocument: {
          template: "radioTemplate",
          label: "This document's settings",
          icon: "playlist_play",
          properties:{
            name:"use-group"
          },
          values:{
            resetable:false
          }
        },
        useUser: {
          template: "radioTemplate",
          label: "My personal settings",
          icon: "fingerprint",
          properties:{
            name:"use-group"
          },
          values:{
            resetable:false
          }
        },
        
        useInitial: {
          template: "radioTemplate",
          label: "Reset to initial",
          icon: "undo",
          properties:{
            name:"use-group"
          },
          values:{
            value:true,
            resetable:false
          }
        },
        
        makePermanent: {
          template: "radioTemplate",
          label: "Save for future use in this document",
          icon: "playlist_add_check",
          properties:{
            name:"manage-group"
          },
          values:{
            resetable:false,
            value:true
          }
        },
        
        makeDefault: {
          template: "radioTemplate",
          label: "Save for future use in all my documents",
          icon: "playlist_add",
          properties:{
            name:"manage-group"
          },
          values:{
            resetable:false
          }
        },
        
        clearPermanent: {
          template: "radioTemplate",
          label: "Clear saved settings in this document",
          icon: "settings_backup_restore",
          properties:{
            name:"manage-group"
          },
          values:{
            resetable:false
          }
        },
        
        clearDefault: {
          template: "radioTemplate",
          label: "Clear all my saved default settings",
          icon: "layers_clear",
          properties:{
            name:"manage-group"
          },
          values:{
            resetable:false
          }
        },
        
        manageButton:{
          template:"buttonTemplate",
          classes:{
            element:"action mui--pull-left"
          },
          styles:{
            tdElement:"padding-top:10px;"
          },
          values:{
            value:"Save"
          },
          custom:{
            spanCols:true
          }
        },
        
        applyButton:{
          template:"buttonTemplate",
          classes:{
            element:"action mui--pull-left"
          },
          styles:{
            tdElement:"padding-top:10px;"
          },
          values:{
            value:"Apply"
          },
          custom:{
            spanCols:true
          }
        },
        
        insertButton:{
          template:"buttonTemplate",
          classes:{
            element:"action mui--pull-left"
          },
          styles:{
            tdElement:"padding-top:10px;"
          },
          values:{
            value:"Insert"
          },
          custom:{
            spanCols:true
          }
        },
        wholeSheet: {
          template: "radioTemplate",
          label: "Whole sheet",
          icon: "grid_on",
          values: {
            value: true,
            resetable:false
          },
          properties:{
            name:"range-group"
          }
        },        
        selectedRange: {
          template: "radioTemplate",
          label: "Selected range",
          icon: "domain",
          properties:{
            name:"range-group"
          },
          values:{
            resetable:false
          }
        },
        
        fromColumn: {
          template: "selectTemplate",
          label: "Source column",
          icon: "skip_previous",
          values:{
            resetable:false
          }
        },
        toColumn: {
          template: "selectTemplate",
          label: "Target column",
          icon: "skip_next",
          values:{
            resetable:false
          }
        },
        weightColumn: {
          template: "selectTemplate",
          label: "Weight column",
          icon: "network_check",
          values:{
            resetable:false
          }
        },
        
        previewWidth: {
          template: "numberTemplate",
          label: "Width",
          icon: "crop_landscape",
          properties:{
            max:1024
          }
        },
        
        previewHeight: {
          template: "numberTemplate",
          label: "Height",
          icon: "crop_portrait",
          properties:{
            max:1024
          }
        },
        
        scaleWidth: {
          template: "numberTemplate",
          label: "Width ratio to preview chart",
          icon: "picture_in_picture_alt",
          properties: {
            max: 5,
            min: .5,
            step: 0.1
          },
          values:{
            value:2.3
          }
        },
        scaleHeight: {
          template: "numberTemplate",
          label: "Height ratio to preview chart",
          icon: "picture_in_picture",
          properties: {
            max: 4,
            min: .5,
            step: 0.1
          },
          values:{
            value:1.4
          }
        },
        scaleFont: {
          template: "numberTemplate",
          label: "Font size ratio to preview chart",
          icon: "format_size",
          properties: {
            max: 3,
            min: .5,
            step: 0.1
          },
          values:{
            value:1.2
          }
        },
        
        nodePadding: {
          template: "numberTemplate",
          label: "Vertical spacing between nodes",
          icon: "vertical_align_bottom",
          properties: {
            max: 20,
            min: 0
          },
          values:{
            value:10
          }
        },
        nodeWidth: {
          template: "numberTemplate",
          label: "Thickness of node",
          icon: "flip",
          properties: {
            max: 20,
            min: 0
          },
          values:{
            value:5
          }
        },
        tooltipFontSize: {
          template: "numberTemplate",
          label: "Font size",
          icon: "format_size",
          properties: {
            min: 6,
            max: 20
          },
          values:{
            value:10
          }
        },
        tooltipFontName: {
          template: "textTemplate",
          label: "Font name",
          icon: "text_fields",
          values: {
            value: "Roboto"
          }
        },
        tooltipFontColor: {
          template: "textTemplate",
          label: "Font color",
          icon: "format_color_text",
          properties: {
            type: "color"
          },
          values:{
            value:"#212121"
          }
        },
        tooltipFontBold: {
          template: "checkboxTemplate",
          label: "Bold",
          icon: "format_bold"
        },
        tooltipFontItalic: {
          template: "checkboxTemplate",
          label: "Italic",
          icon: "format_italic"
        },
        
        linkColorMode:{
          template:"selectTemplate",
          label:"Color mode",
          icon:"gradient",
          options:["none","source","target","gradient"],
          values:{
            value:"none"
          }
        },
        linkFillColor: {
          template: "textTemplate",
          label: "Background color",
          icon: "format_color_fill",
          properties: {
            type: "color",
            value: '#eeeeee'
          },
          values:{
            value:'#eeeeee'
          }
        },
        linkBorderWidth: {
          template: "numberTemplate",
          label: "Border width",
          icon: "line_weight",
          properties: {
            max: 5,
            min: 0
          },
          values:{
            value:0
          }
        },
        linkBorderColor: {
          template: "textTemplate",
          label: "Border color",
          icon: "border_color",
          properties: {
            type: "color"
          },
          values:{
            value:'#212121'
          }
        },
        linkOpacity: {
          template: "numberTemplate",
          label: "Opacity",
          icon: "opacity",
          properties: {
            min: 0,
            max: 1,
            step: 0.1
          },
          values:{
            value:0.4
          }
        },
        labelDivider: {
          template: "dividerTemplate",
          label: "Labels"
        },
        labelPadding: {
          template: "numberTemplate",
          label: "Label padding",
          icon: "format_indent_increase",
          properties: {
            max: 20,
            min: 0,
            value: 6
          },
          values:{
            value:6
          }
        },
        labelFontSize: {
          template: "numberTemplate",
          label: "Font size",
          icon: "format_size",
          properties: {
            min: 4,
            max: 24
          },
          values:{
            value:10
          }
        },
        labelFontName: {
          template: "textTemplate",
          label: "Font name",
          icon: "text_fields",
          values: {
            value: "Roboto"
          }
        },
        labelFontColor: {
          template: "textTemplate",
          label: "Font color",
          icon: "format_color_text",
          properties: {
            type: "color"
          },
          values:{
            value:'#212121'
          }
        },
        labelFontBold: {
          template: "checkboxTemplate",
          label: "Bold",
          values:{
            value:false
          },
          icon: "format_bold"
        },
        labelFontItalic: {
          template: "checkboxTemplate",
          label: "Italic",
          icon: "format_italic",
          values:{
            value:false
          }
        },
        
        aboutStuff: {
          template: "contentTemplate",
          label: '#about-sankey',
          values:{
            resetable:false
          }
        },
        
        svgCode: {
          template: "textAreaTemplate",
          label: "Copy SVG code to embed the chart image in your web site",
          properties: {
            disabled: true,
            rows: 18,
            spellcheck: false
          },
          classes:{
            elementContainer:"mui--text-dark-hint",
          },
          styles: {
            tdElement: "width:60%;",
            element: "width:90%;"
          },
          icon: "settings_ethernet",
          values:{
            resetable:false
          }
        }
      },
      layout: {
        settings: {
          prefix: "layout",
          root: "root"
        },
        pages: {
          root: {
            label: "Main page",
            items: [ "chartSettings", "dataSettings", "about","insertButton"]
          },
          about: {
            label: "About",
            items: ["aboutStuff"]
          },
          dataSettings: {
            label: "Data",
            items: ["sourceDivider", "wholeSheet", "selectedRange", "columnDivider", "fromColumn", "toColumn", "weightColumn"]
          },
          
          manageSettings: {
            label:"Manage settings",
            items:["saveSettings","useDivider","useInitial","useStandard","useUser", "useDocument","applyButton"],
            on: {
              exit: function (elementer, branch_) {
                // reset the buttons to apply next time in
                Process.control.buttons.apply.disabled=false;
              }
            }
          },
   
          saveSettings: {
            label:"Save settings",
            items:["manageDivider","makePermanent","makeDefault","clearPermanent","clearDefault","manageButton"],
            on: {
              exit: function (elementer, branch_) {
                // reset the buttons to apply next time in
                Process.control.buttons.manage.disabled=false;
              }
            }
          },
          
          
          chartSettings: {
            label: "Chart",
            items: ["arrangePreview", "scaleRatio", "embedCode","manageSettings"],
            on: {
              exit: function(elementer, branch) {
                // apply any settings changes
                if (Process.applyElementer()) {
                  // this would have returned true if any changes happened
                  Process.drawChart(true);
                };
              }
            }
          },
          embedCode: {
            label: "Get embed code",
            items: ["svgCode"]
          },
          arrangePreview: {
            label: "Appearance",
            items: ["previewHeight", "previewWidth", "links", "nodes","tooltips"]
          },
          scaleRatio: {
            label: "Scale",
            items: ["scaleHeight", "scaleWidth", "scaleFont"]
          },
          links: {
            label: "Links",
            items: ["linkColorMode","linkFillColor", "linkOpacity", "linkBorderColor", "linkBorderWidth"]
          },
          nodes: {
            label: "Nodes",
            items: ["nodePadding", "nodeWidth", "labelDivider", "labelPadding",  "labelFontSize", "labelFontColor", "labelFontName","labelFontBold", "labelFontItalic"]
          },
          tooltips: {
            label: "Tooltips",
            items: ["tooltipFontSize", "tooltipFontColor", "tooltipFontName","tooltipFontBold", "tooltipFontItalic"]
          }
        }
      }
    }
  };
  
  
  
  return sankey;
  
})(Sankey || {});
