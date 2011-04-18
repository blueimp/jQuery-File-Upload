/*
 * jQuery File Upload User Interface Extended Plugin 4.3.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint regexp: false */
/*global jQuery */

(function ($) {

    var UploadHandler,
        methods;

    // Emulate jQuery UI button (without states) if not available:
    if (typeof $().button !== 'function') {
        $.fn.button = function (options) {
            return this.each(function () {
                if (options === 'destroy') {
                    $(this).removeClass(
                        'ui-button ui-widget ui-state-default ui-corner-all' +
                            ' ui-button-icon-only ui-button-text-icon-primary'
                    ).html($(this).text());
                } else {
                    $(this)
                        .addClass('ui-button ui-widget ui-state-default ui-corner-all')
                        .addClass(
                            options.text === false ? 'ui-button-icon-only' :
                                'ui-button-text-icon-primary'
                        )
                        .html($('<span class="ui-button-text"/>').text($(this).text()))
                        .prepend(
                            $('<span class="ui-button-icon-primary ui-icon"/>')
                                .addClass(options.icons.primary)
                        );
                }
            });
        };
    }
        
    UploadHandler = function (container, options) {
        var uploadHandler = this;

        this.uploadDir = this.thumbnailsDir = null;
        this.autoUpload = true;
        this.continueAbortedUploads = false;
        this.dropZone = container.find('form:first');
        this.uploadTable = container.find('.files:first');
        this.downloadTable = this.uploadTable;
        this.progressAllNode = container.find('.file_upload_overall_progress div:first');
        this.uploadTemplate = this.uploadTable.find('.file_upload_template:first');
        this.downloadTemplate = this.uploadTable.find('.file_download_template:first');
        this.multiButtons = container.find('.file_upload_buttons:first');
        
        this.formatFileSize = function (bytes) {
            if (typeof bytes !== 'number' || bytes === null) {
                return '';
            }
            if (bytes >= 1000000000) {
                return (bytes / 1000000000).toFixed(2) + ' GB';
            }
            if (bytes >= 1000000) {
                return (bytes / 1000000).toFixed(2) + ' MB';
            }
            return (bytes / 1000).toFixed(2) + ' KB';
        };
        
        this.formatFileName = function (name) {
            return name.replace(/^.*[\/\\]/, '');
        };
        
        this.enableDragToDesktop = function () {
            var link = $(this),
                url = link.get(0).href,
                name = decodeURIComponent(url.split('/').pop()).replace(/:/g, '-'),
                type = 'application/octet-stream';
            link.bind('dragstart', function (event) {
                try {
                    event.originalEvent.dataTransfer
                        .setData('DownloadURL', [type, name, url].join(':'));
                } catch (e) {}
            });
        };

        this.buildUploadRow = function (files, index, handler) {
            var file = files[index],
                fileName = handler.formatFileName(file.name),
                uploadRow = handler.uploadTemplate
                    .clone().removeAttr('id');
            uploadRow.attr('data-name', file.name);
            uploadRow.attr('data-size', file.size);
            uploadRow.attr('data-type', file.type);
            uploadRow.find('.file_name')
                .text(fileName);
            uploadRow.find('.file_size')
                .text(handler.formatFileSize(file.size));
            if (handler.autoUpload) {
                uploadRow.find('.file_upload_start button').hide();
            } else {
                uploadRow.find('.file_upload_start button')
                    .button({icons: {primary: 'ui-icon-circle-arrow-e'}, text: false});
            }
            uploadRow.find('.file_upload_cancel button')
                .button({icons: {primary: 'ui-icon-cancel'}, text: false});
            return uploadRow;
        };

        this.getFileUrl = function (file, handler) {
            return handler.uploadDir + encodeURIComponent(file.name);
        };
        
        this.getThumbnailUrl = function (file, handler) {
            return handler.thumbnailsDir + encodeURIComponent(file.name);
        };

        this.buildDownloadRow = function (file, handler) {
            var fileName = handler.formatFileName(file.name),
                fileUrl = handler.getFileUrl(file, handler),
                downloadRow = handler.downloadTemplate
                    .clone().removeAttr('id');
            $.each(file, function (name, value) {
                downloadRow.attr('data-' + name, value);
            });
            downloadRow.find('.file_name a')
                .attr('href', fileUrl)
                .text(fileName);
            downloadRow.find('.file_size')
                .text(handler.formatFileSize(file.size));
            if (file.thumbnail) {
                downloadRow.find('.file_download_preview').append(
                    $('<a href="' + fileUrl + '"><img src="' +
                        handler.getThumbnailUrl(file, handler) + '"/></a>')
                );
                downloadRow.find('a').attr('target', '_blank');
            }
            downloadRow.find('a')
                .each(handler.enableDragToDesktop);
            downloadRow.find('.file_download_delete button')
                .button({icons: {primary: 'ui-icon-trash'}, text: false});
            return downloadRow;
        };
        
        this.uploadCallBack = function (event, files, index, xhr, handler, callBack) {
            if (handler.autoUpload) {
                callBack();
            } else {
                handler.uploadRow.find('.file_upload_start button').click(function (e) {
                    $(this).fadeOut();
                    callBack();
                    e.preventDefault();
                });
            }
        };

        this.continueUploadCallBack = function (event, files, index, xhr, handler, callBack) {
            $.getJSON(
                handler.url,
                {file: handler.uploadRow.attr('data-name')},
                function (file) {
                    if (file && file.size !== files[index].size) {
                        handler.uploadedBytes = file.size;
                    }
                    handler.uploadCallBack(event, files, index, xhr, handler, callBack);
                }
            );
        };
        
        this.beforeSend = function (event, files, index, xhr, handler, callBack) {
            if (handler.continueAbortedUploads) {
                handler.continueUploadCallBack(event, files, index, xhr, handler, callBack);
            } else {
                handler.uploadCallBack(event, files, index, xhr, handler, callBack);
            }
        };

        this.initDownloadHandler = function () {
            // Open download dialogs via iframes, to prevent aborting current uploads:
            uploadHandler.downloadTable.find('a:not([target="_blank"])')
                .live('click', function () {
                    $('<iframe style="display:none;"/>')
                        .attr('src', this.href)
                        .appendTo(container);
                    return false;
                });
        };

        this.initDeleteHandler = function () {
            uploadHandler.downloadTable.find('.file_download_delete button')
                .live('click', function (e) {
                    var row = $(this).closest('tr');
                    $.ajax({
                        url: uploadHandler.url + '?file=' + encodeURIComponent(
                            row.attr('data-id') || row.attr('data-name')
                        ),
                        type: 'DELETE',
                        success: function () {
                            row.fadeOut(function () {
                                row.remove();
                            });
                        }
                    });
                    e.preventDefault();
                });
        };
        
        this.initMultiButtons = function () {
            if (uploadHandler.autoUpload) {
                uploadHandler.multiButtons.find('.file_upload_start:first').hide();
            } else {
                uploadHandler.multiButtons.find('.file_upload_start:first')
                    .button({icons: {primary: 'ui-icon-circle-arrow-e'}})
                    .click(function (e) {
                        uploadHandler.uploadTable.find('.file_upload_start button:visible').click();
                        e.preventDefault();
                    });
            }
            uploadHandler.multiButtons.find('.file_upload_cancel:first')
                .button({icons: {primary: 'ui-icon-cancel'}})
                .click(function (e) {
                    uploadHandler.uploadTable.find('.file_upload_cancel button:visible').click();
                    e.preventDefault();
                });
            uploadHandler.multiButtons.find('.file_download_delete:first')
                .button({icons: {primary: 'ui-icon-trash'}})
                .click(function (e) {
                    uploadHandler.downloadTable.find('.file_download_delete button:visible').click();
                    e.preventDefault();
                });
        };

        this.loadFiles = function () {
            $.getJSON(uploadHandler.url, function (files) {
                $.each(files, function (index, file) {
                    uploadHandler.buildDownloadRow(file, uploadHandler)
                        .appendTo(uploadHandler.downloadTable).fadeIn();
                });
            });
        };

        this.initExtended = function () {
            uploadHandler.initDownloadHandler();
            uploadHandler.initDeleteHandler();
            uploadHandler.initMultiButtons();
            if (uploadHandler.loadFiles) {
                uploadHandler.loadFiles();
            }
        };

        this.destroyExtended = function () {
            uploadHandler.downloadTable.find('.file_download_delete button').die('click');
            uploadHandler.multiButtons.find('.file_upload_start:first').button('destroy').show();
            uploadHandler.multiButtons.find('.file_upload_cancel:first').button('destroy');
            uploadHandler.multiButtons.find('.file_download_delete:first').button('destroy');
        };

        $.extend(this, options);
    };

    methods = {
        init : function (options) {
            return this.each(function () {
                $(this).fileUploadUI(new UploadHandler($(this), options))
                    .fileUploadUI('option', 'initExtended', undefined, options.namespace)();
            });
        },
        
        option: function (option, value, namespace) {
            if (!option || (typeof option === 'string' && typeof value === 'undefined')) {
                return $(this).fileUpload('option', option, value, namespace);
            }
            return this.each(function () {
                $(this).fileUploadUI('option', option, value, namespace);
            });
        },
            
        destroy : function (namespace) {
            return this.each(function () {
                $(this).fileUploadUI('option', 'destroyExtended', undefined, namespace)();
                $(this).fileUploadUI('destroy', namespace);
            });
        },
        
        upload: function (files, namespace) {
            return this.each(function () {
                $(this).fileUploadUI('upload', files, namespace);
            });
        }
    };
    
    $.fn.fileUploadUIX = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method "' + method + '" does not exist on jQuery.fileUploadUIX');
        }
    };
    
}(jQuery));