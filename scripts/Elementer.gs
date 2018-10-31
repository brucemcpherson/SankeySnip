function Elementer() {
  
  var self = this;
  var elements_, detail_, layout_, container_, main_, classes_, root_,initial_, initialSource_ ="standard",standard_;
  
  // the default layout
  // anything added by .setLayout() will be merged with this
  var defLayout_ = {
    
    settings: {
      prefix: "layout",
      root: "root"
    },
    
    pages: {
      root: {
        label: "Settings",
        items: [],
        classes: {
          branch: "",
          nav: {
            prevIcon: "",
            showTitle:false
          }
        }
      }
    }
  };
  
  // anything added with setClasses() will be merged with this
  var defClasses_ = {
    branch: "",
    subhead: "mui--text-subhead",
    backLabel: "mui--text-accent-secondary",
    title: "mui--text-title",
    table: "mui-table",
    tr: "",
    td: "",
    label: "mui--text-dark-secondary",
    element: "",
    elementContainer: "",
    tdElement: "mui--text-right mui--align-middle",
    tdLabel: "",
    icon: "mui--text-dark-secondary material-icons",
    tdIcon: "",  // was align middle
    tdNextIcon:"mui--align-middle mui--text-right",
    option:"",
    nav: {
      nextIcon: "chevron_right",
      prevIcon: "",    // chevron_left to enable back at top of page.
      showTitle:true
    },
    hide: "mui--hide",
    show: "mui--show"
  };
  
  var defStyles_ = {
    td: "padding:3px;",
    tdLabel: "padding:3px;",
    tdIcon: "width:34px;padding:0px;margin:0;padding-top:4px;padding-left:3px;",  // was max-width:32, 3px padding
    tdElement: "padding:3px;",
    backLabel:"position:relative;vertical-align: middle;",
    icon:"vertical-align: middle;",
    elementContainer:"padding:0px;margin:0;",
    navCursor:"cursor: pointer; cursor: hand;",
    backLabel:"cursor: pointer; cursor: hand;",
    tdNextIcon: "padding:3px;",
  };
  
  var defDetail_ = {
    selectTemplate: {
      tag: "SELECT",
      classes:{
        elementContainer:""
      },
      values:{
        property:"value",
        resetable:true
      }
    },
    
    textAreaTemplate: {
      tag: "TEXTAREA",
      label:"Input text area",
      classes:{
        elementContainer:"",
        tdElement:"mui-text-left",
      },
      styles:{
        element:"width:100%;"
      },
      values:{
        property:"value",
        resetable:true,
        value:"",
      }
    },
    
    
    
    buttonTemplate:{
      tag:"BUTTON",
      label:"",
      classes:{
        element:"",
        tdElement:"button-item",
        tr:"button-place",
        cancel:""
      },
      properties:{
        type:"button"
      },
      styles:{
        tdElement:"padding-top:10px;"
      },
      values:{
        property:"innerHTML",
        value:"SUBMIT",
        resetable:false
      },
      custom:{
        cancelButton:true,
        cancelText:"BACK",
        outside:true,
        backListener:true
      }
    },
    
    resetButtonTemplate:{
      tag:"BUTTON",
      label:"",
      classes:{
        element:"action ",
        tdElement:"button-item",
        tr:"button-place",
        cancel:""
      },
      properties:{
        type:"button",
        disabled:true
      },
      styles:{
        tdElement:"padding-top:10px;"
      },
      values:{
        property:"innerHTML",
        value:"APPLY",
        resetable:false
      },
      custom:{
        cancelButton:true,
        cancelText:"BACK",
        outside:true,
        backListener:true
      }
    },
    
    textTemplate: {
      tag: "INPUT",
      label: "Input text",
      icon: "input",
      properties: {
        type: "text"
      },
      styles: {
        element: "width:50px;"
      },
      classes:{
        elementContainer:""
      },
      values: {
        property:"value",
        value:"",
        resetable:true
      }
    },
    numberTemplate: {
      tag: "INPUT",
      label: "Input number",
      icon: "input",
      properties: {
        type: "number",
        min: 0,
        max: 100
      },
      styles: {
        element:"width:50px;"
      },
      classes:{
        elementContainer:""
      },
      values: {
        property:"value",
        value:0,
        resetable:true
      }
    },
    checkboxTemplate: {
      tag: "INPUT",
      properties: {
        type: "checkbox"
      },
      classes:{
        elementContainer:""
      },
      values: {
        property:"checked",
        value:false,
        resetable:true
      }
    },
    radioTemplate: {
      tag: "INPUT",
      properties: {
        type: "radio",
        name: "radioGroup"
      },
      classes:{
        elementContainer:""
      },
      values: {
        property:"checked",
        value:false,
        resetable:true
      }
    },
    subheadTemplate: {
      label: "subhead",
      classes: {
        label: "mui--text-subhead"
      }
    },
    dividerTemplate: {
      label: "subhead",
      classes: {
        label: "mui--text-accent"
      },
      styles: {
        tdLabel:"padding:3px;padding-top:13px;"
      }
    },
    contentTemplate: {
      label: "some content",
      classes: {
        label: "mui--text-dark-primary mui--text-body1"
      }
    }
  };
  
  /**
  * these are the computed values/styles and classes generated by the elementer
  * @return {object} the computed values/styles etc
  */
  self.getStandard = function () {
    return standard_;
  };
  
  /**
  * these are the computed values/styles and classes generated by the elementer
  * @return {object} the computed values/styles etc
  */
  self.getInitial = function () {
    return initial_;
  };
  
  self.setInitial = function (initial,initialSource) {
    if (initial) {
      initialSource_ = initialSource;
      initial_ = initial;
      self.restoreInitial();
      return self.getInitial();
    }
    
    return null;
  };
  
  /**
  * return the elements generated
  * @return {object} the element view
  */
  self.getElements = function() {
    return elements_;
  };
  self.getLayout = function () {
    return layout_;
  }
  /**
  * @param {object} detail an object with the item details
  * @return {Elementer} self
  */
  self.setDetail = function(detail) {
    detail_ = Utils.vanMerge([defDetail_, detail]);
    return self;
  };
  
  /**
  * @param {object} detail an object with the item layout
  * @return {Elementer} self
  */
  self.setLayout = function(layout) {
    layout_ = Utils.vanMerge([defLayout_, layout]);
    return self;
  };
  
  /**
  * this is the container that hosts the main
  * content of the elementer
  * @param {string|element} container elementer content
  * @return {Elementer} self
  */
  self.setContainer = function(container) {
    container_ = DomUtils.elem(container);
    return self;
  };
  
  /**
  *this is the container of the main page hosting the 
  * link to the elementer content
  * if specified it will be hidden or shown 
  * depending on whether we are at the top level
  * @param {string|element} main main hosting element
  * @return {Elementer} self
  */
  self.setMain = function(main) {
    main_ = DomUtils.elem(main);
    return self;
  };
  
  /**
  *this is the root element
  * which will normally be a child of main
  * @param {string|element} root hook to elementer
  * @return {Elementer} self
  */
  self.setRoot = function(root) {
    root_ = DomUtils.elem(root);
    return self;
  };
  
  /**
  *this is an object with the required formatting classes
  * if you are using muicss, then this is optional
  * @param {object} classes your class definitions to merge
  * @return {Elementer} self
  */
  self.setClasses = function(classes) {
    classes_ = Utils.vanMerge([defClasses_, classes]);
    return self;
  };
  
  /**
  * put the settings back to standard
  * @return {Elementer} self
  */
  self.restorestandard = function() {
    self.applySettings (standard_);
    return self;
  };
  
  /**
  * put the settings back to what they were initially
  * @return {Elementer} self
  */
  self.restoreInitial = function() {
    self.applySettings (initial_);
    return self;
  }
  
  self.applySettings = function (target) {
    if (!target) return false;
    
    // reset all the settable values
    Object.keys(target).forEach(function(k) {
      elements_.controls[k][elements_.values[k].property] = target[k];
    });
    
    return true;
  };
  
  self.getCurrent = function () {
    return Object.keys(initial_).reduce(function(p,c) {
      p[c] = elements_.controls[c][elements_.values[c].property]
      return p;
    },{});
  };
  /**
  *this creates the elements
  * @return {Elementer} self
  */
  self.build = function() {
    // in case just using default
    classes_ = classes_ || defClasses_;
    // check we have all needed
    if (!detail_ || !layout_ || !container_ || !root_) {
      throw 'a container, detail, root and layout are all required'
    }
    
    // this is the final result
    elements_ = {
      controls: {},
      pages: {},
      clicked: {},
      values:{}
    };
    
    // this is the computed styles etc.
    initial_ = {};
    
    // clear out the container
    container_.innerHTML = "";
    
    // short cut
    var ea = DomUtils.addElem;
    
    // do the root
    doLayout(root_, layout_.settings.root, layout_, detail_);
    // do the others
    Object.keys(layout_.pages).forEach(function(k) {
      
      if (k !== layout_.settings.root) {
        doLayout(container_, k, layout_, detail_);
      }
    });
    
    // set the initial visibility state
    var rt = layout_.settings.root;
    var onEnter = layout_.pages[rt].on ? layout_.pages[rt].on.enter : null;
    showThis(elements_.pages[rt], onEnter);
    
    return self;
    
    function doLayout(parent, branchName, layout, details) {
      
      // working on this layout
      var lob = layout.pages[branchName];
      
      // merge with any specific classes for this layout page
      var ec = Utils.vanMerge([classes_, lob.classes]);
      var es = Utils.vanMerge ([defStyles_ , lob.styles  || {}]);
      
      // the container for this layout
      var dv = ea(parent, "div", "", ec.branch);
      dv.id = layout.settings.prefix + "-" + branchName;
      
      elements_.pages[branchName] = dv;
      
      function backListener (elm) {
        elm.addEventListener('click', function(e) {
          
          // do exit processing
          var onExit = layout_.pages[branchName].on ? layout_.pages[branchName].on.exit : null;
          if (onExit) {
            onExit(self, branchName);
          }
          
          // do entry to the new page processing
          var elb = elements_.clicked[branchName];
          var onEnter = layout_.pages[elb.branchName].on ? layout_.pages[elb.branchName].on.enter : null;
          showThis(elb.element, onEnter);
        });
      }
      
      // prev icon - hide this and go back to whoever called
      if (ec.nav.prevIcon) {
        
        var dvp = ea(dv, "div", "", ec.backLabel, es.backLabel);
        var backIcon = ea(dvp, "span", ec.nav.prevIcon, ec.icon, es.icon);
        ea(dvp, "span", "Back to ???", ec.backLabel, es.backLabel).id = layout.settings.prefix + "-" + branchName + "-backcomment";
        backListener (dvp);
        
      }
      // use a table to lay out
      var tab = ea(dv, "table", "", ec.table, es.table);
      // the section title
      var tr = ea(tab, "tr", "", ec.tr, es.tr);
      
      if (ec.nav.showTitle) {
        
        var td = ea(tr, "td", "", ec.td, es.td);
        td.colSpan = 3;
        ea(td, "span", DomUtils.fillLabel(lob.label), ec.title, es.title);
      }
      
      lob.items.forEach(function(d) {
        if (layout.pages[d]) {
          // its a reference to another section
          
          var ob = layout.pages[d];
          // bring in any override classes
          var fc = Utils.vanMerge([ec, ob.classes]);
          var fs = Utils.vanMerge([es, ob.styles]);
          var tr = ea(tab, "tr", "", fc.tr, fc.nav.nextIcon ? fs.navCursor : fs.tr);
          
          // the icon
          
          if (ob.icon) {
            var td = ea(tr, "td", "", fc.tdIcon, fs.tdIcon);
            ea(td, "i", ob.icon, fc.icon, fs.icon);
          }
          
          // the label
          var td = ea(tr, "td", "", fc.tdLabel, fs.tdLabel);
          var label = ob.label ? ea(td, "label", DomUtils.fillLabel(ob.label), fc.subhead, fc.nav.nextIcon ? fs.navCursor : fs.subhead) : null;
          if (!ob.icon) {
            td.colSpan = 2;
          }
          
          
          function clickPointer (elem , itemName, brName ) {
            elem.addEventListener ('click', function () {
              if (!elements_.clicked[itemName] || itemName !== layout.settings.root) {
                elements_.clicked[itemName] = {
                  element: dv,
                  branchName: brName
                }
                var backComment = DomUtils.elem(layout.settings.prefix + "-" + d + "-backcomment");
                if (backComment) {
                  var lb = DomUtils.fillLabel(layout_.pages[brName].label);
                  backComment.innerHTML = "Back to " + lb ;
                }
              }
              var onEnter = layout_.pages[itemName].on ? layout_.pages[itemName].on.enter : null;
              showThis(layout.settings.prefix + "-" + itemName, onEnter);
            });
          }
          
          // add navigation to next level
          if (fc.nav.nextIcon) {
            var td = ea(tr, "td", "", fc.tdNextIcon, fs.tdNextIcon);
            td.colSpan = 2;
            ea(td, "i", fc.nav.nextIcon, fc.icon, fs.icon);
            clickPointer (tr,d, branchName);
          }
          else {
            var td = ea(tr, "td", "", fc.tdIcon, fs.tdIcon);
          }
        } else {
          // it should be some real stuff
          
          if (!details[d]) {
            throw d + ' layout reference not found in details';
          }
          if (details[d].template && !details[details[d].template]) {
            throw 'template ' + details[d].template + ' not found';
          }
          var ob = Utils.vanMerge([details[details[d].template], details[d]]);
          
          var fc = Utils.vanMerge([ec, ob.classes]);
          var fs = Utils.vanMerge([es, ob.styles]);
          
          // could be after the table
          if (ob.custom && ob.custom.outside) {
            var tr = ea(dv , "div", "", fc.tr, fs.tr);
            // the element container
            var td = ea(tr, "div", "", fc.tdElement, fs.tdElement); 
          }
          
          else {
            var tr = ea(tab, "tr", "", fc.tr, fs.tr);
           
            
            // the icon is the first column
            if (ob.icon) {
              var td = ea(tr, "td", "", fc.tdIcon, fs.tdIcon);
              ea(td, "i", ob.icon, fc.icon);
            }
            
            // now the label
            var label = null;
            if (ob.label) {
              var td = ea(tr, "td", "", fc.tdLabel, fs.tdLabel);
              var label =  ea(td, "label", DomUtils.fillLabel(ob.label), fc.label, fs.label) ;
              if (!ob.icon) td.colSpan = 2;
              if (!ob.tag && !ob.icon) td.colSpan = 4;
            }
            
            // the element.. if there's a tag we'll need a space for it
            if (ob.tag) {
              var td = ea(tr, "td", "", fc.tdElement, fs.tdElement);
            }

            
          }
          
          // now create an element
          var elemCancel = null,elem = null;
          if (ob.tag) {
            if (!(ob.custom && ob.custom.cancelOnly)) {
              var ediv = ea(td, "span", "", fc.elementContainer, fs.elementContainer);
              var elem = ea(ediv, ob.tag, "", fc.element, fs.element);
              elem.id = dv.id + "-" + d + "-elem";
              if (label) label['for'] = elem.id;
            }
            // there may be a cancel button needed
            if (ob.custom && ob.custom.cancelButton) {
              var ediv = ea (tr, "span", "", fc.elementContainer , fs.elementContainer);
              var elemCancel = ea (ediv , ob.tag , "", fc.cancel  , fs.cancel ); 
              elemCancel.id = dv.id + "-" + d + "-elem" + "-cancel";
              if (ob.custom && ob.custom.backListener) {
                backListener (elemCancel);
              }
            }
            // this should only apply to selects
            // but i'll leave it unchecked and just do it anyway
            if (ob.options && elem){
              ob.options.forEach(function(g){
                ea (elem,"option",g,fc.option,fs.option).value = g;
              });
            }
            
            
            if (ob.properties && elem) {
              Object.keys(ob.properties).forEach(function(e) {
                // now its possible that the propertty doesnt exist for every browser
                // for example input type="color" will throw exceptin
                // when running on excel 2016 sidebar so just pass on error with a console.log
                try {
                  elem[e] = ob.properties[e];
                }
                catch (err) {
                  console.log(err + ':continuing and ignoring');
                }
              });

            }
            
            if (elemCancel){
              elemCancel.innerHTML = ob.custom && ob.custom.cancelText ? ob.custom.cancelText : "Cancel";
            }
            
            if (elem && ob.values && ob.values.property) {
              elem[ob.values.property] = ob.values.value;
              elements_.values[d] = ob.values;
              if(ob.values.resetable) {
                initial_[d] = ob.values.value;
              }
            }
            // now apply any onchange/ click etc.
            if (ob.on && elem) {
              Object.keys (ob.on).forEach(function (o) {
                elem.addEventListener (o , function (e) {
                  ob.on[o] (self , branchName , ob , e);
                });
              });
            }

            elements_.controls[d] = elem || elemCancel;
          }
          
        }
      });
      standard_ = Utils.clone(initial_);
      return dv;
      
    }
    
    function showThis(keep, onEnter) {
      var dh = DomUtils.hide,
          de = DomUtils.elem,
          ep = elements_.pages;
      
      // ensure all other pages are hidden
      Object.keys(ep).forEach(function(p) {
        dh(ep[p], true, classes_.hide);
        
      });
      
      // if the active page is the root then show the main too.
      if (main_) {
        var showMain = de(keep).id === ep[layout_.settings.root].id;
        dh(main_, !showMain, classes_.hide);
      }
      
      // do any on enter 
      if (onEnter) {
        onEnter(self, de(keep).id.match(/-(.+)$/)[1])
      }
      
      // show the active page
      dh(keep, false, classes_.hide);
    }
    
  };
  
};