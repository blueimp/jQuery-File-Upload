<?php
/*
 * jQuery File Upload Plugin PHP Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

error_reporting(E_ALL | E_STRICT);
require('UploadHandler.php');
$upload_handler = new UploadHandler(array(

  // SECURITY NOTICE:
  // Only change the accept_file_types setting after making sure that any
  // allowed file types cannot be executed by the webserver in the files
  // directory (e.g. PHP scripts), nor executed by the browser when downloaded
  // (e.g. HTML files with embedded JavaScript code).
  // e.g. in Apache, make sure the provided .htaccess file is present in the
  // files directory and .htaccess support has been enabled:
  // https://httpd.apache.org/docs/current/howto/htaccess.html

  // By default, only allow file uploads with image file extensions:
  'accept_file_types' => '/\.(gif|jpe?g|png)$/i'
));
