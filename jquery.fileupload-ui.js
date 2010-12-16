/*
 * jQuery File Upload User Interface Plugin 1.2
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
        
        this.init = function (files, index, xhr, callBack) {
            var uploadRow = uploadHandler.buildUploadRow(files, index),
                progressbar,
                callBackSettings;
            if (uploadRow) {
                progressbar = uploadRow.find(uploadHandler.progressSelector).progressbar({
                    value: (xhr ? 0 : 100)
                });
                uploadRow.find(uploadHandler.cancelSelector).click(function () {
                    if (xhr) {
                        xhr.abort();
                    } else {
                        // javascript:false as iframe src prevents warning popups on HTTPS in IE6
                        // concat is used here to prevent the "Script URL" JSLint error:
                        dropZone.find('iframe').attr('src', 'javascript'.concat(':false;'));
                        uploadRow.fadeOut(function () {
                            $(this).remove();
                        });
                    }
                });
                uploadRow.appendTo(uploadHandler.uploadTable).fadeIn();
            }
            callBackSettings = {uploadRow: uploadRow, progressbar: progressbar};
            if (typeof uploadHandler.initCallBack === 'function') {
                uploadHandler.initCallBack(files, index, xhr, function (settings) {
                    callBack($.extend(settings, callBackSettings));
                }, callBackSettings);
            } else {
                callBack(callBackSettings);
            }
        };
        
        this.abort = function (event, files, index, xhr, settings) {
            if (settings.uploadRow) {
                settings.uploadRow.fadeOut(function () {
                    $(this).remove();
                });
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
            if (settings.uploadRow) {
                settings.uploadRow.fadeOut(function () {
                    $(this).remove();
                });
            }
            var json, downloadRow;
            if (xhr) {
                json = $.parseJSON(xhr.responseText);
            } else {
                json = $.parseJSON($(event.target).contents().text());
            }
            if (json) {
                downloadRow = uploadHandler.buildDownloadRow(json);
                if (downloadRow) {
                    downloadRow.appendTo(uploadHandler.downloadTable).fadeIn();
                }
            }
        };
        
        this.documentDragEnter = function (event) {
            setTimeout(function () {
                if (dragLeaveTimeout) {
                    clearTimeout(dragLeaveTimeout);
                }
            }, 50);
            if (!isDropZoneEnlarged) {
                dropZone.switchClass(
                    uploadHandler.cssClassSmall,
                    uploadHandler.cssClassLarge
                );
                isDropZoneEnlarged = true;
            }
        };
        
        this.documentDragLeave = function (event) {
            if (dragLeaveTimeout) {
                clearTimeout(dragLeaveTimeout);
            }
            dragLeaveTimeout = setTimeout(function () {
                dropZone.switchClass(
                    uploadHandler.cssClassLarge,
                    uploadHandler.cssClassSmall
                );
                isDropZoneEnlarged = false;
            }, 100);
        };
        
        this.dragEnter = this.dragLeave = function (event) {
            dropZone.toggleClass(uploadHandler.cssClassHighlight);
        };
        
        this.drop = function (event) {
            dropZone.effect(uploadHandler.dropEffect, function () {
                dropZone.removeClass(uploadHandler.cssClassHighlight);
                dropZone.switchClass(
                    uploadHandler.cssClassLarge,
                    uploadHandler.cssClassSmall
                );
            });
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