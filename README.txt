jQuery File Upload Plugin
=========================

Demo
----
http://aquantum-demo.appspot.com/file-upload

Setup instructions
------------------
https://github.com/blueimp/jQuery-File-Upload/wiki/Setup

Features
--------
  - Multiple file upload:
    Allows to select multiple files at once and upload them simultaneously.
  - Drag & Drop support:
    Allows to upload files by dragging them from your desktop or filemanager and dropping them on your browser window.
  - Upload progress bar:
    Shows a progress bar indicating the upload progress for individual files and for all uploads combined.
  - Cancelable uploads:
    Individual file uploads can be canceled to stop the upload progress.
  - Resumable uploads:
    Aborted uploads can be resumed with browsers supporting the Blob API.
  - Chunked uploads:
    Large files can be uploaded in smaller chunks with browsers supporting the Blob API.
  - Preview images:
    A preview of image files can be displayed before uploading with browsers supporting the required HTML5 APIs.
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

Requirements
------------
  - jQuery v. 1.6+
  - jQuery UI v. 1.8+ (required: Widget, optional: Progressbar, Button)
  - jQuery Iframe Transport plugin (included)
  - jQuery Templates plugin v. 1.0+ (optional)

The jQuery UI widget factory is a requirement for the basic File Upload plugin, but very lightweight without any other dependencies. 
The UI version of the File Upload plugin also requires the jQuery UI Progressbar and Button components as well as the jQuery Templates plugin. These dependencies are marked as optional, as the basic File Upload plugin can be used without them and the UI version of the plugin can be extended to override these dependencies with alternative solutions.

Browser Support (tested versions)
---------------------------------
  - Google Chrome - 7.0+
  - Apple Safari - 4.0+
  - Mozilla Firefox - 3.0+
  - Opera - 10.0+
  - Microsoft Internet Explorer 6.0+

Drag & Drop is only supported on Google Chrome, Firefox 4.0+ and Safari 5.0+.  
Microsoft Internet Explorer has no support for multiple file selection or upload progress.  
Extended browser support information:
https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support

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

Donations
---------
jQuery File Upload is free software, but you can donate to support the developer, Sebastian Tschan:

flattr (€):
https://flattr.com/thing/286433/jQuery-File-Upload-Plugin

PayPal ($):
https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PYWYSYP77KL54
