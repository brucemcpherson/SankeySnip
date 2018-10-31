
/**
* simulate Watcher with apps script
* various changes server side can be watched for server side
* and resolved client side
* @constructor ClientWatcher
*/
var ClientWatcher = (function (ns) {
  
  var watchers_  = {},startTime_=0, pack_;
  
  // now clean it
  function cleanTheCamel_ (cleanThis) {
    return typeof cleanThis === "string" ? cleanThis.slice(0,1).toUpperCase() + cleanThis.slice(1) : cleanThis;
  }
  
  /**
  * return {object} all current Watchers, the id is the key
  */
  ns.getWatchers = function () {
    return watchers_;
  };
  
  /**
  * add a Watcher
  * @param {object} options what to watch
  * @param {string} [sheet] the sheet to watch if missing, watch the active sheet
  * @param {string} [range] the range to watch - if missing, watch the whole sheet 
  * @param {string} [property=Data] matches getData, getBackground
  * @param {TYPES} [type=SHEET] the type of Watcher
  * @param {number} pollFrequency in ms, how often to poll
  * @return {ClientWatcher.Watcher} the Watcher
  */
  ns.addWatcher = function (options) {
    
    // default settings for a Watcher request
    var watch = Utils.vanMerge ([{
      pollFrequency:2500,                             // if this is 0, then polling is not done, and it needs self.poke()
      id: '' ,                                        // Watcher id
      pollVisibleOnly:true,                           // just poll if the page is actually visible
      rules: {
        active: true,                                 // whether to watch for changes to active
        data: true,                                   // whether to watch for data content changes
        sheets:true                                   // watch for changes in number/names of sheets
      },
      checksum:{
        active:"",                                    // the active checksum last time polled
        data:"",                                      // the data checksum last time polled
        sheets:""                                     // the sheets in the workbook last time polled
      },                                
      domain: {
        app: "Sheets",                                // for now only Sheets are supported                     
        scope: "Sheet",                               // Sheet, Active or Range - sheet will watch the datarange
        range: "",                                    // if range, specifiy a range to watch
        sheet: "",                                    // a sheet name - if not given, the active sheet will be used
        property:"Values",                            // Values,Backgrounds etc...
        fiddler:true,                                 // whether to create a fiddler to mnipulate data (ignored for nondata property)
        applyFilters:false                            // whether to apply filters
      }
    },options || {}]);
    
    // tidy up the parameter cases
    Object.keys(watch.domain).forEach(function(k) {
      watch.domain[k] = cleanTheCamel_ (watch.domain[k]);
    });
    watch.id = watch.id || ('w' + Object.keys(watchers_).length);
    
    // add to the registry
    return (watchers_[watch.id] = ns.newWatcher(watch));
  };
  
  /**
  * remove a Watcher
  * @param {string||object} id the id or object
  * @return {ClientWatcher} self
  */
  ns.removeWatcher = function (watcher) {
    var id = Utils.isVanObject(watcher) ? watcher.id : watcher;
    if (!id || watchers_[id]) {
      throw 'Watcher ' + id + ' doesnt exists - cannot remove';
    }
    watchers_[id].stop();
    watchers_[id] = null;
    return ns;
  };
  /**
  * return a specifc Watcher
  * @param {string} id the Watcher
  * @return {ClientWatcher.watcher} the Watcher
  */
  ns.getWatcher = function (id) {
    return watchers_[id];
  };
  
  /**
  * used to create a new Watcher object
  * @return {ClientWatcher.Watcher}
  */
  ns.newWatcher = function (watch) {
    return new ns.Watcher(watch);
  }
  /**
  * this is a Watcher object
  * @param {object} watch the Watcher resource
  * @return {ClientWatcher.Watcher}
  */
  ns.Watcher = function (watch) {
    
    var self = this;
    var current_ = {
      active:null,
      data:null,
      dataSource:null,
      filterMap:null
    } ;
    var watch_ = watch, stopped_ = false;    
    
    // this monitors requests
    var status_ = {
      serial:0,      // the serial number of the poll
      requested:0,   // time  requested
      responded:0,    // time responded
      errors:0 ,      // number of errors
      hits:0,         // how many times a change was detected
      totalWaiting:0,  //  time spent waiting for server response
      idle:0          // no of times we didnt bother polling
    };
    
    self.start = function () {
      // get started .. first time it will run immediately
      return nextPolling_(!status_.serial);
    };
    
    self.restart = function () {
      stopped_ = false;
      return self;
    }
    
    self.stop = function () {
      stopped_ = true;
      return self;
    }
    
    // force a redo 
    self.poke = function () {
      Object.keys(watch_.checksum).forEach(function(d) {
        watch_.checksum[d] = "";
      });
    }
    self.getWatching = function () {
      return watch_;
    }
    /**
    * if you want the current data
    * @return {object} the current data
    */
    self.getCurrent = function () {
      return current_;
    };
    
    /**
    * if you want the latest status
    * @return {object} status
    */
    self.getStatus = function () {
      return status_;
    };
    
    /**
    * do the next polling after waiting some time
    * @return {Promise}
    */
    function nextPolling_ (immediate) {
      return new Promise(function (resolve,reject) {
        setTimeout ( function () {
          self.poll()
          .then(function(pack) {
            resolve(pack);
          })
          ['catch'](function(pack) {
            reject(pack);
          })
        }, immediate ? tweakWaitTime(25): tweakWaitTime(watch_.pollFrequency));
      });
      
      // just to avoid everybody always polling at the same time
      function tweakWaitTime(t) {
        t += (t*Math.random()/5*(Math.random()>.5 ? 1 : -1));
        // now we need to tweak the start time to avoid a timing problem in htmlservice 
        // .. never start one within 750ms of the last one.
        var now = new Date().getTime();
        startTime_ = Math.max(now + t, startTime_+750);
        return startTime_ - now;
      }
      
    }
    
    self.getPack = function () {
      return pack_;
    };
    
    // convenience function to endlessly poll and callback on any changes
    self.watch = function (callback) {
      if (typeof callback !== "function") {
        throw 'callback to .watch() must be a function';
      }
      self.start()
      .then (function(pack) {
        
        
        if (pack.changed.active || pack.changed.data || pack.changed.sheets) {
          callback(current_, pack, self);
        }
        
        // just keep going round recusrsively
        if (!stopped_) {
          self.watch(callback);
        }
      })
      ['catch'](function(err) {
        // this will have been dealt with further up, but we still need to repoll
        if (!stopped_ && watch_.pollFrequency) {
          self.watch(callback);
        }
      });
    };
    
    /**
    * this returns a promise
    * which will be resolved when the server sends back changed data
    * and rejected when there is no change
    * @return {Promise}
    */
    self.poll = function () {
      
      status_.requested = new Date().getTime();
      status_.serial ++; 
      
      // promises dont have finally() yet.
      function finallyActions  () {
        status_.responded = new Date().getTime();
        status_.totalWaiting += (status_.responded - status_.requested);
      }
      
      // we can get rejected from a few paces, so just pul this out
      function rejectActions  (reject,err) {
        console.log (err);
        status_.errors++;
        finallyActions();
        reject(err);
      }
      
      return pollWork();
      
      // call the co-operating server function
      function pollWork () {
        return new Promise(function (resolve, reject) {
          
          // check for visibility.. if not visible, then don't bother polling
          if (pack_ && watch_.pollVisibleOnly && !ifvisible.now() ) {
            status_.idle++;
            finallyActions();
            resolve(pack_);
          }
          else {
            
            Provoke.run ("ServerWatcher", "poll", watch_)
            .then (
              function (pack) {
                // save this for interest
                pack_ = pack;
                current_.dataSource = pack_.dataSource;
                
                // if there's been some changes to data then store it
                if (pack.data) {
                  
                  current_.filterMap = pack_.filterMap;
                  if (watch_.domain.fiddler && watch_.domain.property === "Values") {
                    // it may fail because data is in midde of being updated
                    // but that's - it'll get it next time.
                    try {
                      current_.fiddler = new Fiddler().setValues(pack.data);
                    }
                    catch (err) {
                      // dont want to count this as a valid piece of data yet
                      // so we'll pass on this poll result and treat it as a reject
                      
                      return rejectActions(reject,err);
                    }
                  }
                  watch_.checksum.data = pack.checksum.data;
                  current_.data = pack.data;
                }
                
                
                
                // if there's been some changes to active positions
                if(pack.active) {
                  current_.active = pack.active;
                  watch_.checksum.active = pack.checksum.active;
                }
                
                // if there's been some changes to sheets then store it
                if (pack.sheets) {
                  current_.sheets = pack.sheets;
                  watch_.checksum.sheets = pack.checksum.sheets;
                }
                
                if (pack.data || pack.active || pack.sheets) {
                  status_.hits++;
                }
                finallyActions();
                resolve (pack);
              })
            ['catch'](function (err) {
              // sometimes there will be network errors which can generally be ignored..
              rejectActions (reject, err);
            });
          }
        });
        
      }
    };
  };
  
  return ns;
})(ClientWatcher || {});
