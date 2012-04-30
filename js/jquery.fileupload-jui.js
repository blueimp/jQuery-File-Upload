/*
 * jQuery File Upload jQuery UI Plugin 1.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true */
/*global define, window */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery', './jquery.fileupload-ui.js'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';
    $.widget('blueimpJUI.fileupload', $.blueimpUI.fileupload, {
        options: {
            sent: function (e, data) {
                if (data.context && data.dataType &&
                        data.dataType.substr(0, 6) === 'iframe') {
                    // Iframe Transport does not support progress events.
                    // In lack of an indeterminate progress bar, we set
                    // the progress to 100%, showing the full animated bar:
                    data.context
                        .find('.progress').progressbar(
                            'option',
                            'value',
                            100
                        );
                }
            },
            progress: function (e, data) {
                if (data.context) {
                    data.context.find('.progress').progressbar(
                        'option',
                        'value',
                        parseInt(data.loaded / data.total * 100, 10)
                    );
                }
            },
            progressall: function (e, data) {
                var $this = $(this);
                $this.find('.fileupload-progress')
                    .find('.progress').progressbar(
                        'option',
                        'value',
                        parseInt(data.loaded / data.total * 100, 10)
                    ).end()
                    .find('.progress-extended').each(function () {
                        $(this).html(
                            $this.data('fileupload')
                                ._renderExtendedProgress(data)
                        );
                    });
            }
        },
        _renderUpload: function (func, files) {
            var node = $.blueimpUI.fileupload.prototype
                ._renderUpload.call(this, func, files),
                showIconText = $(window).width() > 480;
            node.find('.progress').empty().progressbar();
            node.find('.start button').button({
                icons: {primary: 'ui-icon-circle-arrow-e'},
                text: showIconText
            });
            node.find('.cancel button').button({
                icons: {primary: 'ui-icon-cancel'},
                text: showIconText
            });
            return node;
        },
        _renderDownload: function (func, files) {
            var node = $.blueimpUI.fileupload.prototype
                ._renderDownload.call(this, func, files),
                showIconText = $(window).width() > 480;
            node.find('.delete button').button({
                icons: {primary: 'ui-icon-trash'},
                text: showIconText
            });
            return node;
        },
        _transition: function (node) {
            var that = this,
                deferred = $.Deferred();
            if (node.hasClass('fade')) {
                node.fadeToggle(function () {
                    deferred.resolveWith(node);
                });
            } else {
                deferred.resolveWith(node);
            }
            return deferred;
        },
        _create: function () {
            $.blueimpUI.fileupload.prototype._create.call(this);
            this.element
                .find('.fileupload-buttonbar')
                .find('.fileinput-button').each(function () {
                    var input = $(this).find('input:file').detach();
                    $(this)
                        .button({icons: {primary: 'ui-icon-plusthick'}})
                        .append(input);
                })
                .end().find('.start')
                .button({icons: {primary: 'ui-icon-circle-arrow-e'}})
                .end().find('.cancel')
                .button({icons: {primary: 'ui-icon-cancel'}})
                .end().find('.delete')
                .button({icons: {primary: 'ui-icon-trash'}})
                .end().find('.progress').empty().progressbar();
        },
        destroy: function () {
            this.element
                .find('.fileupload-buttonbar')
                .find('.fileinput-button').each(function () {
                    var input = $(this).find('input:file').detach();
                    $(this)
                        .button('destroy')
                        .append(input);
                })
                .end().find('.start')
                .button('destroy')
                .end().find('.cancel')
                .button('destroy')
                .end().find('.delete')
                .button('destroy')
                .end().find('.progress').progressbar('destroy');
            $.blueimpUI.fileupload.prototype.destroy.call(this);
        }
    });
}));
