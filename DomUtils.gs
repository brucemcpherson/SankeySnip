var DomUtils = (function(ns) {
  
  
  ns.getGroup = function (groupName) {
    return Array.prototype.slice.apply(document.getElementsByName (groupName));  
  }
  
  ns.getOptions = function (selectElem) {
    var sel = ns.elem (selectElem);
    return (Array.isArray(sel.options) ? sel.options : []).map(function (d) {
      return d.text;
    });
  } 
  
  ns.getChecked = function (groupName) {
    
    var filt = (document.getElementsByName (groupName) || []).filter(function(d) {
      return d.checked;
    });
    return filt.length ? filt[0] : null;
  }
  
  ns.elem = function(name) {
    if (typeof name === 'string') {
      return document.getElementById(name.replace(/^#/, ""));
    } else {
      return name;
    }
  };
  ns.addStyles = function(elem, styles) {
    if (styles) {
      styles.toString().split(";").forEach(function(d) {
        if (d) {
          var s = d.split(":");
          
          if (s.length !== 2) {
            throw "invalid style " + d;
          }
          elem.style[s[0]] = s[1];
        }
      });
    }
    return elem;
  };
  ns.addElem = function(parent, type, text, className, styles) {
    parent = ns.elem(parent);
    var elem = document.createElement(type);
    parent.appendChild(elem);
    elem.innerHTML = typeof text === typeof undefined ? '' : text;
    if (className) {
      elem.className += (" " + className);
    }
    return ns.addStyles(elem, styles);
    
  };
  
  ns.addClass = function(element, className) {
    element = ns.elem(element);
    if (!element.classList.contains(className)) {
      element.classList.add(className);
    }
    return element;
  };
    
  /**
  * apply a class to a div
  * @param {element} element
  * @param {boolean} addClass whether to remove or add
  * @param {string} [className] the class
  * @return {element} the div
  */
  ns.applyClass = function(element, addClass, className) {
    return ns.hide (element , addClass , className)
  };
  /**
  * apply a class to a div
  * @param {element} element
  * @param {boolean} addClass whether to remove or add
  * @param {string} [className] the class
  * @return {element} the div
  */
  ns.hide = function(element, addClass, className) {
    element = ns.elem(element);
    
    className = className || "mui--hide";
    // will only happen if polyfill not loaded..
    if (!element.classList.add) {
      throw 'classlist not supported';
    }
    var q = addClass ? ns.addClass(element, className) : element.classList.remove(className);
    return element;
  };
  
  /**
  * flip a div
  * @param {element} element
  * @param {string} [className] the class
  * @return {element} the div
  */
  ns.flip = function(element, className) {
    element = ns.elem(element);
    element.classList.toggle(className || "mui--hide");
    return element;
  };
  
  /**
  * is hidden
  * @param {element} element
  * @param {string} [className]
  * @return {boolean} is it hidden
  */
  ns.isHidden = function(element, className) {
    element = ns.elem(element);
    return element.classList.contains(className || "mui--hide");
  };
  
  /**
  * gets context of elem if text is preceded by # and the elem exists
  *@param {string} label the label or elem id to get
  *@return {string} the result
  */
  ns.fillLabel = function(label) {
    if (label && label.toString().slice(0, 1) === '#') {
      var elem = ns.elem(label);
      return elem ? elem.innerHTML : label;
    }
    return label;
    
  }
  return ns;
})(DomUtils || {});
