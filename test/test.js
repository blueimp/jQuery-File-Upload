/*
 * jQuery File Upload Test
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global beforeEach, afterEach, describe, it */
/* eslint-disable new-cap */

(function(expect, $) {
  'use strict';

  var canCreateBlob = !!window.dataURLtoBlob;
  // 80x60px GIF image (color black, base64 data):
  var b64DataGIF =
    'R0lGODdhUAA8AIABAAAAAP///ywAAAAAUAA8AAACS4SPqcvtD6' +
    'OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofE' +
    'ovGITCqXzKbzCY1Kp9Sq9YrNarfcrvcLDovH5PKsAAA7';
  var imageUrlGIF = 'data:image/gif;base64,' + b64DataGIF;
  var blobGIF = canCreateBlob && window.dataURLtoBlob(imageUrlGIF);

  // 2x1px JPEG (color white, with the Exif orientation flag set to 6 and the
  // IPTC ObjectName (2:5) set to 'objectname'):
  var b64DataJPEG =
    '/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAASUkqAAgAAAABABIBAwABAAAA' +
    'BgASAAAAAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAA8cAgUACm9iamVj' +
    'dG5hbWUA/9sAQwABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB' +
    'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/9sAQwEBAQEBAQEBAQEBAQEBAQEB' +
    'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB' +
    '/8AAEQgAAQACAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYH' +
    'CAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGh' +
    'CCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldY' +
    'WVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1' +
    'tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8B' +
    'AAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAEC' +
    'dwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBka' +
    'JicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWG' +
    'h4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ' +
    '2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/v4ooooA/9k=';
  var imageUrlJPEG = 'data:image/jpeg;base64,' + b64DataJPEG;
  var blobJPEG = canCreateBlob && window.dataURLtoBlob(imageUrlJPEG);

  var fileGIF, fileJPEG, files, items, eventObject;

  var uploadURL = '../server/php/';

  /**
   * Creates a fileupload form and adds it to the DOM
   *
   * @returns {object} jQuery node
   */
  function createFileuploadForm() {
    return $('<form><input type="file" name="files[]" multiple></form>')
      .prop({
        action: uploadURL,
        method: 'POST',
        enctype: 'multipart/form-data'
      })
      .css({ display: 'none' })
      .appendTo(document.body);
  }

  /**
   * Deletes all files from the upload server
   *
   * @param {Array} files Response files list
   * @param {Function} callback Callback function
   */
  function deleteFiles(files, callback) {
    $.when(
      files.map(function(file) {
        return $.ajax({
          type: file.deleteType,
          url: file.deleteUrl
        });
      })
    ).always(function() {
      callback();
    });
  }

  beforeEach(function() {
    fileGIF = new File([blobGIF], 'example.gif', { type: 'image/gif' });
    fileJPEG = new File([blobJPEG], 'example.jpg', { type: 'image/jpeg' });
    files = [fileGIF, fileJPEG];
    items = [
      {
        getAsFile: function() {
          return files[0];
        }
      },
      {
        getAsFile: function() {
          return files[1];
        }
      }
    ];
    eventObject = {
      originalEvent: {
        dataTransfer: { files: files, types: ['Files'] },
        clipboardData: { items: items }
      }
    };
  });

  afterEach(function(done) {
    $.getJSON(uploadURL).then(function(result) {
      deleteFiles(result.files, done);
    });
  });

  describe('Initialization', function() {
    var form;

    beforeEach(function() {
      form = createFileuploadForm();
    });

    afterEach(function() {
      form.remove();
    });

    it('widget', function() {
      form.fileupload();
      expect(form.data('blueimp-fileupload')).to.be.an('object');
    });

    it('file input', function() {
      form.fileupload();
      expect(form.fileupload('option', 'fileInput').length).to.equal(1);
    });

    it('drop zone', function() {
      form.fileupload();
      expect(form.fileupload('option', 'dropZone').length).to.equal(1);
    });

    it('paste zone', function() {
      form.fileupload({ pasteZone: document });
      expect(form.fileupload('option', 'pasteZone').length).to.equal(1);
    });

    it('data attributes', function() {
      form.attr('data-url', 'https://example.org');
      form.fileupload();
      expect(form.fileupload('option', 'url')).to.equal('https://example.org');
      expect(form.data('blueimp-fileupload')).to.be.an('object');
    });

    it('event listeners', function() {
      var eventsData = {};
      form.fileupload({
        autoUpload: false,
        pasteZone: document,
        dragover: function() {
          eventsData.dragover = true;
        },
        dragenter: function() {
          eventsData.dragenter = true;
        },
        dragleave: function() {
          eventsData.dragleave = true;
        },
        drop: function(e, data) {
          eventsData.drop = data;
        },
        paste: function(e, data) {
          eventsData.paste = data;
        },
        change: function() {
          eventsData.change = true;
        }
      });
      form
        .fileupload('option', 'fileInput')
        .trigger($.Event('change', eventObject));
      expect(eventsData.change).to.equal(true);
      form
        .fileupload('option', 'dropZone')
        .trigger($.Event('dragover', eventObject))
        .trigger($.Event('dragenter', eventObject))
        .trigger($.Event('dragleave', eventObject))
        .trigger($.Event('drop', eventObject));
      expect(eventsData.dragover).to.equal(true);
      expect(eventsData.dragenter).to.equal(true);
      expect(eventsData.dragleave).to.equal(true);
      expect(eventsData.drop.files).to.deep.equal(files);
      form
        .fileupload('option', 'pasteZone')
        .trigger($.Event('paste', eventObject));
      expect(eventsData.paste.files).to.deep.equal(files);
    });
  });

  describe('API', function() {
    var form;

    beforeEach(function() {
      form = createFileuploadForm().fileupload({
        dataType: 'json',
        autoUpload: false
      });
    });

    afterEach(function() {
      form.remove();
    });

    it('destroy', function() {
      var eventsData = {};
      form.fileupload('option', {
        pasteZone: document,
        dragover: function() {
          eventsData.dragover = true;
        },
        dragenter: function() {
          eventsData.dragenter = true;
        },
        dragleave: function() {
          eventsData.dragleave = true;
        },
        drop: function(e, data) {
          eventsData.drop = data;
        },
        paste: function(e, data) {
          eventsData.paste = data;
        },
        change: function() {
          eventsData.change = true;
        }
      });
      var fileInput = form.fileupload('option', 'fileInput');
      var dropZone = form.fileupload('option', 'dropZone');
      var pasteZone = form.fileupload('option', 'pasteZone');
      form.fileupload('destroy');
      expect(form.data('blueimp-fileupload')).to.equal();
      fileInput.trigger($.Event('change', eventObject));
      expect(eventsData.change).to.equal();
      dropZone
        .trigger($.Event('dragover', eventObject))
        .trigger($.Event('dragenter', eventObject))
        .trigger($.Event('dragleave', eventObject))
        .trigger($.Event('drop', eventObject));
      expect(eventsData.dragover).to.equal();
      expect(eventsData.dragenter).to.equal();
      expect(eventsData.dragleave).to.equal();
      expect(eventsData.drop).to.deep.equal();
      pasteZone.trigger($.Event('paste', eventObject));
      expect(eventsData.paste).to.deep.equal();
    });

    it('disable', function() {
      var eventsData = {};
      form.fileupload('option', {
        pasteZone: document,
        dragover: function() {
          eventsData.dragover = true;
        },
        dragenter: function() {
          eventsData.dragenter = true;
        },
        dragleave: function() {
          eventsData.dragleave = true;
        },
        drop: function(e, data) {
          eventsData.drop = data;
        },
        paste: function(e, data) {
          eventsData.paste = data;
        },
        change: function() {
          eventsData.change = true;
        }
      });
      form.fileupload('disable');
      form
        .fileupload('option', 'fileInput')
        .trigger($.Event('change', eventObject));
      expect(eventsData.change).to.equal();
      form
        .fileupload('option', 'dropZone')
        .trigger($.Event('dragover', eventObject))
        .trigger($.Event('dragenter', eventObject))
        .trigger($.Event('dragleave', eventObject))
        .trigger($.Event('drop', eventObject));
      expect(eventsData.dragover).to.equal();
      expect(eventsData.dragenter).to.equal();
      expect(eventsData.dragleave).to.equal();
      expect(eventsData.drop).to.deep.equal();
      form
        .fileupload('option', 'pasteZone')
        .trigger($.Event('paste', eventObject));
      expect(eventsData.paste).to.deep.equal();
    });

    it('enable', function() {
      var eventsData = {};
      form.fileupload('option', {
        pasteZone: document,
        dragover: function() {
          eventsData.dragover = true;
        },
        dragenter: function() {
          eventsData.dragenter = true;
        },
        dragleave: function() {
          eventsData.dragleave = true;
        },
        drop: function(e, data) {
          eventsData.drop = data;
        },
        paste: function(e, data) {
          eventsData.paste = data;
        },
        change: function() {
          eventsData.change = true;
        }
      });
      form.fileupload('disable');
      form.fileupload('enable');
      form
        .fileupload('option', 'fileInput')
        .trigger($.Event('change', eventObject));
      expect(eventsData.change).to.equal(true);
      form
        .fileupload('option', 'dropZone')
        .trigger($.Event('dragover', eventObject))
        .trigger($.Event('dragenter', eventObject))
        .trigger($.Event('dragleave', eventObject))
        .trigger($.Event('drop', eventObject));
      expect(eventsData.dragover).to.equal(true);
      expect(eventsData.dragenter).to.equal(true);
      expect(eventsData.dragleave).to.equal(true);
      expect(eventsData.drop.files).to.deep.equal(files);
      form
        .fileupload('option', 'pasteZone')
        .trigger($.Event('paste', eventObject));
      expect(eventsData.paste.files).to.deep.equal(files);
    });

    it('option', function() {
      var eventsData = {};
      form.fileupload('option', 'drop', function(e, data) {
        eventsData.drop = data;
      });
      var dropZone = form
        .fileupload('option', 'dropZone')
        .trigger($.Event('drop', eventObject));
      expect(eventsData.drop.files).to.deep.equal(files);
      delete eventsData.drop;
      form.fileupload('option', 'dropZone', null);
      dropZone.trigger($.Event('drop', eventObject));
      expect(eventsData.drop).to.equal();
      form.fileupload('option', {
        dropZone: dropZone
      });
      dropZone.trigger($.Event('drop', eventObject));
      expect(eventsData.drop.files).to.deep.equal(files);
    });

    it('add', function() {
      var eventData = [];
      form.fileupload('option', 'add', function(e, data) {
        eventData.push(data);
      });
      form.fileupload('add', { files: files });
      expect(eventData.length).to.equal(2);
      expect(eventData[0].files[0]).to.equal(files[0]);
      expect(eventData[1].files[0]).to.equal(files[1]);
    });

    it('send', function(done) {
      this.slow(200);
      form.fileupload('send', { files: files }).complete(function(result) {
        var uploadedFiles = result.responseJSON.files;
        expect(uploadedFiles.length).to.equal(2);
        expect(uploadedFiles[0].type).to.equal(files[0].type);
        expect(uploadedFiles[0].error).to.equal();
        expect(uploadedFiles[1].type).to.equal(files[1].type);
        expect(uploadedFiles[1].error).to.equal();
        done();
      });
    });
  });

  describe('Callbacks', function() {
    var form;

    beforeEach(function() {
      form = createFileuploadForm().fileupload({ dataType: 'json' });
    });

    afterEach(function() {
      form.remove();
    });

    it('add', function() {
      var eventData = [];
      form.fileupload('option', 'add', function(e, data) {
        eventData.push(data);
      });
      form.fileupload('add', { files: files });
      expect(eventData.length).to.equal(2);
      expect(eventData[0].files[0]).to.equal(files[0]);
      expect(eventData[1].files[0]).to.equal(files[1]);
    });

    it('submit', function(done) {
      this.slow(200);
      var eventData = [];
      form.fileupload('option', {
        submit: function(e, data) {
          eventData.push(data);
        },
        stop: function() {
          if (eventData.length < 2) return;
          expect(eventData[0].files[0]).to.equal(files[0]);
          expect(eventData[1].files[0]).to.equal(files[1]);
          done();
        }
      });
      form.fileupload('add', { files: files });
    });

    it('send', function(done) {
      this.slow(200);
      var eventData = [];
      form.fileupload('option', {
        send: function(e, data) {
          eventData.push(data);
        },
        stop: function() {
          expect(eventData.length).to.equal(1);
          expect(eventData[0].files).to.deep.equal(files);
          done();
        }
      });
      form.fileupload('send', { files: files });
    });

    it('done', function(done) {
      this.slow(200);
      var eventData = [];
      form.fileupload('option', {
        done: function(e, data) {
          eventData.push(data);
        },
        stop: function() {
          if (eventData.length < 2) return;
          expect(eventData[0].result.files.length).to.equal(1);
          expect(eventData[1].result.files.length).to.equal(1);
          done();
        }
      });
      form.fileupload('add', { files: files });
    });

    it('fail', function(done) {
      this.slow(200);
      var eventData = [];
      form.fileupload('option', {
        url: uploadURL + '404',
        fail: function(e, data) {
          eventData.push(data);
        },
        stop: function() {
          if (eventData.length < 2) return;
          expect(eventData[0].result).to.equal();
          expect(eventData[1].result).to.equal();
          done();
        }
      });
      form.fileupload('add', { files: files });
    });

    it('always', function(done) {
      this.slow(200);
      var eventData = [];
      form.fileupload('option', {
        always: function(e, data) {
          eventData.push(data);
        },
        stop: function() {
          if (eventData.length < 2) {
            expect(eventData[0].result).to.equal();
            form.fileupload('add', { files: [fileGIF] });
            return;
          }
          expect(eventData[1].result.files.length).to.equal(1);
          done();
        }
      });
      form.fileupload('add', { files: [fileGIF], url: uploadURL + '404' });
    });

    it('progress', function(done) {
      this.slow(200);
      var loaded;
      var total;
      form.fileupload('option', {
        progress: function(e, data) {
          loaded = data.loaded;
          total = data.total;
          expect(loaded).to.be.at.most(total);
        },
        stop: function() {
          expect(loaded).to.equal(total);
          done();
        }
      });
      form.fileupload('add', { files: [fileGIF] });
    });

    it('progressall', function(done) {
      this.slow(200);
      var loaded;
      var total;
      var completed = 0;
      form.fileupload('option', {
        progressall: function(e, data) {
          loaded = data.loaded;
          total = data.total;
          expect(loaded).to.be.at.most(total);
        },
        always: function() {
          completed++;
        },
        stop: function() {
          if (completed < 2) return;
          expect(loaded).to.equal(total);
          done();
        }
      });
      form.fileupload('add', { files: files });
    });

    it('start', function(done) {
      this.slow(200);
      var started;
      form.fileupload('option', {
        start: function() {
          started = true;
        },
        stop: function() {
          expect(started).to.equal(true);
          done();
        }
      });
      form.fileupload('add', { files: [fileGIF] });
    });

    it('stop', function(done) {
      this.slow(200);
      form.fileupload('option', {
        stop: function() {
          done();
        }
      });
      form.fileupload('add', { files: [fileGIF] });
    });

    it('dragover', function() {
      var eventsData = {};
      form.fileupload('option', {
        autoUpload: false,
        dragover: function() {
          eventsData.dragover = true;
        }
      });
      form
        .fileupload('option', 'dropZone')
        .trigger($.Event('dragover', eventObject));
      expect(eventsData.dragover).to.equal(true);
    });

    it('dragenter', function() {
      var eventsData = {};
      form.fileupload('option', {
        autoUpload: false,
        dragenter: function() {
          eventsData.dragenter = true;
        }
      });
      form
        .fileupload('option', 'dropZone')
        .trigger($.Event('dragenter', eventObject));
      expect(eventsData.dragenter).to.equal(true);
    });

    it('dragleave', function() {
      var eventsData = {};
      form.fileupload('option', {
        autoUpload: false,
        dragleave: function() {
          eventsData.dragleave = true;
        }
      });
      form
        .fileupload('option', 'dropZone')
        .trigger($.Event('dragleave', eventObject));
      expect(eventsData.dragleave).to.equal(true);
    });

    it('drop', function() {
      var eventsData = {};
      form.fileupload('option', {
        autoUpload: false,
        drop: function(e, data) {
          eventsData.drop = data;
        }
      });
      form
        .fileupload('option', 'dropZone')
        .trigger($.Event('drop', eventObject));
      expect(eventsData.drop.files).to.deep.equal(files);
    });

    it('paste', function() {
      var eventsData = {};
      form.fileupload('option', {
        autoUpload: false,
        pasteZone: document,
        paste: function(e, data) {
          eventsData.paste = data;
        }
      });
      form
        .fileupload('option', 'pasteZone')
        .trigger($.Event('paste', eventObject));
      expect(eventsData.paste.files).to.deep.equal(files);
    });

    it('change', function() {
      var eventsData = {};
      form.fileupload('option', {
        autoUpload: false,
        change: function() {
          eventsData.change = true;
        }
      });
      form
        .fileupload('option', 'fileInput')
        .trigger($.Event('change', eventObject));
      expect(eventsData.change).to.equal(true);
    });
  });

  describe('Options', function() {
    var form;

    beforeEach(function() {
      form = createFileuploadForm();
    });

    afterEach(function() {
      form.remove();
    });

    it('paramName', function(done) {
      form.fileupload({
        send: function(e, data) {
          expect(data.paramName[0]).to.equal(
            form.fileupload('option', 'fileInput').prop('name')
          );
          done();
          return false;
        }
      });
      form.fileupload('add', { files: [fileGIF] });
    });

    it('url', function(done) {
      form.fileupload({
        send: function(e, data) {
          expect(data.url).to.equal(form.prop('action'));
          done();
          return false;
        }
      });
      form.fileupload('add', { files: [fileGIF] });
    });

    it('type', function(done) {
      form.fileupload({
        type: 'PUT',
        send: function(e, data) {
          expect(data.type).to.equal('PUT');
          done();
          return false;
        }
      });
      form.fileupload('add', { files: [fileGIF] });
    });

    it('replaceFileInput', function() {
      form.fileupload();
      var fileInput = form.fileupload('option', 'fileInput');
      fileInput.trigger($.Event('change', eventObject));
      expect(form.fileupload('option', 'fileInput')[0]).to.not.equal(
        fileInput[0]
      );
      form.fileupload('option', 'replaceFileInput', false);
      fileInput = form.fileupload('option', 'fileInput');
      fileInput.trigger($.Event('change', eventObject));
      expect(form.fileupload('option', 'fileInput')[0]).to.equal(fileInput[0]);
    });

    it('forceIframeTransport', function(done) {
      form.fileupload({
        forceIframeTransport: 'PUT',
        send: function(e, data) {
          expect(data.dataType.substr(0, 6)).to.equal('iframe');
          done();
          return false;
        }
      });
      form.fileupload('add', { files: [fileGIF] });
    });

    it('singleFileUploads', function(done) {
      form.fileupload({
        singleFileUploads: false,
        send: function(e, data) {
          expect(data.files).to.deep.equal(files);
          done();
          return false;
        }
      });
      form.fileupload('add', { files: files });
    });

    it('limitMultiFileUploads', function(done) {
      var completed = 0;
      form.fileupload({
        singleFileUploads: false,
        limitMultiFileUploads: 2,
        send: function(e, data) {
          expect(data.files).to.deep.equal(files);
          completed++;
          if (completed < 2) return;
          done();
          return false;
        }
      });
      form.fileupload('add', { files: files.concat(files) });
    });

    it('limitMultiFileUploadSize', function(done) {
      var completed = 0;
      form.fileupload({
        singleFileUploads: false,
        limitMultiFileUploadSize: files[0].size + files[1].size,
        limitMultiFileUploadSizeOverhead: 0,
        send: function(e, data) {
          expect(data.files).to.deep.equal(files);
          completed++;
          if (completed < 2) return;
          done();
          return false;
        }
      });
      form.fileupload('add', { files: files.concat(files) });
    });

    it('sequentialUploads', function(done) {
      this.slow(400);
      var completed = 0;
      var events = [];
      form.fileupload({
        sequentialUploads: true,
        dataType: 'json',
        start: function() {
          events.push('start');
        },
        send: function() {
          events.push('send');
        },
        always: function() {
          events.push('complete');
          completed++;
        },
        stop: function() {
          events.push('stop');
          if (completed === 4) {
            expect(events).to.deep.equal([
              'start',
              'send',
              'complete',
              'send',
              'complete',
              'send',
              'complete',
              'send',
              'complete',
              'stop'
            ]);
            done();
          }
        }
      });
      form.fileupload('add', { files: files.concat(files) });
    });

    it('limitConcurrentUploads', function(done) {
      this.slow(800);
      var completed = 0;
      var loadCount = 0;
      form.fileupload({
        limitConcurrentUploads: 2,
        dataType: 'json',
        send: function() {
          loadCount++;
          expect(loadCount).to.be.at.most(2);
        },
        always: function() {
          completed++;
          loadCount--;
        },
        stop: function() {
          if (completed === 8) {
            done();
          }
        }
      });
      form.fileupload('add', {
        files: files
          .concat(files)
          .concat(files)
          .concat(files)
      });
    });

    it('multipart', function(done) {
      form.fileupload({
        multipart: false,
        send: function(e, data) {
          expect(data.contentType).to.equal(fileGIF.type);
          expect(data.headers['Content-Disposition']).to.equal(
            'attachment; filename="' + fileGIF.name + '"'
          );
          done();
          return false;
        }
      });
      form.fileupload('add', { files: [fileGIF] });
    });

    it('uniqueFilenames', function(done) {
      form.fileupload({
        uniqueFilenames: {},
        send: function(e, data) {
          var formFiles = data.data.getAll('files[]');
          expect(formFiles[0].name).to.equal(fileGIF.name);
          expect(formFiles[1].name).to.equal(
            fileGIF.name.replace('.gif', ' (1).gif')
          );
          expect(formFiles[2].name).to.equal(
            fileGIF.name.replace('.gif', ' (2).gif')
          );
          done();
          return false;
        }
      });
      form.fileupload('send', { files: [fileGIF, fileGIF, fileGIF] });
    });

    it('maxChunkSize', function(done) {
      this.slow(400);
      var events = [];
      form.fileupload({
        maxChunkSize: 32,
        dataType: 'json',
        chunkbeforesend: function() {
          events.push('chunkbeforesend');
        },
        chunksend: function() {
          events.push('chunksend');
        },
        chunkdone: function() {
          events.push('chunkdone');
        },
        done: function(e, data) {
          var uploadedFile = data.result.files[0];
          expect(uploadedFile.type).to.equal(fileGIF.type);
          expect(uploadedFile.size).to.equal(fileGIF.size);
        },
        stop: function() {
          expect(events).to.deep.equal([
            'chunkbeforesend',
            'chunksend',
            'chunkdone',
            'chunkbeforesend',
            'chunksend',
            'chunkdone',
            'chunkbeforesend',
            'chunksend',
            'chunkdone',
            'chunkbeforesend',
            'chunksend',
            'chunkdone'
          ]);
          done();
        }
      });
      form.fileupload('send', { files: [fileGIF] });
    });

    it('acceptFileTypes', function(done) {
      var processData;
      form.fileupload({
        acceptFileTypes: /^image\/gif$/,
        singleFileUploads: false,
        processalways: function(e, data) {
          processData = data;
        },
        processstop: function() {
          expect(processData.files[0].error).to.equal();
          expect(processData.files[1].error).to.equal(
            form.fileupload('option').i18n('acceptFileTypes')
          );
          done();
        }
      });
      form.fileupload('add', { files: files });
    });

    it('maxFileSize', function(done) {
      var processData;
      form.fileupload({
        maxFileSize: 200,
        singleFileUploads: false,
        processalways: function(e, data) {
          processData = data;
        },
        processstop: function() {
          expect(processData.files[0].error).to.equal();
          expect(processData.files[1].error).to.equal(
            form.fileupload('option').i18n('maxFileSize')
          );
          done();
        }
      });
      form.fileupload('add', { files: files });
    });

    it('minFileSize', function(done) {
      var processData;
      form.fileupload({
        minFileSize: 200,
        singleFileUploads: false,
        processalways: function(e, data) {
          processData = data;
        },
        processstop: function() {
          expect(processData.files[0].error).to.equal(
            form.fileupload('option').i18n('minFileSize')
          );
          expect(processData.files[1].error).to.equal();
          done();
        }
      });
      form.fileupload('add', { files: files });
    });

    it('maxNumberOfFiles', function(done) {
      var processData;
      form.fileupload({
        maxNumberOfFiles: 2,
        getNumberOfFiles: function() {
          return 2;
        },
        singleFileUploads: false,
        processalways: function(e, data) {
          processData = data;
        },
        processstop: function() {
          expect(processData.files[0].error).to.equal(
            form.fileupload('option').i18n('maxNumberOfFiles')
          );
          expect(processData.files[1].error).to.equal(
            form.fileupload('option').i18n('maxNumberOfFiles')
          );
          done();
        }
      });
      form.fileupload('add', { files: files });
    });
  });
})(this.chai.expect, this.jQuery);
