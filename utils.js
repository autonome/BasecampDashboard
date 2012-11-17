/*
// helper for seaching bugzilla
function bugSearch(type) {
  this.type = type
}
bugSearch.prototype = {
  fetch: function(options, callback) {
    var url = (this.type == 'bug') ? '/bug' : '/count';
    Bugzilla.ajax({
      url: url,
      data: options,
      success: function(data) {
        callback(data.data || data.bugs);
      }
    });
  }
}

// helper for searching github
function issueSearch() {
}
issueSearch.prototype = {
  fetch: function(options, callback) {
    Github.user = 'mozilla-b2g'
    Github.repo = 'gaia'

    var results = []
    options.page = 1

    function driver() {
      Github.search(options, function(someResults) {
        if (someResults.length) {
          results = results.concat(someResults)
          options.page++
          setTimeout(driver, 0)
        }
        else
          callback(results)
      })
    }
    driver()
  }
}
*/

// window.JSONP - http://oscargodson.com/posts/unmasking-jsonp.html
(function(window, undefined) {
  var JSONP = function(url, method, callback){
    url = url || '';
    method = method || '';
    callback = callback || function(){};

    if(typeof method == 'function'){
      callback = method;
      method = 'callback';
    }

    var generatedFunction = 'jsonp'+Math.round(Math.random()*1000001);

    window[generatedFunction] = function(json){
      callback(json);
      delete window[generatedFunction];
    };

    if(url.indexOf('?') === -1){ url = url+'?'; }
    else{ url = url+'&'; }

    var jsonpScript = document.createElement('script');
    jsonpScript.setAttribute("src", url+method+'='+generatedFunction);
    document.getElementsByTagName("head")[0].appendChild(jsonpScript);
  }
  window.JSONP = JSONP;
})(window)

// Google Spreadsheet API helper
function getGoogleSpreadsheetData(url, callback) {
  JSONP(url, function gCallback(data) {
    var set = [];
    for (var i in data.feed.entry) {
      var row = data.feed.entry[i]['gs$cell'].row;
      var col = data.feed.entry[i]['gs$cell'].col;
      var txt = data.feed.entry[i]['gs$cell']['$t'];
      // ???
      if (!set[row])
        set[row] = [];
      set[row][col] = txt;
    }
    callback(set)
  })
}

// Google Spreadsheet API helper
function getGoogleSpreadsheetCellValue(url, row, col, callback) {
  getGoogleSpreadsheetData(url, function(data) {
    var val = null
    if (data[row] && data[row][col])
      val = data[row][col]
    callback(val)
  })
}
