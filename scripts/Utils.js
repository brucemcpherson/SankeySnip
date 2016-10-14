var Utils = (function (ns) {

  /**
 * create a column label for sheet address, starting at 1 = A, 27 = AA etc..
 * @param {number} columnNumber the column number
 * @return {string} the address label 
 */
  ns.columnLabelMaker = function (columnNumber, s) {
    s = String.fromCharCode(((columnNumber - 1) % 26) + 'A'.charCodeAt(0)) + (s || '');
    return columnNumber > 26 ? columnLabelMaker(Math.floor((columnNumber - 1) / 26), s) : s;
  };
  /**
  * get the stack
  * @return {string} the stack trace
  */
  ns.errorStack = function (e) {
    try {
      // throw a fake error
      throw new Error();  //x is undefined and will fail under use struct- ths will provoke an error so i can get the call stack
    }
    catch (err) {
      return 'Error:' + e + '\n' + err.stack.split('\n').slice(1).join('\n');
    }
  };

  /**
   * get an array of unique values
   * @param {[*]} a the array
   * @param {function} [func] return true if two items are equal
   * @return {[*]} the unique items
   */
  ns.unique = function (a, func) {
    return a.filter(function (d) {
      return a.reduce(function (p, c) {
        if ((func && func(d, c)) || (!func && d === c)) {
          p++;
        }
        return p;
      }, 0) === 1;
    })
  };

  ns.isSameAs = function (a, b) {
    return ns.keyDigest(a) === ns.keyDigest(b);
  };
  /**
 * @param {[*]} arguments unspecified number and type of args
 * @return {string} a digest of the arguments to use as a key
 */
  ns.keyDigest = function () {
    // conver args to an array and digest them
    return Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, Array.prototype.slice.call(arguments).map(function (d) {
        return (Object(d) === d)  ? JSON.stringify(d) : (ns.isUndefined(d) ? 'undefined' : d.toString());
      }).join("-")));
  };
  /**
   * this is clone that will really be an extend
   * @param {object} cloneThis
   * @return {object} a clone
   */
  ns.clone = function (cloneThis) {
    return ns.vanExtend({}, cloneThis);
  }
  /**
  * recursively extend an object with other objects
  * @param {[object]} obs the array of objects to be merged
  * @return {object} the extended object
  */
  ns.vanMerge = function (obs) {
    return (obs || []).reduce(function (p, c) {
      return ns.vanExtend(p, c);
    }, {});
  };
  /**
  * recursively extend a single obbject with another 
  * @param {object} result the object to be extended
  * @param {object} opt the object to extend by
  * @return {object} the extended object
  */
  ns.vanExtend = function (result, opt) {
    result = result || {};
    opt = opt || {};
    return Object.keys(opt).reduce(function (p, c) {
      // if its an object
      if (ns.isVanObject(opt[c])) {
        p[c] = ns.vanExtend(p[c], opt[c]);
      } else {
        p[c] = opt[c];
      }
      return p;
    }, result);
  };
  /**
  * use a default value if undefined
  * @param {*} value the value to test
  * @param {*} defValue use this one if undefined
  * @return {*} the new value
  */
  ns.fixDef = function (value, defValue) {
    return typeof value === typeof undefined ? defValue : value;
  };
  /**
  * see if something is undefined
  * @param {*} value the value to check
  * @return {bool} whether it was undefined
  */
  ns.isUndefined = function (value) {
    return typeof value === typeof undefined;
  };
  /**
  * simple test for an object type
  * @param {*} the thing to test
  * @return {bool} whether it was an object
  */
  ns.isVanObject = function (value) {
    return typeof value === "object" && !Array.isArray(value);
  };
   /**
  * recursive rateLimitExpBackoff()
  * @param {function} callBack some function to call that might return rate limit exception
  * @param {object} options properties as below
  * @param {number} [attempts=1] optional the attempt number of this instance - usually only used recursively and not user supplied
  * @param {number} [options.sleepFor=750] optional amount of time to sleep for on the first failure in missliseconds
  * @param {number} [options.maxAttempts=5] optional maximum number of amounts to try
  * @param {boolean} [options.logAttempts=true] log re-attempts to Logger
  * @param {function} [options.checker] function to check whether error is retryable
  * @param {function} [options.lookahead] function to check response and force retry (passes response,attemprs)
  * @return {*} results of the callback 
  */
  
  ns.expBackoff = function ( callBack,options,attempts) {
    
    //sleepFor = Math.abs(options.sleepFor ||
    
    options = options || {};
    optionsDefault = { 
      sleepFor:  750,
      maxAttempts:5,                  
      checker:errorQualifies,
      logAttempts:true
    }
    
    // mixin
    Object.keys(optionsDefault).forEach(function(k) {
      if (!options.hasOwnProperty(k)) {
        options[k] = optionsDefault[k];
      }
    });
    
    
    // for recursion
    attempts = attempts || 1;
    
    // make sure that the checker is really a function
    if (typeof(options.checker) !== "function") {
      throw ns.errorStack("if you specify a checker it must be a function");
    }
    
    // check properly constructed
    if (!callBack || typeof(callBack) !== "function") {
      throw ns.errorStack("you need to specify a function for rateLimitBackoff to execute");
    }
    
    function waitABit (theErr) {
      
      //give up?
      if (attempts > options.maxAttempts) {
        throw errorStack(theErr + " (tried backing off " + (attempts-1) + " times");
      }
      else {
        // wait for some amount of time based on how many times we've tried plus a small random bit to avoid races
        Utilities.sleep (
          Math.pow(2,attempts)*options.sleepFor + 
          Math.round(Math.random() * options.sleepFor)
        );
        
      }
    }
    
    // try to execute it
    try {
      var response = callBack(options, attempts);
      
      // maybe not throw an error but is problem nevertheless
      if (options.lookahead && options.lookahead(response,attempts)) {
        if(options.logAttempts) { 
          Logger.log("backoff lookahead:" + attempts);
        }
        waitABit('lookahead:');
        return ns.expBackoff ( callBack, options, attempts+1) ;
        
      }
      return response;
    }
    
    // there was an error
    catch(err) {
      
      if(options.logAttempts) { 
        Logger.log("backoff " + attempts + ":" +err);
      }
      
      // failed due to rate limiting?
      if (options.checker(err)) {
        waitABit(err);
        return ns.expBackoff ( callBack, options, attempts+1) ;
      }
      else {
        // some other error
        throw ns.errorStack(err);
      }
    }
    
    
  }
  
  /**
  * get the stack
  * @param {Error} e the error
  * @return {string} the stack trace
  */
  ns.errorStack = function  (e) {
    try {
      // throw a fake error
      throw new Error();  //x is undefined and will fail under use struct- ths will provoke an error so i can get the call stack
    }
    catch(err) {
      return 'Error:' + e + '\n' + err.stack.split('\n').slice(1).join('\n');
    }
  }
  
  
  // default checker
  function errorQualifies (errorText) {
    
    return ["Exception: Service invoked too many times",
            "Exception: Rate Limit Exceeded",
            "Exception: Quota Error: User Rate Limit Exceeded",
            "Service error:",
            "Exception: Service error:", 
            "Exception: User rate limit exceeded",
            "Exception: Internal error. Please try again.",
            "Exception: Cannot execute AddColumn because another task",
            "Service invoked too many times in a short time:",
            "Exception: Internal error.",
            "User Rate Limit Exceeded",
            "Exception: ???????? ?????: DriveApp.",
            "Exception: Address unavailable"
           ]
    .some(function(e){
      return  errorText.toString().slice(0,e.length) == e  ;
    }) ;
    
  };
  

  return ns;
})(Utils || {});
