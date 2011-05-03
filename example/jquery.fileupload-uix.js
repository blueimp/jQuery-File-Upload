/*
 * jQuery File Upload User Interface Extended Plugin 4.6
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint regexp: false, unparam: true */
/*global jQuery */

(function ($) {
    'use strict';

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

        this.locale = {};
        this.maxFileSize = null;
        this.minFileSize = 1;
        this.maxNumberOfFiles = null;
        this.acceptFileTypes = /.+$/i;
        this.autoUpload = false;
        this.forceIframeDownload = true;
        this.url = container.find('form:first').attr('action');
        this.dropZone = container.find('form:first');
        this.uploadTable = container.find('.files:first');
        this.downloadTable = this.uploadTable;
        this.progressAllNode = container.find('.file_upload_overall_progress div:first');
        this.uploadTemplate = this.uploadTable.find('.file_upload_template:first');
        this.downloadTemplate = this.uploadTable.find('.file_download_template:first');
        this.multiButtons = container.find('.file_upload_buttons:first');
        
        this.adjustMaxNumberOfFiles = function (operand) {
            var number = container.fileUploadUIX('option', 'maxNumberOfFiles');
            if (typeof number === 'number') {
                container.fileUploadUIX('option', 'maxNumberOfFiles', number + operand);
            }
        };
        
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

        this.buildMultiUploadRow = function (files, handler) {
            var rows = $('<tbody style="display:none;"/>');
            $.each(files, function (index, file) {
                var row = handler.buildUploadRow(files, index, handler).show(),
                    cells = row.find(
                        '.file_upload_progress, .file_upload_start, .file_upload_cancel'
                    );
                if (index) {
                    cells.remove();
                } else {
                    cells.attr('rowspan', files.length);
                }
                rows.append(row);
            });
            return rows;
        };

        this.buildUploadRow = function (files, index, handler) {
            if (typeof index !== 'number') {
                return handler.buildMultiUploadRow(files, handler);
            }
            var file = files[index],
                fileName = handler.formatFileName(file.name),
                uploadRow = handler.uploadTemplate
                    .clone().removeAttr('id');
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
            return file.url;
        };
        
        this.getThumbnailUrl = function (file, handler) {
            return file.thumbnail;
        };

        this.buildMultiDownloadRow = function (files, handler) {
            var rows = $('<tbody style="display:none;"/>');
            $.each(files, function (index, file) {
                rows.append(handler.buildDownloadRow(file, handler).show());
            });
            return rows;
        };

        this.buildDownloadRow = function (file, handler) {
            if ($.isArray(file)) {
                return handler.buildMultiDownloadRow(file, handler);
            }
            var fileName = handler.formatFileName(file.name),
                fileUrl = handler.getFileUrl(file, handler),
                thumbnailUrl = handler.getThumbnailUrl(file, handler),
                downloadRow = handler.downloadTemplate
                    .clone().removeAttr('id');
            downloadRow.attr('data-id', file.id || file.name);
            downloadRow.find('.file_name a')
                .text(fileName);
            downloadRow.find('.file_size')
                .text(handler.formatFileSize(file.size));
            if (thumbnailUrl) {
                downloadRow.find('.file_download_preview').append(
                    $('<a/>').append($('<img/>').attr('src', thumbnailUrl))
                );
                downloadRow.find('a').attr('target', '_blank');
            }
            downloadRow.find('a')
                .attr('href', fileUrl || null)
                .each(handler.enableDragToDesktop);
            downloadRow.find('.file_download_delete button')
                .button({icons: {primary: 'ui-icon-trash'}, text: false});
            return downloadRow;
        };
        
        this.onError = function (event, files, index, xhr, handler) {
            handler.uploadRow.addClass('file_upload_error')
                .find('.file_upload_progress').append($('<div class="error"/>').append(
                    handler.locale[event] || event
                ));
        };
        
        this.validate = function (event, files, index, xhr, handler) {
            var isValid = true,
                file;
            if (typeof index !== 'number') {
                $.each(files, function (index, file) {
                    isValid = handler.validate(event, files, index, xhr, handler);
                });
            } else {
                file = files[index];
                if (handler.maxFileSize && file.size > handler.maxFileSize) {
                    handler.onError('File is too big', files, index, xhr, handler);
                    isValid = false;
                } else if (typeof file.size === 'number' && file.size < handler.minFileSize) {
                    handler.onError('File is too small', files, index, xhr, handler);
                    isValid = false;
                }
                if (!(handler.acceptFileTypes.test(file.type) ||
                        handler.acceptFileTypes.test(file.name))) {
                    handler.onError('Filetype not allowed', files, index, xhr, handler);
                    isValid = false;
                }
                if (typeof handler.maxNumberOfFiles === 'number' &&
                        handler.maxNumberOfFiles < index + 1) {
                    handler.onError('Max number exceeded', files, index, xhr, handler);
                    isValid = false;
                }
            }
            return isValid;
        };

        this.uploadCallBack = function (event, files, index, xhr, handler, callBack) {
            callBack();
        };
        
        this.beforeSend = function (event, files, index, xhr, handler, callBack) {
            if (!handler.validate(event, files, index, xhr, handler)) {
                return;
            }
            var number = typeof index === 'number' ? 1 : files.length;
            handler.adjustMaxNumberOfFiles(-number);
            handler.uploadRow.find(handler.cancelSelector).click(function (e) {
                handler.adjustMaxNumberOfFiles(number);
            });
            if (handler.autoUpload) {
                handler.uploadCallBack(event, files, index, xhr, handler, callBack);
            } else {
                handler.uploadRow.find('.file_upload_start button').click(function (e) {
                    $(this).fadeOut();
                    handler.uploadCallBack(event, files, index, xhr, handler, callBack);
                    e.preventDefault();
                });
            }
        };

        this.downloadHandler = function (e) {
            if (uploadHandler.forceIframeDownload) {
                // Open download dialogs via iframes, to prevent aborting current uploads:
                $('<iframe style="display:none;"/>')
                    .attr('src', this.href)
                    .appendTo(container);
                e.preventDefault();
            }
        };

        this.deleteHandler = function (e) {
            var row = $(this).closest('tr');
            $.ajax({
                url: uploadHandler.url + '?file=' + encodeURIComponent(
                    row.attr('data-id')
                ),
                type: 'DELETE',
                success: function () {
                    uploadHandler.adjustMaxNumberOfFiles(1);
                    row.fadeOut(function () {
                        row.remove();
                    });
                }
            });
            e.preventDefault();
        };
        
        this.initEventHandlers = function () {
            uploadHandler.downloadTable.find('a:not([target="_blank"])')
                .live('click', uploadHandler.downloadHandler);
            uploadHandler.downloadTable.find('.file_download_delete button')
                .live('click', uploadHandler.deleteHandler);
        };

        this.destroyEventHandlers = function () {
            uploadHandler.downloadTable.find('a:not([target="_blank"])')
                .die('click', uploadHandler.downloadHandler);
            uploadHandler.downloadTable.find('.file_download_delete button')
                .die('click', uploadHandler.deleteHandler);
        };
        
        this.multiButtonHandler = function (e) {
            uploadHandler.uploadTable.find(e.data.selector + ' button:visible').click();
            e.preventDefault();
        };
        
        this.initMultiButtons = function () {
            if (uploadHandler.autoUpload) {
                uploadHandler.multiButtons.find('.file_upload_start:first').hide();
            } else {
                uploadHandler.multiButtons.find('.file_upload_start:first')
                    .button({icons: {primary: 'ui-icon-circle-arrow-e'}})
                    .bind('click', {selector: '.file_upload_start'}, uploadHandler.multiButtonHandler);
            }
            uploadHandler.multiButtons.find('.file_upload_cancel:first')
                .button({icons: {primary: 'ui-icon-cancel'}})
                .bind('click', {selector: '.file_upload_cancel'}, uploadHandler.multiButtonHandler);
            uploadHandler.multiButtons.find('.file_download_delete:first')
                .button({icons: {primary: 'ui-icon-trash'}})
                .bind('click', {selector: '.file_download_delete'}, uploadHandler.multiButtonHandler);
        };
        
        this.destroyMultiButtons = function () {
            uploadHandler.multiButtons.find(
                '.file_upload_start:first, .file_upload_cancel:first, .file_download_delete:first'
            ).unbind('click', uploadHandler.multiButtonHandler).button('destroy').show();
        };

        this.initExtended = function () {
            uploadHandler.initEventHandlers();
            uploadHandler.initMultiButtons();
        };

        this.destroyExtended = function () {
            uploadHandler.destroyEventHandlers();
            uploadHandler.destroyMultiButtons();
        };

        $.extend(this, options);
    };

    methods = {
        init : function (options) {
            return this.each(function () {
                $(this).fileUploadUI(new UploadHandler($(this), options));
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