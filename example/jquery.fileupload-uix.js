/*
 * jQuery File Upload User Interface Extended Plugin 4.3
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
                $(this)
                    .addClass('ui-button ui-widget ui-state-default ui-corner-all')
                    .addClass(
                        options.text === false ? 'ui-button-icon-only' : 'ui-button-text-icon-primary'
                    )
                    .html($('<span class="ui-button-text"/>').text($(this).text()))
                    .prepend(
                        $('<span class="ui-button-icon-primary ui-icon"/>')
                            .addClass(options.icons.primary)
                    );
            });
        };
    }
        
    UploadHandler = function (container, options) {
        var uploadHandler = this;

        this.uploadDir = this.thumbnailsDir = null;
        this.autoUpload = true;
        this.maxChunkSize = 10000000;
        this.dropZone = container.find('form:first');
        this.uploadTable = container.find('.files:first');
        this.downloadTable = this.uploadTable;
        this.progressAllNode = container.find('.file_upload_overall_progress div:first');
        this.uploadTemplate = this.uploadTable.find('.file_upload_template:first');
        this.downloadTemplate = this.uploadTable.find('.file_download_template:first');
        this.buttons = container.find('.file_upload_buttons:first');
        
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
                encodedFileName = encodeURIComponent(fileName),
                uploadRow = handler.uploadTemplate
                    .clone().removeAttr('id')
                    .attr('data-file-id', encodedFileName);
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

        this.buildDownloadRow = function (file, handler) {
            var encodedFileName = encodeURIComponent(file.name),
                filePath = handler.uploadDir + encodedFileName,
                thumbnailPath = handler.thumbnailsDir + encodedFileName,
                downloadRow = handler.downloadTemplate
                    .clone().removeAttr('id')
                    .attr('data-file-id', encodedFileName);
            downloadRow.find('.file_name a')
                .text(file.name).attr('href', filePath);
            downloadRow.find('.file_size')
                .text(handler.formatFileSize(file.size));
            if (file.thumbnail) {
                downloadRow.find('.file_download_preview').append(
                    $('<a href="' + filePath + '"><img src="' + thumbnailPath + '"/></a>')
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
            $.getJSON(
                handler.url,
                {file: handler.uploadRow.attr('data-file-id')},
                function (file) {
                    if (file && file.size !== files[index].size) {
                        handler.uploadedBytes = file.size;
                    }
                    callBack();
                }
            );
        };
        
        this.beforeSend = function (event, files, index, xhr, handler, callBack) {
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

        this.loadFiles = function () {
            $.getJSON(uploadHandler.url, function (files) {
                $.each(files, function (index, file) {
                    uploadHandler.buildDownloadRow(file, uploadHandler)
                        .appendTo(uploadHandler.downloadTable).fadeIn();
                });
            });
        };

        this.initExtended = function () {
            container.find('.file_download_delete button').live('click', function (e) {
                var row = $(this).closest('tr');
                $.ajax(uploadHandler.url + '?file=' + row.attr('data-file-id'), {
                    type: 'DELETE',
                    success: function () {
                        row.fadeOut(function () {
                            row.remove();
                        });
                    }
                });
                e.preventDefault();
            });
            uploadHandler.buttons.find('.file_upload_start:first')
                .button({icons: {primary: 'ui-icon-circle-arrow-e'}})
                .click(function (e) {
                    uploadHandler.uploadTable.find('.file_upload_start button:visible').click();
                    e.preventDefault();
                });
            uploadHandler.buttons.find('.file_upload_cancel:first')
                .button({icons: {primary: 'ui-icon-cancel'}})
                .click(function (e) {
                    uploadHandler.uploadTable.find('.file_upload_cancel button:visible').click();
                    e.preventDefault();
                });
            uploadHandler.buttons.find('.file_download_delete:first')
                .button({icons: {primary: 'ui-icon-trash'}})
                .click(function (e) {
                    uploadHandler.downloadTable.find('.file_download_delete button:visible').click();
                    e.preventDefault();
                });
            if (uploadHandler.loadFiles) {
                uploadHandler.loadFiles();
            }
        };

        this.destroyExtended = function () {
            container.find('.file_download_delete button').die('click');
            uploadHandler.buttons.find('.file_upload_start:first').button('destroy');
            uploadHandler.buttons.find('.file_upload_cancel:first').button('destroy');
            uploadHandler.buttons.find('.file_download_delete:first').button('destroy');
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