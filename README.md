# jQuery File Upload Plugin

## Demo
[Demo File Upload](http://blueimp.github.io/jQuery-File-Upload/)

## Description
File Upload widget with multiple file selection, drag&amp;drop support, progress bars, validation and preview images, audio and video for jQuery.  
Supports cross-domain, chunked and resumable file uploads and client-side image resizing. Works with any server-side platform (PHP, Python, Ruby on Rails, Java, Node.js, Go etc.) that supports standard HTML form file uploads.

## Setup
* [How to setup the plugin on your website](https://github.com/blueimp/jQuery-File-Upload/wiki/Setup)
* [How to use only the basic plugin (minimal setup guide).](https://github.com/blueimp/jQuery-File-Upload/wiki/Basic-plugin)

## Support

* **[Support Forum](https://groups.google.com/d/forum/jquery-fileupload)**  
**Support requests** and **general discussions** about the File Upload plugin can be posted to the official
[Support Forum](https://groups.google.com/d/forum/jquery-fileupload).  
If your question is not directly related to the File Upload plugin, you might have a better chance to get a reply by posting to [Stack Overflow](http://stackoverflow.com/questions/tagged/blueimp+jquery+file-upload).

* Bugs and Feature requests  
**Bugs** and **Feature requests** can be reported using the [issues tracker](https://github.com/blueimp/jQuery-File-Upload/issues).  
Please read the [issue guidelines](https://github.com/blueimp/jQuery-File-Upload/blob/master/CONTRIBUTING.md) before posting.

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
* **Client-side image resizing:**  
  Images can be automatically resized on client-side with browsers supporting the required JS APIs.
* **Preview images, audio and video:**  
  A preview of image, audio and video files can be displayed before uploading with browsers supporting the required APIs.
* **No browser plugins (e.g. Adobe Flash) required:**  
  The implementation is based on open standards like HTML5 and JavaScript and requires no additional browser plugins.
* **Graceful fallback for legacy browsers:**  
  Uploads files via XMLHttpRequests if supported and uses iframes as fallback for legacy browsers.
* **HTML file upload form fallback:**  
  Allows progressive enhancement by using a standard HTML file upload form as widget element.
* **Cross-site file uploads:**  
  Supports uploading files to a different domain with cross-site XMLHttpRequests or iframe redirects.
* **Multiple plugin instances:**  
  Allows to use multiple plugin instances on the same webpage.
* **Customizable and extensible:**  
  Provides an API to set individual options and define callBack methods for various upload events.
* **Multipart and file contents stream uploads:**  
  Files can be uploaded as standard "multipart/form-data" or file contents stream (HTTP PUT file upload).
* **Compatible with any server-side application platform:**  
  Works with any server-side platform (PHP, Python, Ruby on Rails, Java, Node.js, Go etc.) that supports standard HTML form file uploads.

## Requirements

### Mandatory requirements
* [jQuery](http://jquery.com/) v. 1.6+
* [jQuery UI widget factory](http://api.jqueryui.com/jQuery.widget/) v. 1.9+ (included)
* [jQuery Iframe Transport plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/js/jquery.iframe-transport.js) (included)

The jQuery UI widget factory is a requirement for the basic File Upload plugin, but very lightweight without any other dependencies from the jQuery UI suite.

The jQuery Iframe Transport is required for [browsers without XHR file upload support](https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support).

### Optional requirements
* [JavaScript Templates engine](https://github.com/blueimp/JavaScript-Templates) v. 2.3.0+
* [JavaScript Load Image library](https://github.com/blueimp/JavaScript-Load-Image) v. 1.9.1+
* [JavaScript Canvas to Blob polyfill](https://github.com/blueimp/JavaScript-Canvas-to-Blob) v. 2.0.7+
* [blueimp Gallery](https://github.com/blueimp/Gallery) v. 2.7.1+
* [Bootstrap CSS Toolkit](https://github.com/twitter/bootstrap/) v. 2.3

The JavaScript Templates engine is used to render the selected and uploaded files for the Basic Plus UI and jQuery UI versions.

The JavaScript Load Image library and JavaScript Canvas to Blob polyfill are required for the image previews and resizing functionality.

The blueimp Gallery is used to display the uploaded images in a lightbox.

The user interface of all versions except the jQuery UI version is built with Twitter's [Bootstrap](https://github.com/twitter/bootstrap/) Toolkit.

### Cross-domain requirements
[Cross-domain File Uploads](https://github.com/blueimp/jQuery-File-Upload/wiki/Cross-domain-uploads) using the [Iframe Transport plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/js/jquery.iframe-transport.js) require a redirect back to the origin server to retrieve the upload results. The [example implementation](https://github.com/blueimp/jQuery-File-Upload/blob/master/js/main.js) makes use of [result.html](https://github.com/blueimp/jQuery-File-Upload/blob/master/cors/result.html) as a static redirect page for the origin server.

The repository also includes the [jQuery XDomainRequest Transport plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/js/cors/jquery.xdr-transport.js), which enables limited cross-domain AJAX requests in Microsoft Internet Explorer 8 and 9 (IE 10 supports cross-domain XHR requests).  
The XDomainRequest object allows GET and POST requests only and doesn't support file uploads. It is used on the [Demo](http://blueimp.github.io/jQuery-File-Upload/) to delete uploaded files from the cross-domain demo file upload service.

## Browsers

### Desktop browsers
The File Upload plugin is regularly tested with the latest browser versions and supports the following minimal versions:

* Google Chrome
* Apple Safari 4.0+
* Mozilla Firefox 3.0+
* Opera 11.0+
* Microsoft Internet Explorer 6.0+

### Mobile browsers
The File Upload plugin has been tested with and supports the following mobile browsers:

* Apple Safari on iOS 6.0+
* Google Chrome on iOS 6.0+
* Google Chrome on Android 4.0+
* Default Browser on Android 2.3+
* Opera Mobile 12.0+

### Supported features
For a detailed overview of the features supported by each browser version please have a look at the [Extended browser support information](https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support).

## License
Released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Donations
jQuery File Upload is free software, but you can donate to support the developer, Sebastian Tschan:

Flattr: [![Flattr](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/thing/286433/jQuery-File-Upload-Plugin)

PayPal: [![PayPal](https://www.paypalobjects.com/WEBSCR-640-20110429-1/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PYWYSYP77KL54)
