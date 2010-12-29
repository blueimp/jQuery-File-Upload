/*
 * jQuery File Upload User Interface Plugin 1.3
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
        if (!options.uploadTable) {
            $.error('jQuery.fileUploadUI requires option uploadTable: $(uploadTable)');
        }
        if (!options.downloadTable) {
            $.error('jQuery.fileUploadUI requires option downloadTable: $(downloadTable)');
        }
        if (typeof options.buildUploadRow !== 'function') {
            $.error('jQuery.fileUploadUI requires option buildUploadRow: function (files, index) {return $(row)}');
        }
        if (typeof options.buildDownloadRow !== 'function') {
            $.error('jQuery.fileUploadUI requires option buildDownloadRow: function (json) {return $(row)}');
        }
        
        var uploadHandler = this,
            dragLeaveTimeout,
            isDropZoneEnlarged;
        
        this.progressSelector = '.file_upload_progress div';
        this.cancelSelector = '.file_upload_cancel div';
        this.cssClassSmall = 'file_upload_small';
        this.cssClassLarge = 'file_upload_large';
        this.cssClassHighlight = 'file_upload_highlight';
        this.dropEffect = 'highlight';

        this.abort = this.removeUploadRow = function (event, files, index, xhr, settings) {
            if (settings.uploadRow) {
                settings.uploadRow.fadeOut(function () {
                    $(this).remove();
                });
            }
        };
        
        this.cancelUpload = function (files, index, xhr, settings) {
            if (xhr && xhr.readyState > 1) {
                xhr.abort();
            } else {
                // javascript:false as iframe src prevents warning popups on HTTPS in IE6
                // concat is used here to prevent the "Script URL" JSLint error:
                dropZone.find('iframe').attr('src', 'javascript'.concat(':false;'));
                uploadHandler.abort(null, files, index, xhr, settings);
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
        
        this.init = function (files, index, xhr, callBack, settings) {
            var uploadRow = uploadHandler.buildUploadRow(files, index),
                extraSettings = {uploadRow: uploadRow};
            if (uploadRow) {
                extraSettings.progressbar = uploadHandler.initProgressBar(
                    uploadRow.find(uploadHandler.progressSelector),
                    (xhr ? 0 : 100)
                );
                uploadRow.find(uploadHandler.cancelSelector).click(function () {
                    uploadHandler.cancelUpload(files, index, xhr, extraSettings);
                });
                uploadRow.appendTo(uploadHandler.uploadTable).fadeIn();
            }
            if (typeof uploadHandler.initCallBack === 'function') {
                uploadHandler.initCallBack(files, index, xhr, function (callBackSettings) {
                    callBack($.extend(extraSettings, callBackSettings));
                }, $.extend({}, settings, extraSettings));
            } else {
                callBack(extraSettings);
            }
        };
        
        this.progress = function (event, files, index, xhr, settings) {
            if (settings.progressbar) {
                settings.progressbar.progressbar(
                    'value',
                    parseInt(event.loaded / event.total * 100, 10)
                );
            }
        };
        
        this.load = function (event, files, index, xhr, settings) {
            uploadHandler.removeUploadRow(event, files, index, xhr, settings);
            var json, downloadRow;
            try {
                if (xhr) {
                    json = $.parseJSON(xhr.responseText);
                } else {
                    json = $.parseJSON($(event.target).contents().text());
                }
            } catch (e) {
                if (typeof uploadHandler.error === 'function') {
                    uploadHandler.error(e, files, index, xhr, $.extend({}, settings, {originalEvent: event}));
                } else {
                    throw e;
                }
            }
            if (json) {
                downloadRow = uploadHandler.buildDownloadRow(json);
                if (downloadRow) {
                    downloadRow.appendTo(uploadHandler.downloadTable).fadeIn();
                }
            }
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

        this.documentDragEnter = function (event) {
            setTimeout(function () {
                if (dragLeaveTimeout) {
                    clearTimeout(dragLeaveTimeout);
                }
            }, 50);
            uploadHandler.dropZoneEnlarge();
        };
        
        this.documentDragLeave = function (event) {
            if (dragLeaveTimeout) {
                clearTimeout(dragLeaveTimeout);
            }
            dragLeaveTimeout = setTimeout(function () {
                uploadHandler.dropZoneReduce();
            }, 100);
        };
        
        this.dragEnter = this.dragLeave = function (event) {
            dropZone.toggleClass(uploadHandler.cssClassHighlight);
        };
        
        this.drop = function (event) {
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
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.fileUploadUI');
        }
    };
    
}(jQuery));