var framework_version = '7.4.4';
var Tumblr = unsafeWindow.Tumblr;

function getBridgeError() {
  return {};
}

function GM_flushStorage(callback) {
  GM_deleteAllValues(callback);
}

function GM_deleteAllValues(callback) {
  AddonStorage.resetAll();
  if (callback) {
    callback();
  }
}

function GM_getValue(name, defaultValue) {
  return '' + AddonStorage.get(name, defaultValue);
}

function GM_deleteValue(name) {
  AddonStorage.reset(name);
}

function GM_setValue(name, value) {
  AddonStorage.set(name, '' + value);
}

function GM_log(message) {
  console.log(message);
}

function GM_openInTab(url) {
  return window.open(url, '_blank');
}

function GM_listValues() {
  return AddonStorage.listKeys();
}

// Implement an only-once delivery mechanism for CORS requests
var corsCallbacks = {};

self.port.on('cors-update', function(data) {
  var callback = corsCallbacks[data.requestId];
  if (!callback) {
    return;
  }
  if (data.type === 'load') {
    callback.onload(data.response);
  } else {
    callback.onerror();
  }
  corsCallbacks[data.requestId] = null;
});

function GM_xmlhttpRequest(settings) {
  var requestId = Math.floor(Math.random() * 4294967296);

  if (settings.url.indexOf('tumblr.com/svc/') >= 0) {
    settings.url = settings.url.replace(/^http:\/\//, 'https://');
  }

  var headers = settings.headers || {};
  var data = null;

  if (settings.method === 'POST') {
    if (settings.json) {
      headers['Content-Type'] = 'application/json';
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    data = settings.data;
  }


  self.port.emit('cors-request', {
    requestId: requestId,
    method: settings.method,
    url: settings.url,
    data: data,
    headers: headers
  });

  corsCallbacks[requestId] = {
    onload: settings.onload,
    onerror: settings.onerror
  };
}
