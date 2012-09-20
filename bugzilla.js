var Bugzilla = {
  BASE_URL: "https://api-dev.bugzilla.mozilla.org/latest",
  BASE_UI_URL: "https://bugzilla.mozilla.org",
  DEFAULT_OPTIONS: {
    method: "GET"
  },
  getShowBugURL: function Bugzilla_getShowBugURL(id) {
    return this.BASE_UI_URL + "/show_bug.cgi?id=" + id;
  },
  queryString: function Bugzilla_queryString(data) {
    var parts = [];
    for (name in data) {
      var values = data[name];
      if (!values.forEach)
        values = [values];
      values.forEach(
        function(value) {
          parts.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
        });
    }
    return parts.join("&");
  },
  ajax: function Bugzilla_ajax(options) {
    var newOptions = {__proto__: this.DEFAULT_OPTIONS};
    for (name in options)
      newOptions[name] = options[name];
    options = newOptions;

    function onLoad() {
      var response = JSON.parse(xhr.responseText);
      if (!response.error)
        options.success(response);
      else if (options.error)
        options.error(response.error);
    }

    var xhr = options.xhr ? options.xhr : new XMLHttpRequest();
    var url = this.BASE_URL + options.url;

    var data = null;
    if (options.data) {
      if (options.method == "GET")
        url = url + "?" + this.queryString(options.data);
      else {
        if (options.data.username && options.data.password)
          url = url + "?" + this.queryString({ username: options.data.username, password: options.data.password});
        data = JSON.stringify(options.data);
      }
    }
    xhr.open(options.method, url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener("load", onLoad, false);
    xhr.send(data);
    return xhr;
  },
  getBug: function Bugzilla_getBug(id, cb) {
    return this.ajax({url: "/bug/" + id,
                      success: cb});
  },
  search: function Bugzilla_search(query, cb) {
    return this.ajax({url: "/bug",
                      data: query,
                      success: cb});
  }
};
