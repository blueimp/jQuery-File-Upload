# jQuery File Upload Plugin

## Demo
[Demo File Upload](http://blueimp.github.com/jQuery-File-Upload/)

## Setup instructions
* [How to setup the plugin on your website](https://github.com/blueimp/jQuery-File-Upload/wiki/Setup)
* [How to use only the basic plugin (minimal setup guide).](https://github.com/blueimp/jQuery-File-Upload/wiki/Basic-plugin)

## Features
* **Multiple file upload:**  
  Allows to select multiple files at once and upload them simultaneously.
* **Drag & Drop support:**  
  Allows to upload files by dragging them from your desktop or filemanager and dropping them on your browser window.
* **Upload progress bar:**  
  Shows a progress bar indicating the upload progress for individual files and for all uploads combined.
* **Cancelable uploads:**  
  Individual file uploads can be canceled to stop the upload progress.
* **Resumable uploads:**  
  Aborted uploads can be resumed with browsers supporting the Blob API.
* **Chunked uploads:**  
  Large files can be uploaded in smaller chunks with browsers supporting the Blob API.
* **Preview images:**  
  A preview of image files can be displayed before uploading with browsers supporting the required HTML5 APIs.
* **No browser plugins (e.g. Adobe Flash) required:**  
  The implementation is based on open standards like HTML5 and JavaScript and requires no additional browser plugins.
* **Graceful fallback for legacy browsers:**  
  Uploads files via XMLHttpRequests if supported and uses iframes as fallback for legacy browsers.
* **HTML file upload form fallback:**  
  Shows a standard HTML file upload form if JavaScript is disabled.
* **Cross-site file uploads:**  
  Supports uploading files to a different domain with Cross-site XMLHttpRequests.
* **Multiple plugin instances:**  
  Allows to use multiple plugin instances on the same webpage.
* **Customizable and extensible:**  
  Provides an API to set individual options and define callBack methods for various upload events.
* **Multipart and file contents stream uploads:**  
  Files can be uploaded as standard "multipart/form-data" or file contents stream (HTTP PUT file upload).
* **Compatible with any server-side application platform:**  
  Works with Google App Engine (Python, Java), Ruby on Rails, PHP and any other platform that supports HTTP file uploads.

## Requirements
* [jQuery](http://jquery.com/) v. 1.6+
* [jQuery UI widget factory](http://wiki.jqueryui.com/w/page/12138135/Widget%20factory) v. 1.8.16+
* [jQuery Iframe Transport plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/jquery.iframe-transport.js) (included)
* [JavaScript Load Image function](http://blueimp.github.com/JavaScript-Load-Image) v. 1.1.3+ (optional)
* [JavaScript Templates engine](https://github.com/blueimp/JavaScript-Templates) v. 1.0.2+ (optional)

The jQuery UI widget factory is a requirement for the basic File Upload plugin, but very lightweight without any other dependencies. 
The UI version of the File Upload plugin also requires the JavaScript Templates engine and the JavaScript Load Image function (for the upload image previews). These dependencies are marked as optional, as the basic File Upload plugin can be used without them and the UI version of the plugin can be extended to override these dependencies with alternative solutions.

The repository also includes the [jQuery XDomainRequest Transport Plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/cors/jquery.xdr-transport.js), which is required for Cross-domain AJAX requests in Microsoft Internet Explorer >= 8. It is only included for the [Demo](http://blueimp.github.com/jQuery-File-Upload/), which makes use of Cross-domain DELETE requests (GET requests for IE) to delete uploaded files from the Demo File Upload service.

[Cross-domain File Uploads](https://github.com/blueimp/jQuery-File-Upload/wiki/Cross-domain-uploads) using the [Iframe Transport plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/jquery.iframe-transport.js) require a redirect back to the origin server to retrieve the upload results. The example implementation makes use of [result.html](https://github.com/blueimp/jQuery-File-Upload/blob/master/cors/result.html) as redirect page. See also the example code in [application.js](https://github.com/blueimp/jQuery-File-Upload/blob/master/application.js) as well as the explanation of all [files in the repository](https://github.com/blueimp/jQuery-File-Upload/wiki/Plugin-files).

## Browser Support (tested versions)
* Google Chrome - 7.0+
* Apple Safari - 4.0+
* Mozilla Firefox - 3.0+
* Opera - 10.0+
* Microsoft Internet Explorer 6.0+

Drag & Drop is only supported on Google Chrome, Firefox 4.0+ and Safari 5.0+.  
Microsoft Internet Explorer has no support for multiple file selection or upload progress.  
[Extended browser support information](https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support).

## License
Released under the [MIT license](http://www.opensource.org/licenses/MIT).
