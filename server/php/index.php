      'use strict';
      var origin = /^https:\/\/https://ssl.srvif.com:7404/,
        target = new RegExp('^(http(s)?:)?\\/\\/' + location.host + '\\/');
      $(window).on('message', function(e) {
      $(window).on('message', function (e) {
        e = e.originalEvent;
        var s = e.data,
          xhr = $.ajaxSettings.xhr(),
@@ -39,7 +39,7 @@
            'Target "' + e.data.url + '" does not match ' + target
          );
        }
        $(xhr.upload).on('progress', function(ev) {
        $(xhr.upload).on('progress', function (ev) {
          ev = ev.originalEvent;
          e.source.postMessage(
            {
@@ -53,17 +53,17 @@
            e.origin
          );
        });
        s.xhr = function() {
        s.xhr = function () {
          return xhr;
        };
        if (!(s.data instanceof Blob)) {
          f = new FormData();
          $.each(s.data, function(i, v) {
          $.each(s.data, function (i, v) {
            f.append(v.name, v.value);
          });
          s.data = f;
        }
        $.ajax(s).always(function(result, statusText, jqXHR) {
        $.ajax(s).always(function (result, statusText, jqXHR) {
          if (!jqXHR.done) {
            jqXHR = result;
            result = null;
          }
          e.source.postMessage(
            {
              id: s.id,
              status: jqXHR.status,
              statusText: statusText,
              result: result,
              headers: jqXHR.getAllResponseHeaders()
            },
            e.origin
          );
        });
      });
    </script>
  </body>
</html>
