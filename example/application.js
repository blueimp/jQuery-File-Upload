/*
 * jQuery File Upload Plugin JS Example 4.3
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
        url: 'upload.php',
        uploadDir: 'files/',
        thumbnailsDir: 'thumbnails/',
        autoUpload: false
    });
});