/*
 * jQuery File Upload Plugin Tests 1.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint unparam: true */
/*global $, module, test, asyncTest, start, ok, strictEqual */

$(function () {
    'use strict';

    var lifecycle = {
            teardown: function () {
                // Delete all uploaded files:
                var url = '../example/upload.php';
                $.getJSON(url, function (files) {
                    $.each(files, function (index, file) {
                        $.ajax({
                            url: url + '?file=' + encodeURIComponent(file.name),
                            type: 'DELETE'
                        });
                    });
                });
            }
        },
        parseResponse = function (xhr) {
            if ($.type(xhr.responseText) !== 'undefined') {
                return $.parseJSON(xhr.responseText);
            } else {
                // Instead of an XHR object, an iframe is used for legacy browsers:
                return $.parseJSON(xhr.contents().text());
            }
        },
        hasUploadError = function (response) {
            if ($.isArray(response)) {
                response = response.slice(0);
                while (response.length) {
                    if (response.pop().error) {
                        return true;
                    }
                }
                return false;
            }
            return !!response.error;
        },
        uploadOK = function (xhr, handler) {
            var response = handler && handler.response ?
                handler.response : parseResponse(xhr);
            ok(!hasUploadError(response), 'no upload error');
        };

    module('File Upload', lifecycle);
    
    asyncTest('Default settings', function () {
        $('#file_upload form').fileUpload({
            onLoad: function (event, files, index, xhr, handler) {
                uploadOK(xhr);
            },
            onLoadAll: function (list) {
                start();
            }
        });
    });
    
    asyncTest('multipart: false, maxChunkSize: 500000', function () {
        $('#file_upload form').fileUpload({
            multipart: false,
            maxChunkSize: 500000,
            onLoad: function (event, files, index, xhr, handler) {
                uploadOK(xhr);
            },
            onLoadAll: function (list) {
                start();
            }
        });
    });
    
    asyncTest('multiFileRequest: true', function () {
        $('#file_upload form').fileUpload({
            multiFileRequest: true,
            onLoad: function (event, files, index, xhr, handler) {
                uploadOK(xhr);
            },
            onLoadAll: function (list) {
                strictEqual(list.length, 1, 'one request only');
                start();
            }
        });
    });
    
    asyncTest('forceIframeUpload: true', function () {
        $('#file_upload form').fileUpload({
            forceIframeUpload: true,
            onLoad: function (event, files, index, xhr, handler) {
                uploadOK(xhr);
                strictEqual($.type(xhr.responseText), 'undefined', 'no XHR responseText');
            },
            onLoadAll: function (list) {
                strictEqual(list.length, 1, 'one request only');
                start();
            }
        });
    });

    asyncTest('sequentialUploads: true', function () {
        var sendIndex = 0,
            loadIndex = 0;
        $('#file_upload form').fileUpload({
            sequentialUploads: true,
            onSend: function (event, files, index, xhr, handler) {
                sendIndex += 1;
            },
            onLoad: function (event, files, index, xhr, handler) {
                uploadOK(xhr);
                loadIndex += 1;
                strictEqual(sendIndex, loadIndex, 'upload in order');
            },
            onLoadAll: function (list) {
                start();
            }
        });
    });
    
    asyncTest('Multiple plugin instances, Upload API', function () {
        $('#file_upload form').fileUpload({
            dragDropSupport: false,
            onChange: function (event) {
                return false;
            },
            onSend: function (event, files, index, xhr, handler) {
                strictEqual(event, null, 'API upload event is null');
            },
            onLoad: function (event, files, index, xhr, handler) {
                uploadOK(xhr);
            },
            onLoadAll: function (list) {
                start();
            }
        }).fileUpload({
            namespace: 'file_upload_2',
            multiFileRequest: true,
            onSend: function (event, files, index, xhr, handler) {
                try {
                    $('#file_upload form').fileUpload('upload', files);
                } catch (e) {
                    ok(false, e);
                    start();
                } 
                return false;
            }
        });
    });
    
    module('File Upload UI', lifecycle);
    
    asyncTest('Default settings', function () {
        $('#file_upload form').fileUploadUI({
            onComplete: function (event, files, index, xhr, handler) {
                uploadOK(xhr, handler);
            },
            onCompleteAll: function (list) {
                start();
            }
        });
    });
    
    module('File Upload UIX', lifecycle);
    
    asyncTest('Default settings', function () {
        $('#file_upload').fileUploadUIX({
            onComplete: function (event, files, index, xhr, handler) {
                uploadOK(xhr, handler);
            },
            onCompleteAll: function (list) {
                start();
            }
        });
    });

});