/*
 * jQuery File Upload User Interface Plugin 6.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document, URL, webkitURL, FileReader */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery', 'tmpl', 'loadImage', './jquery.fileupload.js'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery, window.tmpl, window.loadImage);
    }
}(function ($, tmpl, loadImage) {
    'use strict';

    // The UI version extends the basic fileupload widget and adds
    // a complete user interface based on the given upload/download
    // templates.
    $.widget('blueimpUI.fileupload', $.blueimp.fileupload, {

        options: {
            // By default, files added to the widget are uploaded as soon
            // as the user clicks on the start buttons. To enable automatic
            // uploads, set the following option to true:
            autoUpload: false,
            // The following option limits the number of files that are
            // allowed to be uploaded using this widget:
            maxNumberOfFiles: undefined,
            // The maximum allowed file size:
            maxFileSize: undefined,
            // The minimum allowed file size:
            minFileSize: 1,
            // The regular expression for allowed file types, matches
            // against either file type or file name:
            acceptFileTypes:  /.+$/i,
            // The regular expression to define for which files a preview
            // image is shown, matched against the file type:
            previewFileTypes: /^image\/(gif|jpeg|png)$/,
            // The maximum file size for preview images:
            previewMaxFileSize: 5000000, // 5MB
            // The maximum width of the preview images:
            previewMaxWidth: 80,
            // The maximum height of the preview images:
            previewMaxHeight: 80,
            // By default, preview images are displayed as canvas elements
            // if supported by the browser. Set the following option to false
            // to always display preview images as img elements:
            previewAsCanvas: true,
            // The expected data type of the upload response, sets the dataType
            // option of the $.ajax upload requests:
            dataType: 'json',

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop or add API call).
            // See the basic file upload widget for more information:
            add: function (e, data) {
                var that = $(this).data('fileupload'),
                    files = data.files;
                that._adjustMaxNumberOfFiles(-files.length);
                data.isAdjusted = true;
                data.files.valid = data.isValidated = that._validate(files);
                data.context = that._renderUpload(files)
                    .appendTo(that._files)
                    .data('data', data);
                // Force reflow:
                that._reflow = that._transition && data.context[0].offsetWidth;
                data.context.addClass('in');
                if ((that.options.autoUpload || data.autoUpload) &&
                        data.isValidated) {
                    data.submit();
                }
            },
            // Callback for the start of each file upload request:
            send: function (e, data) {
                if (!data.isValidated) {
                    var that = $(this).data('fileupload');
                    if (!data.isAdjusted) {
                        that._adjustMaxNumberOfFiles(-data.files.length);
                    }
                    if (!that._validate(data.files)) {
                        return false;
                    }
                }
                if (data.context && data.dataType &&
                        data.dataType.substr(0, 6) === 'iframe') {
                    // Iframe Transport does not support progress events.
                    // In lack of an indeterminate progress bar, we set
                    // the progress to 100%, showing the full animated bar:
                    data.context.find('.progressbar div').css(
                        'width',
                        parseInt(100, 10) + '%'
                    );
                }
            },
            // Callback for successful uploads:
            done: function (e, data) {
                var that = $(this).data('fileupload'),
                    template,
                    preview;
                if (data.context) {
                    data.context.each(function (index) {
                        var file = ($.isArray(data.result) &&
                                data.result[index]) || {error: 'emptyResult'};
                        if (file.error) {
                            that._adjustMaxNumberOfFiles(1);
                        }
                        that._transitionCallback(
                            $(this).removeClass('in'),
                            function (node) {
                                template = that._renderDownload([file]);
                                preview = node
                                    .find('.preview img, .preview canvas');
                                if (preview.length) {
                                    template.find('.preview img')
                                        .prop('width', preview.prop('width'))
                                        .prop('height', preview.prop('height'));
                                }
                                template
                                    .replaceAll(node);
                                // Force reflow:
                                that._reflow = that._transition &&
                                    template[0].offsetWidth;
                                template.addClass('in');
                            }
                        );
                    });
                } else {
                    template = that._renderDownload(data.result)
                        .appendTo(that._files);
                    // Force reflow:
                    that._reflow = that._transition && template[0].offsetWidth;
                    template.addClass('in');
                }
            },
            // Callback for failed (abort or error) uploads:
            fail: function (e, data) {
                var that = $(this).data('fileupload'),
                    template;
                that._adjustMaxNumberOfFiles(data.files.length);
                if (data.context) {
                    data.context.each(function (index) {
                        if (data.errorThrown !== 'abort') {
                            var file = data.files[index];
                            file.error = file.error || data.errorThrown ||
                                true;
                            that._transitionCallback(
                                $(this).removeClass('in'),
                                function (node) {
                                    template = that._renderDownload([file])
                                        .replaceAll(node);
                                    // Force reflow:
                                    that._reflow = that._transition &&
                                        template[0].offsetWidth;
                                    template.addClass('in');
                                }
                            );
                        } else {
                            that._transitionCallback(
                                $(this).removeClass('in'),
                                function (node) {
                                    node.remove();
                                }
                            );
                        }
                    });
                } else if (data.errorThrown !== 'abort') {
                    that._adjustMaxNumberOfFiles(-data.files.length);
                    data.context = that._renderUpload(data.files)
                        .appendTo(that._files)
                        .data('data', data);
                    // Force reflow:
                    that._reflow = that._transition && data.context[0].offsetWidth;
                    data.context.addClass('in');
                }
            },
            // Callback for upload progress events:
            progress: function (e, data) {
                if (data.context) {
                    data.context.find('.progressbar div').css(
                        'width',
                        parseInt(data.loaded / data.total * 100, 10) + '%'
                    );
                }
            },
            // Callback for global upload progress events:
            progressall: function (e, data) {
                $(this).find('.fileupload-progressbar div').css(
                    'width',
                    parseInt(data.loaded / data.total * 100, 10) + '%'
                );
            },
            // Callback for uploads start, equivalent to the global ajaxStart event:
            start: function () {
                $(this).find('.fileupload-progressbar')
                    .addClass('in').find('div').css('width', '0%');
            },
            // Callback for uploads stop, equivalent to the global ajaxStop event:
            stop: function () {
                $(this).find('.fileupload-progressbar')
                    .removeClass('in').find('div').css('width', '0%');
            },
            // Callback for file deletion:
            destroy: function (e, data) {
                var that = $(this).data('fileupload');
                if (data.url) {
                    $.ajax(data);
                }
                that._adjustMaxNumberOfFiles(1);
                that._transitionCallback(
                    data.context.removeClass('in'),
                    function (node) {
                        node.remove();
                    }
                );
            }
        },

        // Link handler, that allows to download files
        // by drag & drop of the links to the desktop:
        _enableDragToDesktop: function () {
            var link = $(this),
                url = link.prop('href'),
                name = decodeURIComponent(url.split('/').pop())
                    .replace(/:/g, '-'),
                type = 'application/octet-stream';
            link.bind('dragstart', function (e) {
                try {
                    e.originalEvent.dataTransfer.setData(
                        'DownloadURL',
                        [type, name, url].join(':')
                    );
                } catch (err) {}
            });
        },

        _adjustMaxNumberOfFiles: function (operand) {
            if (typeof this.options.maxNumberOfFiles === 'number') {
                this.options.maxNumberOfFiles += operand;
                if (this.options.maxNumberOfFiles < 1) {
                    this._disableFileInputButton();
                } else {
                    this._enableFileInputButton();
                }
            }
        },

        _formatFileSize: function (bytes) {
            if (typeof bytes !== 'number') {
                return '';
            }
            if (bytes >= 1000000000) {
                return (bytes / 1000000000).toFixed(2) + ' GB';
            }
            if (bytes >= 1000000) {
                return (bytes / 1000000).toFixed(2) + ' MB';
            }
            return (bytes / 1000).toFixed(2) + ' KB';
        },

        _hasError: function (file) {
            if (file.error) {
                return file.error;
            }
            // The number of added files is subtracted from
            // maxNumberOfFiles before validation, so we check if
            // maxNumberOfFiles is below 0 (instead of below 1):
            if (this.options.maxNumberOfFiles < 0) {
                return 'maxNumberOfFiles';
            }
            // Files are accepted if either the file type or the file name
            // matches against the acceptFileTypes regular expression, as
            // only browsers with support for the File API report the type:
            if (!(this.options.acceptFileTypes.test(file.type) ||
                    this.options.acceptFileTypes.test(file.name))) {
                return 'acceptFileTypes';
            }
            if (this.options.maxFileSize &&
                    file.size > this.options.maxFileSize) {
                return 'maxFileSize';
            }
            if (typeof file.size === 'number' &&
                    file.size < this.options.minFileSize) {
                return 'minFileSize';
            }
            return null;
        },

        _validate: function (files) {
            var that = this,
                valid = !!files.length;
            $.each(files, function (index, file) {
                file.error = that._hasError(file);
                if (file.error) {
                    valid = false;
                }
            });
            return valid;
        },

        _renderTemplate: function (func, files) {
            return $(this.options.templateContainer).html(func({
                files: files,
                formatFileSize: this._formatFileSize,
                options: this.options
            })).children();
        },

        _renderUpload: function (files) {
            var that = this,
                options = this.options,
                nodes = this._renderTemplate(options.uploadTemplate, files);
            nodes.find('.preview span').each(function (index, node) {
                var file = files[index];
                if (options.previewFileTypes.test(file.type) &&
                        (!options.previewMaxFileSize ||
                        file.size < options.previewMaxFileSize)) {
                    loadImage(
                        files[index],
                        function (img) {
                            $(node).append(img);
                            // Force reflow:
                            that._reflow = that._transition &&
                                node.offsetWidth;
                            $(node).addClass('in');
                        },
                        {
                            maxWidth: options.previewMaxWidth,
                            maxHeight: options.previewMaxHeight,
                            canvas: options.previewAsCanvas
                        }
                    );
                }
            });
            return nodes;
        },

        _renderDownload: function (files) {
            var nodes = this._renderTemplate(
                this.options.downloadTemplate,
                files
            );
            nodes.find('a').each(this._enableDragToDesktop);
            return nodes;
        },

        _startHandler: function (e) {
            e.preventDefault();
            var button = $(this),
                template = button.closest('.template-upload'),
                data = template.data('data');
            if (data && data.submit && !data.jqXHR && data.submit()) {
                button.prop('disabled', true);
            }
        },

        _cancelHandler: function (e) {
            e.preventDefault();
            var template = $(this).closest('.template-upload'),
                data = template.data('data') || {};
            if (!data.jqXHR) {
                data.errorThrown = 'abort';
                e.data.fileupload._trigger('fail', e, data);
            } else {
                data.jqXHR.abort();
            }
        },

        _deleteHandler: function (e) {
            e.preventDefault();
            var button = $(this);
            e.data.fileupload._trigger('destroy', e, {
                context: button.closest('.template-download'),
                url: button.attr('data-url'),
                type: button.attr('data-type'),
                dataType: e.data.fileupload.options.dataType
            });
        },

        _transitionCallback: function (node, callback) {
            var that = this;
            if (this._transition && node.hasClass('fade')) {
                node.bind(
                    this._transitionEnd,
                    function (e) {
                        // Make sure we don't respond to other transitions events
                        // in the container element, e.g. from button elements:
                        if (e.target === node[0]) {
                            node.unbind(that._transitionEnd);
                            callback.call(that, node);
                        }
                    }
                );
            } else {
                callback.call(this, node);
            }
        },

        _initTransitionSupport: function () {
            var that = this,
                style = (document.body || document.documentElement).style,
                suffix = '.' + that.options.namespace;
            that._transition = style.transition !== undefined ||
                style.WebkitTransition !== undefined ||
                style.MozTransition !== undefined ||
                style.MsTransition !== undefined ||
                style.OTransition !== undefined;
            if (that._transition) {
                that._transitionEnd = [
                    'MSTransitionEnd',
                    'webkitTransitionEnd',
                    'transitionend',
                    'oTransitionEnd'
                ].join(suffix + ' ') + suffix;
            }
        },

        _initButtonBarEventHandlers: function () {
            var fileUploadButtonBar = this.element.find('.fileupload-buttonbar'),
                filesList = this._files,
                ns = this.options.namespace;
            fileUploadButtonBar.find('.start')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.start button').click();
                });
            fileUploadButtonBar.find('.cancel')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.cancel button').click();
                });
            fileUploadButtonBar.find('.delete')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.delete input:checked')
                        .siblings('button').click();
                });
            fileUploadButtonBar.find('.toggle')
                .bind('change.' + ns, function (e) {
                    filesList.find('.delete input').prop(
                        'checked',
                        $(this).is(':checked')
                    );
                });
        },

        _destroyButtonBarEventHandlers: function () {
            this.element.find('.fileupload-buttonbar button')
                .unbind('click.' + this.options.namespace);
            this.element.find('.fileupload-buttonbar .toggle')
                .unbind('change.' + this.options.namespace);
        },

        _initEventHandlers: function () {
            $.blueimp.fileupload.prototype._initEventHandlers.call(this);
            var eventData = {fileupload: this};
            this._files
                .delegate(
                    '.start button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._startHandler
                )
                .delegate(
                    '.cancel button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._cancelHandler
                )
                .delegate(
                    '.delete button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._deleteHandler
                );
            this._initButtonBarEventHandlers();
            this._initTransitionSupport();
        },

        _destroyEventHandlers: function () {
            this._destroyButtonBarEventHandlers();
            this._files
                .undelegate('.start button', 'click.' + this.options.namespace)
                .undelegate('.cancel button', 'click.' + this.options.namespace)
                .undelegate('.delete button', 'click.' + this.options.namespace);
            $.blueimp.fileupload.prototype._destroyEventHandlers.call(this);
        },

        _enableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', false)
                .parent().removeClass('disabled');
        },

        _disableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', true)
                .parent().addClass('disabled');
        },

        _initTemplates: function () {
            this.options.templateContainer = document.createElement(
                this._files.prop('nodeName')
            );
            this.options.uploadTemplate = tmpl('template-upload');
            this.options.downloadTemplate = tmpl('template-download');
        },

        _initFiles: function () {
            this._files = this.element.find('.files');
        },

        _create: function () {
            this._initFiles();
            $.blueimp.fileupload.prototype._create.call(this);
            this._initTemplates();
        },

        destroy: function () {
            $.blueimp.fileupload.prototype.destroy.call(this);
        },

        enable: function () {
            $.blueimp.fileupload.prototype.enable.call(this);
            this.element.find('input, button').prop('disabled', false);
            this._enableFileInputButton();
        },

        disable: function () {
            this.element.find('input, button').prop('disabled', true);
            this._disableFileInputButton();
            $.blueimp.fileupload.prototype.disable.call(this);
        }

    });

}));
