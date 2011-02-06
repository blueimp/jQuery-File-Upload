jQuery File Upload Plugin
=========================

Demo
----
http://aquantum-demo.appspot.com/file-upload

Features
--------
  - Multiple file upload:
    Allows to select multiple files at once and upload them simultaneously.
  - Drag & Drop support:
    Allows to upload files by dragging them from your desktop or filemanager and dropping them on your browser window.
  - Upload progress bar:
    Shows a progress bar indicating the upload progress for individual files.
  - Cancelable uploads:
    Individual file uploads can be canceled to stop the upload progress.
  - No browser plugins (e.g. Adobe Flash) required:
    The implementation is based on open standards like HTML5 and JavaScript and requires no additional browser plugins.
  - Graceful fallback for legacy browsers:
    Uploads files via XMLHttpRequests if supported and uses iframes as fallback for legacy browsers.
  - HTML file upload form fallback:
    Shows a standard HTML file upload form if JavaScript is disabled.
  - Cross-site file uploads:
    Supports uploading files to a different domain with Cross-site XMLHttpRequests.
  - Multiple plugin instances:
    Allows to use multiple plugin instances on the same webpage.
  - Customizable and extensible:
    Provides an API to set individual options and define callBack methods for various upload events.
  - Multipart and file contents stream uploads:
    Files can be uploaded as standard "multipart/form-data" or file contents stream (HTTP PUT file upload).
  - Compatible with any server-side application platform:
    Works with Google App Engine (Python, Java), Ruby on Rails, PHP and any other platform that supports HTTP file uploads.

Example
-------
    <form class="upload" action="upload.php" method="POST" enctype="multipart/form-data">
        <input type="file" name="file" multiple>
        <button>Upload</button>
        <div>Upload files</div>
    </form>
    <table class="upload_files"></table>
    <table class="download_files"></table>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.0/jquery.min.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/jquery-ui.min.js"></script>
    <script src="../jquery.fileupload.js"></script>
    <script src="../jquery.fileupload-ui.js"></script>
    <script>
    /*global $ */
    $(function () {
        $('.upload').fileUploadUI({
            uploadTable: $('.upload_files'),
            downloadTable: $('.download_files'),
            buildUploadRow: function (files, index) {
                var file = files[index];
                return $('<tr><td>' + file.name + '<\/td>' +
                        '<td class="file_upload_progress"><div><\/div><\/td>' +
                        '<td class="file_upload_cancel">' +
                        '<div class="ui-state-default ui-corner-all ui-state-hover" title="Cancel">' +
                        '<span class="ui-icon ui-icon-cancel">Cancel<\/span>' +
                        '<\/div><\/td><\/tr>');
            },
            buildDownloadRow: function (file) {
                return $('<tr><td>' + file.name + '<\/td><\/tr>');
            }
        });
    });
    </script>


Requirements
------------
  - jQuery v. 1.4+
  - jQuery UI v. 1.8+ (optional)

Browser Support (tested versions)
---------------------------------
  - Google Chrome - 7.0, 8.0, 9.0
  - Apple Safari - 5.0 ¹
  - Mozilla Firefox - 3.6
  - Opera - 10.60 ², 11.00 ²
  - Microsoft Internet Explorer 6.0 ², 7.0 ², 8.0 ², 9.0 ²
¹ Drag & Drop is not supported on the Windows version of Safari.
² MSIE and Opera have no support for Drag & Drop, multiple file selection or upload progress indication.

License
-------
Released under the MIT license:
http://creativecommons.org/licenses/MIT/

Source Code & Download
----------------------
https://github.com/blueimp/jQuery-File-Upload

Documentation
-------------
https://github.com/blueimp/jQuery-File-Upload/wiki
