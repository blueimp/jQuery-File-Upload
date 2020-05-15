# File Upload Security

## Contents

- [Introduction](#introduction)
- [Purpose of this project](#purpose-of-this-project)
- [Mitigations against file upload risks](#mitigations-against-file-upload-risks)
  - [Prevent code execution on the server](#prevent-code-execution-on-the-server)
  - [Prevent code execution in the browser](#prevent-code-execution-in-the-browser)
  - [Prevent distribution of malware](#prevent-distribution-of-malware)
- [Secure file upload serving configurations](#secure-file-upload-serving-configurations)
  - [Apache config](#apache-config)
  - [NGINX config](#nginx-config)
- [Secure image processing configurations](#secure-image-processing-configurations)
- [ImageMagick config](#imagemagick-config)

## Introduction

For an in-depth understanding of the potential security risks of providing file
uploads and possible mitigations, please refer to the
[OWASP - Unrestricted File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
documentation.

To securely setup the project to serve uploaded files, please refer to the
sample
[Secure file upload serving configurations](#secure-file-upload-serving-configurations).

To mitigate potential vulnerabilities in image processing libraries, please
refer to the
[Secure image processing configurations](#secure-image-processing-configurations).

By default, all sample upload handlers allow only upload of image files, which
mitigates some attack vectors, but should not be relied on as the only
protection.

Please also have a look at the
[list of fixed vulnerabilities](VULNERABILITIES.md) in jQuery File Upload, which
relates mostly to the sample server-side upload handlers and how they have been
configured.

## Purpose of this project

Please note that this project is not a complete file management product, but
foremost a client-side file upload library for [jQuery](https://jquery.com/).  
The server-side sample upload handlers are just examples to demonstrate the
client-side file upload functionality.

To make this very clear, there is **no user authentication** by default:

- **everyone can upload files**
- **everyone can delete uploaded files**

In some cases this can be acceptable, but for most projects you will want to
extend the sample upload handlers to integrate user authentication, or implement
your own.

It is also up to you to configure your web server to securely serve the uploaded
files, e.g. using the
[sample server configurations](#secure-file-upload-serving-configurations).

## Mitigations against file upload risks

### Prevent code execution on the server

To prevent execution of scripts or binaries on server-side, the upload directory
must be configured to not execute files in the upload directory (e.g.
`server/php/files` as the default for the PHP upload handler) and only treat
uploaded files as static content.

The recommended way to do this is to configure the upload directory path to
point outside of the web application root.  
Then the web server can be configured to serve files from the upload directory
with their default static files handler only.

Limiting file uploads to a whitelist of safe file types (e.g. image files) also
mitigates this issue, but should not be the only protection.

### Prevent code execution in the browser

To prevent execution of scripts on client-side, the following headers must be
sent when delivering generic uploaded files to the client:

```
Content-Type: application/octet-stream
X-Content-Type-Options: nosniff
```

The `Content-Type: application/octet-stream` header instructs browsers to
display a download dialog instead of parsing it and possibly executing script
content e.g. in HTML files.

The `X-Content-Type-Options: nosniff` header prevents browsers to try to detect
the file mime type despite the given content-type header.

For known safe files, the content-type header can be adjusted using a
**whitelist**, e.g. sending `Content-Type: image/png` for PNG files.

### Prevent distribution of malware

To prevent attackers from uploading and distributing malware (e.g. computer
viruses), it is recommended to limit file uploads only to a whitelist of safe
file types.

Please note that the detection of file types in the sample file upload handlers
is based on the file extension and not the actual file content. This makes it
still possible for attackers to upload malware by giving their files an image
file extension, but should prevent automatic execution on client computers when
opening those files.

It does not protect at all from exploiting vulnerabilities in image display
programs, nor from users renaming file extensions to inadvertently execute the
contained malicious code.

## Secure file upload serving configurations

The following configurations serve uploaded files as static files with the
proper headers as
[mitigation against file upload risks](#mitigations-against-file-upload-risks).  
Please do not simply copy&paste these configurations, but make sure you
understand what they are doing and that you have implemented them correctly.

> Always test your own setup and make sure that it is secure!

e.g. try uploading PHP scripts (as "example.php", "example.php.png" and
"example.png") to see if they get executed by your web server, e.g. the content
of the following sample:

```php
GIF89ad <?php echo mime_content_type(__FILE__); phpinfo();
```

### Apache config

Add the following directive to the Apache config (e.g.
/etc/apache2/apache2.conf), replacing the directory path with the absolute path
to the upload directory:

```ApacheConf
<Directory "/path/to/project/server/php/files">
  # Some of the directives require the Apache Headers module. If it is not
  # already enabled, please execute the following command and reload Apache:
  # sudo a2enmod headers
  #
  # Please note that the order of directives across configuration files matters,
  # see also:
  # https://httpd.apache.org/docs/current/sections.html#merging

  # The following directive matches all files and forces them to be handled as
  # static content, which prevents the server from parsing and executing files
  # that are associated with a dynamic runtime, e.g. PHP files.
  # It also forces their Content-Type header to "application/octet-stream" and
  # adds a "Content-Disposition: attachment" header to force a download dialog,
  # which prevents browsers from interpreting files in the context of the
  # web server, e.g. HTML files containing JavaScript.
  # Lastly it also prevents browsers from MIME-sniffing the Content-Type,
  # preventing them from interpreting a file as a different Content-Type than
  # the one sent by the webserver.
  <FilesMatch ".*">
    SetHandler default-handler
    ForceType application/octet-stream
    Header set Content-Disposition attachment
    Header set X-Content-Type-Options nosniff
  </FilesMatch>

  # The following directive matches known image files and unsets the forced
  # Content-Type so they can be served with their original mime type.
  # It also unsets the Content-Disposition header to allow displaying them
  # inline in the browser.
  <FilesMatch ".+\.(?i:(gif|jpe?g|png))$">
    ForceType none
    Header unset Content-Disposition
  </FilesMatch>
</Directory>
```

### NGINX config

Add the following directive to the NGINX config, replacing the directory path
with the absolute path to the upload directory:

```Nginx
location ^~ /path/to/project/server/php/files {
    root html;
    default_type application/octet-stream;
    types {
        image/gif     gif;
        image/jpeg    jpg;
        image/png    png;
    }
    add_header X-Content-Type-Options 'nosniff';
    if ($request_filename ~ /(((?!\.(jpg)|(png)|(gif)$)[^/])+$)) {
        add_header Content-Disposition 'attachment; filename="$1"';
        # Add X-Content-Type-Options again, as using add_header in a new context
        # dismisses all previous add_header calls:
        add_header X-Content-Type-Options 'nosniff';
    }
}
```

## Secure image processing configurations

The following configuration mitigates
[potential image processing vulnerabilities with ImageMagick](VULNERABILITIES.md#potential-vulnerabilities-with-php-imagemagick)
by limiting the attack vectors to a small subset of image types
(`GIF/JPEG/PNG`).

Please also consider using alternative, safer image processing libraries like
[libvips](https://github.com/libvips/libvips) or
[imageflow](https://github.com/imazen/imageflow).

## ImageMagick config

It is recommended to disable all non-required ImageMagick coders via
[policy.xml](https://wiki.debian.org/imagemagick/security).  
To do so, locate the ImageMagick `policy.xml` configuration file and add the
following policies:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- ... -->
<policymap>
  <!-- ... -->
  <policy domain="delegate" rights="none" pattern="*" />
  <policy domain="coder" rights="none" pattern="*" />
  <policy domain="coder" rights="read | write" pattern="{GIF,JPEG,JPG,PNG}" />
</policymap>
```
