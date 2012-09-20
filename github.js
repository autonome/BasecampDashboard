var Github = {
  user: '',
  repo: '',
  BASE_URL: "https://api.github.com",
  BASE_UI_URL: "https://github.com",
  DEFAULT_OPTIONS: {
    method: "GET"
  },
  getShowIssueURL: function Github_getShowIssueURL(id) {
    return this.BASE_UI_URL + "/" + this.user + "/" + this.repo + "/issues/" + id;
  },
  queryString: function Github_queryString(data) {
    var parts = [];
    for (name in data) {
      var values = data[name];
      if (!values.forEach)
        values = [values];
      values.forEach(function(value) {
        parts.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
      });
    }
    return parts.join("&");
  },
  ajax: function Github_ajax(options) {
    var newOptions = {__proto__: this.DEFAULT_OPTIONS};
    for (name in options)
      newOptions[name] = options[name];
    options = newOptions;

    var url = this.BASE_URL + options.url;

    var data = null;
    if (options.data) {
      if (options.method == "GET")
        url += "?" + this.queryString(options.data);
      else {
        if (options.data.username && options.data.password)
          url += "?" + this.queryString({ username: options.data.username, password: options.data.password});
        data = JSON.stringify(options.data);
      }
    }

    JSONP(url, function(response) {
      options.success(response.data);
    })
  },
  getIssue: function Github_getIssue(id, cb) {
    return this.ajax({url: "/repos/" + this.user + "/" + this.repo + "/issues/" + id,
                      success: cb});
  },
  search: function Github_search(query, cb) {
    return this.ajax({url: "/repos/" + this.user + "/" + this.repo + "/issues",
                      data: query,
                      success: cb});
  }
};


// window.JSONP(url, callback)
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
})(window);
