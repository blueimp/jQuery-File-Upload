/*
 * jQuery File Upload Plugin JS Example 6.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

$(function () {
    'use strict';

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload();

    if (window.location.hostname === 'blueimp.github.com') {
        // Demo settings:
        $('#fileupload').fileupload('option', {
            url: '//jquery-file-upload.appspot.com',
            maxFileSize: 5000000,
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
        });
        $.get('//jquery-file-upload.appspot.com').fail(function () {
            $('<span class="alert alert-error"/>')
                .text('Upload server currently unavailable - ' + new Date())
                .appendTo('#fileupload');
        });
    } else {
        // Load existing files:
        $.getJSON($('#fileupload').prop('action'), function (files) {
            var fu = $('#fileupload').data('fileupload'),
                template;
            fu._adjustMaxNumberOfFiles(-files.length);
            template = fu._renderDownload(files)
                .appendTo($('#fileupload .files'));
            // Force reflow:
            fu._reflow = $.support.transition && template.length &&
                template[0].offsetWidth;
            template.addClass('in');
        });
    }

    // Enable iframe cross-domain access via redirect page:
    var redirectPage = window.location.href.replace(
        /\/[^\/]*$/,
        '/cors/result.html?%s'
    );
    $('#fileupload').bind('fileuploadsend', function (e, data) {
        if (data.dataType.substr(0, 6) === 'iframe') {
            var target = $('<a/>').prop('href', data.url)[0];
            if (window.location.host !== target.host) {
                data.formData.push({
                    name: 'redirect',
                    value: redirectPage
                });
            }
        }
    });

    // Open download dialogs via iframes,
    // to prevent aborting current uploads:
    $('#fileupload .files').delegate(
        'a:not([rel^=gallery])',
        'click',
        function (e) {
            e.preventDefault();
            $('<iframe style="display:none;"></iframe>')
                .prop('src', this.href)
                .appendTo(document.body);
        }
    );

});
