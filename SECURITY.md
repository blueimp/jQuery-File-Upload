# File Upload Security
For an in-depth understanding of the potential security risks of providing file uploads and possible mitigations, please refer to the [OWASP  - Unrestricted File Upload](https://www.owasp.org/index.php/Unrestricted_File_Upload) documentation.

To securely setup the project to serve uploaded files, please refer to the sample [Secure file upload serving configurations](#secure-file-upload-serving-configurations).

By default, all sample upload handlers allow only upload of image files, which mitigates some attack vectors, but should not be relied on as the only protection.

Please also have a look at the [list of fixed vulnerabilities](VULNERABILITIES.md) in jQuery File Upload, which relates mostly to the sample server-side upload handlers and how they have been configured.

## Purpose of this project
Please note that this project is not a complete file management product, but foremost a client-side file upload library for [jQuery](https://jquery.com/).  
The server-side sample upload handlers are just examples to demonstrate the client-side file upload functionality.

To make this very clear, there is **no user authentication** by default:
* **everyone can upload files**
* **everyone can delete uploaded files**

In some cases this can be acceptable, but for most projects you will want to extend the sample upload handlers to integrate user authentication, or implement your own.

It is also up to you to configure your Webserver to securely serve the uploaded files, e.g. using the [sample server configurations](#secure-file-upload-serving-configurations).

## Mitigations against file upload risks

### Prevent code execution on the server
To prevent execution of scripts or binaries on server-side, the upload directory must be configured to not execute files in the upload directory (e.g. `server/php/files` as the default for the PHP upload handler) and only treat uploaded files as static content.

The recommended way to do this is to configure the upload directory path to point outside of the web application root.  
Then the Webserver can be configured to serve files from the upload directory with their default static files handler only.

Limiting file uploads to a whitelist of safe file types (e.g. image files) also mitigates this issue, but should not be the only protection.

### Prevent code execution in the browser
To prevent execution of scripts on client-side, the following headers must
be sent when delivering generic uploaded files to the client:

```
Content-Type: application/octet-stream
X-Content-Type-Options: nosniff
```

The `Content-Type: application/octet-stream` header instructs browsers to display a download dialog instead of parsing it and possibly executing script content e.g. in HTML files.

The `X-Content-Type-Options: nosniff` header prevents browsers to try to detect the file mime type despite the given content-type header.

For known safe files, the content-type header can be adjusted using a **whitelist**, e.g. sending `Content-Type: image/png` for PNG files.

### Prevent distribution of malware
To prevent attackers from uploading and distributing malware (e.g. computer viruses), it is recommended to limit file uploads only to a whitelist of safe file types.

Please note that the detection of file types in the sample file upload handlers is based on the file extension and not the actual file content. This makes it still possible for attackers to upload malware by giving their files an image file extension, but should prevent automatic execution on client computers when opening those files.

It does not protect at all from exploiting vulnerabilities in image display programs, nor from users renaming file extensions to inadvertently execute the contained malicious code.

## Secure file upload serving configurations
The following configurations serve uploaded files as static files with the proper headers as [mitigation against file upload risks](#mitigations-against-file-upload-risks).  
Please do not simply copy&paste these configurations, but make sure you understand what they are doing and that you have implemented them correctly.

> Always test your own setup and make sure that it is secure!

e.g. try uploading PHP scripts (as "example.php", "example.php.png" and "example.png") to see if they get executed by your Webserver.

### Apache config
Add the following directive to the Apache config, replacing the directory path with the absolute path to the upload directory:

```ApacheConf
<Directory "/path/to/project/server/php/files">
  # To enable the Headers module, execute the following command and reload Apache:
  # sudo a2enmod headers

  # The following directives prevent the execution of script files
  # in the context of the website.
  # They also force the content-type application/octet-stream and
  # force browsers to display a download dialog for non-image files.
  SetHandler default-handler
  ForceType application/octet-stream
  Header set Content-Disposition attachment

  # The following unsets the forced type and Content-Disposition headers
  # for known image files:
  <FilesMatch "(?i)\.(gif|jpe?g|png)$">
    ForceType none
    Header unset Content-Disposition
  </FilesMatch>

  # The following directive prevents browsers from MIME-sniffing the content-type.
  # This is an important complement to the ForceType directive above:
  Header set X-Content-Type-Options nosniff
</Directory>
```

### NGINX config
Add the following directive to the NGINX config, replacing the directory path with the absolute path to the upload directory:

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
