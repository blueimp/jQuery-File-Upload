/*
 * jQuery File Upload Plugin JS Example 4.4
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*global $ */

$(function () {
    // Initialize jQuery File Upload (Extended User Interface Version):
    $('#file_upload').fileUploadUIX({
        // Wait for user interaction before starting uploads:
        autoUpload: false,
        // Upload bigger files in chunks of 10 MB (remove or set to null to disable):
        maxChunkSize: 10000000,
        // Request uploaded filesize prior upload and upload remaining bytes:
        continueAbortedUploads: true,
        // Open download dialogs via iframes, to prevent aborting current uploads:
        forceIframeDownload: true
    });
    
    // Load existing files:
    $.getJSON($('#file_upload').fileUploadUIX('option', 'url'), function (files) {
        var fileUploadOptions = $('#file_upload').fileUploadUIX('option');
        $.each(files, function (index, file) {
            fileUploadOptions.buildDownloadRow(file, fileUploadOptions)
                .appendTo(fileUploadOptions.downloadTable).fadeIn();
        });
    });
});