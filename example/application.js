/*
 * jQuery File Upload Plugin JS Example 4.4.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint unparam: true */
/*global $ */

$(function () {
    // Initialize jQuery File Upload (Extended User Interface Version):
    $('#file_upload').fileUploadUIX();
    
    // Load existing files:
    $.getJSON($('#file_upload').fileUploadUIX('option', 'url'), function (files) {
        var fileUploadOptions = $('#file_upload').fileUploadUIX('option');
        $.each(files, function (index, file) {
            fileUploadOptions.buildDownloadRow(file, fileUploadOptions)
                .appendTo(fileUploadOptions.downloadTable).fadeIn();
        });
    });
});