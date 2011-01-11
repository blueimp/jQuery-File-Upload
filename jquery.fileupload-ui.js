/*
 * jQuery File Upload User Interface Plugin 3.0
 *
 * Copyright 2010, Sebastian Tschan, AQUANTUM
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 *
 * https://blueimp.net
 * http://www.aquantum.de
 */

/*jslint browser: true */
/*global jQuery */

(function ($) {

    var UploadHandler = function (dropZone, options) {
        var uploadHandler = this,
            dragLeaveTimeout,
            isDropZoneEnlarged;
        
        this.progressSelector = '.file_upload_progress div';
        this.cancelSelector = '.file_upload_cancel div';
        this.cssClassSmall = 'file_upload_small';
        this.cssClassLarge = 'file_upload_large';
        this.cssClassHighlight = 'file_upload_highlight';
        this.dropEffect = 'highlight';

        this.uploadTable = this.downloadTable = $();
        
        this.buildUploadRow = this.buildDownloadRow = function () {
            return null;
        };

        this.addNode = function (parentNode, node, callBack) {
            if (node) {
                node.hide().appendTo(parentNode).fadeIn(function () {
                    if (typeof callBack === 'function') {
                        try {
                            callBack();
                        } catch (e) {
                            // Fix endless exception loop:
                            $(this).stop();
                            throw e;
                        }
                    }
                });
            } else if (typeof callBack === 'function') {
                callBack();
            }
        };

        this.removeNode = function (node, callBack) {
            if (node) {
                node.fadeOut(function () {
                    $(this).remove();
                    if (typeof callBack === 'function') {
                        try {
                            callBack();
                        } catch (e) {
                            // Fix endless exception loop:
                            $(this).stop();
                            throw e;
                        }
                    }
                });
            } else if (typeof callBack === 'function') {
                callBack();
            }
        };

        this.onAbort = function (event, files, index, xhr, handler) {
            uploadHandler.removeNode(handler.uploadRow);
        };
        
        this.cancelUpload = function (event, files, index, xhr, handler) {
            var readyState = xhr.readyState;
            xhr.abort();
            // If readyState is below 2, abort() has no effect:
            if (isNaN(readyState) || readyState < 2) {
                handler.onAbort(event, files, index, xhr, handler);
            }
        };
        
        this.initProgressBar = function (node, value) {
            if (typeof node.progressbar === 'function') {
                return node.progressbar({
                    value: value
                });
            } else {
                var progressbar = $('<progress value="' + value + '" max="100"/>').appendTo(node);
                progressbar.progressbar = function (key, value) {
                    progressbar.attr('value', value);
                };
                return progressbar;
            }
        };
        
        this.initUploadRow = function (event, files, index, xhr, handler, callBack) {
            var uploadRow = handler.uploadRow = uploadHandler.buildUploadRow(files, index);
            if (uploadRow) {
                handler.progressbar = uploadHandler.initProgressBar(
                    uploadRow.find(uploadHandler.progressSelector),
                    (xhr.upload ? 0 : 100)
                );
                uploadRow.find(uploadHandler.cancelSelector).click(function (e) {
                    uploadHandler.cancelUpload(e, files, index, xhr, handler);
                });
            }
            uploadHandler.addNode(uploadHandler.uploadTable, uploadRow, callBack);
        };
        
        this.initUpload = function (event, files, index, xhr, handler, callBack) {
            uploadHandler.initUploadRow(event, files, index, xhr, handler, function () {
                if (typeof uploadHandler.beforeSend === 'function') {
                    uploadHandler.beforeSend(event, files, index, xhr, handler, callBack);
                } else {
                    callBack();
                }
            });
        };
        
        this.onProgress = function (event, files, index, xhr, handler) {
            if (handler.progressbar) {
                handler.progressbar.progressbar(
                    'value',
                    parseInt(event.loaded / event.total * 100, 10)
                );
            }
        };
        
        this.parseResponse = function (xhr) {
            if (typeof xhr.responseText !== 'undefined') {
                return $.parseJSON(xhr.responseText);
            } else {
                // Instead of an XHR object, an iframe is used for legacy browsers:
                return $.parseJSON(xhr.contents().text());
            }
        };
        
        this.initDownloadRow = function (event, files, index, xhr, handler, callBack) {
            var json, downloadRow;
            try {
                json = handler.response = uploadHandler.parseResponse(xhr);
                downloadRow = handler.downloadRow = uploadHandler.buildDownloadRow(json);
                uploadHandler.addNode(uploadHandler.downloadTable, downloadRow, callBack);
            } catch (e) {
                if (typeof uploadHandler.onError === 'function') {
                    handler.originalEvent = event;
                    uploadHandler.onError(e, files, index, xhr, handler);
                } else {
                    throw e;
                }
            }
        };
        
        this.onLoad = function (event, files, index, xhr, handler) {
            uploadHandler.removeNode(handler.uploadRow, function () {
                uploadHandler.initDownloadRow(event, files, index, xhr, handler, function () {
                    if (typeof uploadHandler.onComplete === 'function') {
                        uploadHandler.onComplete(event, files, index, xhr, handler);
                    }
                });
            });
        };

        this.dropZoneEnlarge = function () {
            if (!isDropZoneEnlarged) {
                if (typeof dropZone.switchClass === 'function') {
                    dropZone.switchClass(
                        uploadHandler.cssClassSmall,
                        uploadHandler.cssClassLarge
                    );
                } else {
                    dropZone.addClass(uploadHandler.cssClassLarge);
                    dropZone.removeClass(uploadHandler.cssClassSmall);
                }
                isDropZoneEnlarged = true;
            }
        };
        
        this.dropZoneReduce = function () {
            if (typeof dropZone.switchClass === 'function') {
                dropZone.switchClass(
                    uploadHandler.cssClassLarge,
                    uploadHandler.cssClassSmall
                );
            } else {
                dropZone.addClass(uploadHandler.cssClassSmall);
                dropZone.removeClass(uploadHandler.cssClassLarge);
            }
            isDropZoneEnlarged = false;
        };

        this.onDocumentDragEnter = function (event) {
            setTimeout(function () {
                if (dragLeaveTimeout) {
                    clearTimeout(dragLeaveTimeout);
                }
            }, 50);
            uploadHandler.dropZoneEnlarge();
        };
        
        this.onDocumentDragLeave = function (event) {
            if (dragLeaveTimeout) {
                clearTimeout(dragLeaveTimeout);
            }
            dragLeaveTimeout = setTimeout(function () {
                uploadHandler.dropZoneReduce();
            }, 100);
        };
        
        this.onDragEnter = this.onDragLeave = function (event) {
            dropZone.toggleClass(uploadHandler.cssClassHighlight);
        };
        
        this.onDrop = function (event) {
            if (typeof dropZone.effect === 'function') {
                dropZone.effect(uploadHandler.dropEffect, function () {
                    dropZone.removeClass(uploadHandler.cssClassHighlight);
                    uploadHandler.dropZoneReduce();
                });
            } else {
                dropZone.removeClass(uploadHandler.cssClassHighlight);
                uploadHandler.dropZoneReduce();
            }
        };

        $.extend(this, options);
    },

    methods = {
        init : function (options) {
            return this.each(function () {
                $(this).fileUpload(new UploadHandler($(this), options));
            });
        },
        
        destroy : function (namespace) {
            return this.each(function () {
                $(this).fileUpload('destroy', namespace);
            });
        }
    };
    
    $.fn.fileUploadUI = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.fileUploadUI');
        }
    };
    
}(jQuery));