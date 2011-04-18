/*
 * jQuery File Upload Plugin JS Example 4.3.2
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
    $('#file_upload').fileUploadUIX({
        // The url to the upload handler script (required):
        url: 'upload.php',
        // The url path to the uploaded files directory (required):
        uploadDir: 'files/',
        // The url path to the thumbnail pictures directory (required):
        thumbnailsDir: 'thumbnails/',
        // Wait for user interaction before starting uploads:
        autoUpload: false,
        // Blob size setting for chunked uploads (remove or set to null to disable):
        maxChunkSize: 10000000,
        // Request uploaded filesize prior upload and upload remaining bytes:
        continueAbortedUploads: true,
        // Open download dialogs via iframes, to prevent aborting current uploads:
        forceIframeDownload: true
    });
});