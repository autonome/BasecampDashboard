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
    })
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

// window.JSONP - http://oscargodson.com/posts/unmasking-jsonp.html
//(function(window, undefined) {
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
//})(window)

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

function packStackAndRack(key, callback, expirationSeconds) {
  asyncStorage.getItem(key, function(result) {
    callback(result)
  })
}

// Useless, since can't get login name from un-authenticated API
// calls, only real_name and name, neither of which are query-able
// via that same API.
function getUsersOfBugs(bugQueryResults) {
  var names = [] 
  var people = []
  bugQueryResults.forEach(function(bug, i) {
    if (names.indexOf(bug.assigned_to.name) == -1) {
      people.push(bug.assigned_to)
      names.push(bug.assigned_to.name)
    }
  })
  return people;
}

// only works if authenticated
function getEmailForRealName(realName, callback) {
  Bugzilla.ajax({
    url: "/user",
    data: {
      'match': realName
    },
    success: function(data) {
      console.log('matches', data)
    },
    error: function(err) {
      console.log('user query err', err)
    }
  })
}

function fetchAndCacheAllOpenBlockers(searchOpts, callback) {
  // update user feedback to indicate progress
  self.emit('feedback', 'Searching Bugzilla...')

  var results = []

  var searchOpenBasecampBlockers = {
    'bug_status': ['NEW', 'UNCONFIRMED', 'READY', 'ASSIGNED', 'REOPENED'],
    'field0-0-0': 'cf_blocking_basecamp',
    'type0-0-0': 'equals',
    'value0-0-0': '+'
  }
  new bugSearch('bug').fetch(searchOpenBasecampBlockers, function(results) {
    asyncStorage.setItem('lastUpdated', new Date(), function(){})
    asyncStorage.setItem('results', results, function(){})

    self.emit('feedback', '')
    self.emit('display', {results: results})
  })
}
