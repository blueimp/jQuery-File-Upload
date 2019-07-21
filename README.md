# jQuery File Upload

## Contents

- [Description](#description)
- [Demo](#demo)
- [Features](#features)
- [Security](#security)
- [Setup](#setup)
- [Requirements](#requirements)
  - [Mandatory requirements](#mandatory-requirements)
  - [Optional requirements](#optional-requirements)
  - [Cross-domain requirements](#cross-domain-requirements)
- [Browsers](#browsers)
  - [Desktop browsers](#desktop-browsers)
  - [Mobile browsers](#mobile-browsers)
  - [Extended browser support information](#extended-browser-support-information)
- [Testing](#testing)
- [Support](#support)
- [License](#license)

## Description

> File Upload widget with multiple file selection, drag&amp;drop support,
> progress bars, validation and preview images, audio and video for jQuery.  
> Supports cross-domain, chunked and resumable file uploads and client-side
> image resizing.  
> Works with any server-side platform (PHP, Python, Ruby on Rails, Java,
> Node.js, Go etc.) that supports standard HTML form file uploads.

## Demo

[Demo File Upload](https://blueimp.github.io/jQuery-File-Upload/)

## Features

- **Multiple file upload:**  
  Allows to select multiple files at once and upload them simultaneously.
- **Drag & Drop support:**  
  Allows to upload files by dragging them from your desktop or file manager and
  dropping them on your browser window.
- **Upload progress bar:**  
  Shows a progress bar indicating the upload progress for individual files and
  for all uploads combined.
- **Cancelable uploads:**  
  Individual file uploads can be canceled to stop the upload progress.
- **Resumable uploads:**  
  Aborted uploads can be resumed with browsers supporting the Blob API.
- **Chunked uploads:**  
  Large files can be uploaded in smaller chunks with browsers supporting the
  Blob API.
- **Client-side image resizing:**  
  Images can be automatically resized on client-side with browsers supporting
  the required JS APIs.
- **Preview images, audio and video:**  
  A preview of image, audio and video files can be displayed before uploading
  with browsers supporting the required APIs.
- **No browser plugins (e.g. Adobe Flash) required:**  
  The implementation is based on open standards like HTML5 and JavaScript and
  requires no additional browser plugins.
- **Graceful fallback for legacy browsers:**  
  Uploads files via XMLHttpRequests if supported and uses iframes as fallback
  for legacy browsers.
- **HTML file upload form fallback:**  
  Allows progressive enhancement by using a standard HTML file upload form as
  widget element.
- **Cross-site file uploads:**  
  Supports uploading files to a different domain with cross-site XMLHttpRequests
  or iframe redirects.
- **Multiple plugin instances:**  
  Allows to use multiple plugin instances on the same webpage.
- **Customizable and extensible:**  
  Provides an API to set individual options and define callback methods for
  various upload events.
- **Multipart and file contents stream uploads:**  
  Files can be uploaded as standard "multipart/form-data" or file contents
  stream (HTTP PUT file upload).
- **Compatible with any server-side application platform:**  
  Works with any server-side platform (PHP, Python, Ruby on Rails, Java,
  Node.js, Go etc.) that supports standard HTML form file uploads.

## Security

⚠️ Please read the [VULNERABILITIES](VULNERABILITIES.md) document for a list of
fixed vulnerabilities

Please also read the [SECURITY](SECURITY.md) document for instructions on how to
securely configure your Webserver for file uploads.

## Setup

jQuery File Upload can be installed via [NPM](https://www.npmjs.com/):

```sh
npm install blueimp-file-upload
```

This allows you to include [jquery.fileupload.js](js/jquery.fileupload.js) and
its extensions via `node_modules`, e.g:

```html
<script src="node_modules/blueimp-file-upload/js/jquery.fileupload.js"></script>
```

The widget can then be initialized on a file upload form the following way:

```js
$('#fileupload').fileupload();
```

For further information, please refer to the following guides:

- [Main documentation page](https://github.com/blueimp/jQuery-File-Upload/wiki)
- [List of all available Options](https://github.com/blueimp/jQuery-File-Upload/wiki/Options)
- [The plugin API](https://github.com/blueimp/jQuery-File-Upload/wiki/API)
- [How to setup the plugin on your website](https://github.com/blueimp/jQuery-File-Upload/wiki/Setup)
- [How to use only the basic plugin.](https://github.com/blueimp/jQuery-File-Upload/wiki/Basic-plugin)

## Requirements

### Mandatory requirements

- [jQuery](https://jquery.com/) v1.6+
- [jQuery UI widget factory](https://api.jqueryui.com/jQuery.widget/) v1.9+
  (included): Required for the basic File Upload plugin, but very lightweight
  without any other dependencies from the jQuery UI suite.
- [jQuery Iframe Transport plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/js/jquery.iframe-transport.js)
  (included): Required for
  [browsers without XHR file upload support](https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support).

### Optional requirements

- [JavaScript Templates engine](https://github.com/blueimp/JavaScript-Templates)
  v3+: Used to render the selected and uploaded files for the Basic Plus UI and
  jQuery UI versions.
- [JavaScript Load Image library](https://github.com/blueimp/JavaScript-Load-Image)
  v2+: Required for the image previews and resizing functionality.
- [JavaScript Canvas to Blob polyfill](https://github.com/blueimp/JavaScript-Canvas-to-Blob)
  v3+:Required for the image previews and resizing functionality.
- [blueimp Gallery](https://github.com/blueimp/Gallery) v2+: Used to display the
  uploaded images in a lightbox.
- [Bootstrap](https://getbootstrap.com/) v3+: Used for the demo design.
- [Glyphicons](https://glyphicons.com/) Icon set used by Bootstrap.

### Cross-domain requirements

[Cross-domain File Uploads](https://github.com/blueimp/jQuery-File-Upload/wiki/Cross-domain-uploads)
using the
[Iframe Transport plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/js/jquery.iframe-transport.js)
require a redirect back to the origin server to retrieve the upload results. The
[example implementation](https://github.com/blueimp/jQuery-File-Upload/blob/master/js/main.js)
makes use of
[result.html](https://github.com/blueimp/jQuery-File-Upload/blob/master/cors/result.html)
as a static redirect page for the origin server.

The repository also includes the
[jQuery XDomainRequest Transport plugin](https://github.com/blueimp/jQuery-File-Upload/blob/master/js/cors/jquery.xdr-transport.js),
which enables limited cross-domain AJAX requests in Microsoft Internet Explorer
8 and 9 (IE 10 supports cross-domain XHR requests).  
The XDomainRequest object allows GET and POST requests only and doesn't support
file uploads. It is used on the
[Demo](https://blueimp.github.io/jQuery-File-Upload/) to delete uploaded files
from the cross-domain demo file upload service.

## Browsers

### Desktop browsers

The File Upload plugin is regularly tested with the latest browser versions and
supports the following minimal versions:

- Google Chrome
- Apple Safari 4.0+
- Mozilla Firefox 3.0+
- Opera 11.0+
- Microsoft Internet Explorer 6.0+

### Mobile browsers

The File Upload plugin has been tested with and supports the following mobile
browsers:

- Apple Safari on iOS 6.0+
- Google Chrome on iOS 6.0+
- Google Chrome on Android 4.0+
- Default Browser on Android 2.3+
- Opera Mobile 12.0+

### Extended browser support information

For a detailed overview of the features supported by each browser version and
known operating system / browser bugs, please have a look at the
[Extended browser support information](https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support).

## Testing

The project comes with three sets of tests:

1. Code linting using [ESLint](https://eslint.org/).
2. Unit tests using [Mocha](https://mochajs.org/).
3. End-to-end tests using [blueimp/wdio](https://github.com/blueimp/wdio).

To run the tests, follow these steps:

1. Start [Docker](https://docs.docker.com/).
2. Install development dependencies:
   ```sh
   npm install
   ```
3. Run the tests:
   ```sh
   npm test
   ```

## Support

This project is actively maintained, but there is no official support channel.  
If you have a question that another developer might help you with, please post
to
[Stack Overflow](https://stackoverflow.com/questions/tagged/blueimp+jquery+file-upload)
and tag your question with `blueimp jquery file upload`.

## License

Released under the [MIT license](https://opensource.org/licenses/MIT).
