<?php

/**
 * jQuery File Upload Plugin PHP Class
 * https://github.com/blueimp/jQuery-File-Upload.
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/**
 * Full upload manager including image processing.
 */
class UploadHandler
{
    /**
     * Optional option to be set.
     *
     * @var array
     */
    protected $_options;

    /**
     * Response.
     *
     * @var array
     */
    protected $_response;

    /**
     * PHP File Upload error message codes:
     * http://php.net/manual/en/features.file-upload.errors.php.
     *
     * @var array
     */
    protected $_errorMessages = array(
        1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
        2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
        3 => 'The uploaded file was only partially uploaded',
        4 => 'No file was uploaded',
        6 => 'Missing a temporary folder',
        7 => 'Failed to write file to disk',
        8 => 'A PHP extension stopped the file upload',
        'post_max_size' => 'The uploaded file exceeds the post_max_size directive in php.ini',
        'max_file_size' => 'File is too big',
        'min_file_size' => 'File is too small',
        'accept_file_types' => 'Filetype not allowed',
        'max_number_of_files' => 'Maximum number of files exceeded',
        'max_width' => 'Image exceeds maximum width',
        'min_width' => 'Image requires a minimum width',
        'max_height' => 'Image exceeds maximum height',
        'min_height' => 'Image requires a minimum height',
        'abort' => 'File upload aborted',
        'image_resize' => 'Failed to resize image',
    );

    /**
     * List of image objects.
     *
     * @var array
     */
    protected $_imageObjects = array();


    /**
     * Initialize the manager.
     *
     * @param array $options Parameters to be set to overload default settings.
     * @param boolean $initialize
     * @param array $errorMessages List of error messages to extend or replace the defaults
     */
    public function __construct($options = null, $initialize = true, $errorMessages = null)
    {
        $this->_response = array();
        $this->_options = array(
            'script_url' => $this->_getFullUrl().'/'.$this->_basename($this->_getServerVar('SCRIPT_NAME')),
            'upload_dir' => dirname($this->_getServerVar('SCRIPT_FILENAME')).'/files/',
            'upload_url' => $this->_getFullUrl().'/files/',
            'input_stream' => 'php://input',
            'user_dirs' => false,
            'mkdir_mode' => 0755,
            'param_name' => 'files',
            // Set the following option to 'POST', if your server does not support
            // DELETE requests. This is a parameter sent to the client:
            'delete_type' => 'DELETE',
            'access_control_allow_origin' => '*',
            'access_control_allow_credentials' => false,
            'access_control_allow_methods' => array(
                'OPTIONS',
                'HEAD',
                'GET',
                'POST',
                'PUT',
                'PATCH',
                'DELETE',
            ),
            'access_control_allow_headers' => array(
                'Content-Type',
                'Content-Range',
                'Content-Disposition',
            ),
            // By default, allow redirects to the referer protocol+host:
            'redirect_allow_target' => '/^'.preg_quote(
                parse_url($this->_getServerVar('HTTP_REFERER'), PHP_URL_SCHEME)
                .'://'
                .parse_url($this->_getServerVar('HTTP_REFERER'), PHP_URL_HOST)
                .'/', // Trailing slash to not match subdomains by mistake
                '/' // preg_quote delimiter param
            ).'/',
            // Enable to provide file downloads via GET requests to the PHP script:
            //     1. Set to 1 to download files via readfile method through PHP
            //     2. Set to 2 to send a X-Sendfile header for lighttpd/Apache
            //     3. Set to 3 to send a X-Accel-Redirect header for nginx
            // If set to 2 or 3, adjust the upload_url option to the base path of
            // the redirect parameter, e.g. '/files/'.
            'download_via_php' => false,
            // Read files in chunks to avoid memory limits when download_via_php
            // is enabled, set to 0 to disable chunked reading of files:
            'readfile_chunk_size' => 10 * 1024 * 1024, // 10 MiB
            // Defines which files can be displayed inline when downloaded:
            'inline_file_types' => '/\.(gif|jpe?g|png)$/i',
            // Defines which files (based on their names) are accepted for upload:
            'accept_file_types' => '/.+$/i',
            // The php.ini settings upload_max_filesize and post_max_size
            // take precedence over the following max_file_size setting:
            'max_file_size' => null,
            'min_file_size' => 1,
            // The maximum number of files for the upload directory:
            'max_number_of_files' => null,
            // Defines which files are handled as image files:
            'image_file_types' => '/\.(gif|jpe?g|png)$/i',
            // Use exif_imagetype on all files to correct file extensions:
            'correct_image_extensions' => false,
            // Image resolution restrictions:
            'max_width' => null,
            'max_height' => null,
            'min_width' => 1,
            'min_height' => 1,
            // Set the following option to false to enable resumable uploads:
            'discard_aborted_uploads' => true,
            // Set to 0 to use the GD library to scale and orient images,
            // set to 1 to use imagick (if installed, falls back to GD),
            // set to 2 to use the ImageMagick convert binary directly:
            'image_library' => 1,
            // Uncomment the following to define an array of resource limits
            // for imagick:
            /*
              'imagick_resource_limits' => array(
              imagick::RESOURCETYPE_MAP => 32,
              imagick::RESOURCETYPE_MEMORY => 32
              ),
             */

            // Command or path for to the ImageMagick convert binary:
            'convert_bin' => 'convert',
            // Uncomment the following to add parameters in front of each
            // ImageMagick convert call (the limit constraints seem only
            // to have an effect if put in front):
            /*
              'convert_params' => '-limit memory 32MiB -limit map 32MiB',
             */
            // Command or path for to the ImageMagick identify binary:
            'identify_bin' => 'identify',
            'image_versions' => array(
                // The empty image version key defines options for the original image:
                '' => array(
                    // Automatically rotate images based on EXIF meta data:
                    'auto_orient' => true,
                ),
                // Uncomment the following to create medium sized images:
                /*
                  'medium' => array(
                  'max_width' => 800,
                  'max_height' => 600
                  ),
                 */
                'thumbnail' => array(
                    // Uncomment the following to use a defined directory for the thumbnails
                    // instead of a subdirectory based on the version identifier.
                    // Make sure that this directory doesn't allow execution of files if you
                    // don't pose any restrictions on the type of uploaded files, e.g. by
                    // copying the .htaccess file from the files directory for Apache:
                    //'upload_dir' => dirname($this->get_server_var('SCRIPT_FILENAME')).'/thumb/',
                    //'upload_url' => $this->get_full_url().'/thumb/',
                    // Uncomment the following to force the max
                    // dimensions and e.g. create square thumbnails:
                    //'crop' => true,
                    'max_width' => 80,
                    'max_height' => 80,
                ),
            ),
            'print_response' => true,
        );

        if ($options) {
            $this->_options = $options + $this->_options;
        }

        if ($errorMessages) {
            $this->_errorMessages = $errorMessages + $this->_errorMessages;
        }

        if ($initialize) {
            $this->_initialize();
        }
    }


    /**
     * Returns the number of bytes for a e.g. php value like post_max_size
     *
     * @param string|integer $val Value of the config eg: '2M'
     *
     * @return integer size in bytes
     */
    public function getConfigBytes($val)
    {
        $val = trim($val);
        $last = strtolower($val[strlen($val) - 1]);
        $val = (int) $val;
        switch ($last) {
            case 'g':
                $val *= 1024;
            case 'm':
                $val *= 1024;
            case 'k':
                $val *= 1024;
        }

        return $this->_fixIntegerOverflow($val);
    }


    /**
     * Returns response contents or json string to output.
     *
     * @todo task mismatch: several tasks in one methode failure. Too complicted.
     *
     * @param string $content
     * @param boolean $printResponse If true headers for json and json string will print out
     * otherwise the content will retrun
     *
     * @return string Response string
     */
    public function generateResponse($content, $printResponse  = true)
    {
        $this->_response = $content;
        if ($printResponse ) {
            $json = json_encode($content);
            $redirect = stripslashes($this->_getPostParam('redirect'));
            if ($redirect && preg_match($this->_options['redirect_allow_target'], $redirect)) {
                $this->_header('Location: '.sprintf($redirect, rawurlencode($json)));

                return;
            }
            $this->head();
            if ($this->_getServerVar('HTTP_CONTENT_RANGE')) {
                $files = isset($content[$this->_options['param_name']]) ?
                    $content[$this->_options['param_name']] : null;
                if ($files && is_array($files) && is_object($files[0]) && $files[0]->size) {
                    $this->_header('Range: 0-'.(
                        $this->_fixIntegerOverflow((int) $files[0]->size) - 1
                    ));
                }
            }
            $this->_body($json);
        }

        return $content;
    }


    /**
     * Returns the response string.
     *
     * @return string The response string
     */
    public function getResponse()
    {
        return $this->_response;
    }


    /**
     * Sets basic headers to output.
     */
    public function head()
    {
        $this->_header('Pragma: no-cache');
        $this->_header('Cache-Control: no-store, no-cache, must-revalidate');
        $this->_header('Content-Disposition: inline; filename="files.json"');
        // Prevent Internet Explorer from MIME-sniffing the content-type:
        $this->_header('X-Content-Type-Options: nosniff');
        if ( $this->_options['access_control_allow_origin'] ) {
            $this->_sendAccessControlHeaders();
        }
        $this->_sendContentTypeHeader();
    }


    /**
     * @todo Not clear at the moment.
     *
     * @param boolean $printResponse
     * @return type
     */
    public function get( $printResponse = true )
    {
        if ( $printResponse && $this->_getQueryParam('download') ) {
            return $this->_download();
        }
        $file_name = $this->_getFileNameParam();
        if ( $file_name ) {
            $response = array(
                $this->_getSingularParamName() => $this->_getFileObject($file_name),
            );
        } else {
            $response = array(
                $this->_options['param_name'] => $this->_getFileObjects(),
            );
        }

        return $this->generateResponse($response, $printResponse);
    }


    /**
     *
     * @param type $printResponse
     * @return type
     */
    public function post( $printResponse = true )
    {
        if ($this->_getQueryParam('_method') === 'DELETE') {
            return $this->delete($printResponse);
        }
        $upload = $this->_getUploadData($this->_options['param_name']);
        // Parse the Content-Disposition header, if available:
        $content_disposition_header = $this->_getServerVar('HTTP_CONTENT_DISPOSITION');
        $file_name = $content_disposition_header ?
            rawurldecode(preg_replace(
                    '/(^[^"]+")|("$)/', '', $content_disposition_header
            )) : null;
        // Parse the Content-Range header, which has the following form:
        // Content-Range: bytes 0-524287/2000000
        $content_range_header = $this->_getServerVar('HTTP_CONTENT_RANGE');
        $content_range = $content_range_header ?
            preg_split('/[^0-9]+/', $content_range_header) : null;
        $size = $content_range ? $content_range[3] : null;
        $files = array();
        if ($upload) {
            if (is_array($upload['tmp_name'])) {
                // param_name is an array identifier like "files[]",
                // $upload is a multi-dimensional array:
                foreach ($upload['tmp_name'] as $index => $value) {
                    $files[] = $this->_handleFileUpload(
                        $upload['tmp_name'][$index],
                        $file_name ? $file_name : $upload['name'][$index],
                        $size ? $size : $upload['size'][$index], $upload['type'][$index],
                        $upload['error'][$index], $index, $content_range
                    );
                }
            } else {
                // param_name is a single object identifier like "file",
                // $upload is a one-dimensional array:
                $files[] = $this->_handleFileUpload(
                    isset($upload['tmp_name']) ? $upload['tmp_name'] : null,
                    $file_name ? $file_name : (isset($upload['name']) ?
                            $upload['name'] : null),
                    $size ? $size : (isset($upload['size']) ?
                            $upload['size'] : $this->_getServerVar('CONTENT_LENGTH')),
                    isset($upload['type']) ?
                        $upload['type'] : $this->_getServerVar('CONTENT_TYPE'),
                    isset($upload['error']) ? $upload['error'] : null, null, $content_range
                );
            }
        }
        $response = array($this->_options['param_name'] => $files);

        return $this->generateResponse($response, $printResponse);
    }


    /**
     * Delete file/s.
     *
     * @param boolean $printResponse
     *
     * @return string
     */
    public function delete( $printResponse = true )
    {
        $file_names = $this->_getFileNamesParams();
        if ( empty($file_names) ) {
            $file_names = array($this->_getFileNameParam());
        }

        $response = array();
        foreach ( $file_names as $file_name ) {
            $file_path = $this->_geUploadPath($file_name);
            $success = is_file($file_path) && $file_name[0] !== '.' && unlink($file_path);
            if ( $success ) {
                foreach ( $this->_options['image_versions'] as $version => $options ) {
                    if ( !empty($version) ) {
                        $file = $this->_geUploadPath($file_name, $version);
                        if ( is_file($file) ) {
                            unlink($file);
                        }
                    }
                }
            }
            $response[$file_name] = $success;
        }

        return $this->generateResponse($response, $printResponse);
    }


    protected function _initialize()
    {
        switch ($this->_getServerVar('REQUEST_METHOD')) {
            case 'OPTIONS':
            case 'HEAD':
                $this->head();
                break;
            case 'GET':
                $this->get($this->_options['print_response']);
                break;
            case 'PATCH':
            case 'PUT':
            case 'POST':
                $this->post($this->_options['print_response']);
                break;
            case 'DELETE':
                $this->delete($this->_options['print_response']);
                break;
            default:
                $this->_header('HTTP/1.1 405 Method Not Allowed');
        }
    }


    protected function _getFullUrl()
    {
        $https = !empty($_SERVER['HTTPS']) && strcasecmp($_SERVER['HTTPS'], 'on') === 0 ||
            !empty($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
            strcasecmp($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') === 0;

        return
            ($https ? 'https://' : 'http://').
            (!empty($_SERVER['REMOTE_USER']) ? $_SERVER['REMOTE_USER'].'@' : '').
            (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : ($_SERVER['SERVER_NAME'].
                ($https && $_SERVER['SERVER_PORT'] === 443 ||
                $_SERVER['SERVER_PORT'] === 80 ? '' : ':'.$_SERVER['SERVER_PORT']))).
            substr($_SERVER['SCRIPT_NAME'], 0, strrpos($_SERVER['SCRIPT_NAME'], '/'));
    }

    /**
     * Returns the session ID as user ID
     *
     * @return string
     */
    protected function _getUserId()
    {
        @session_start();

        return session_id();
    }


    /**
     * Returns the path where uploads are located.
     *
     * If 'user_dirs' is set to true the sub path is the session ID orthe base path will return.
     *
     * @return string relative path of upload folder (prefix .../files/) ('' or '[sessionID]/')
     */
    protected function _getUserPath()
    {
        if ($this->_options['user_dirs']) {
            return $this->_getUserId().'/';
        }

        return '';
    }


    protected function _geUploadPath($fileName = null, $version = null)
    {
        $fileName = $fileName ? $fileName : '';
        if (empty($version)) {
            $version_path = '';
        } else {
            $version_dir = @$this->_options['image_versions'][$version]['upload_dir'];
            if ($version_dir) {
                return $version_dir.$this->_getUserPath().$fileName;
            }
            $version_path = $version.'/';
        }

        return $this->_options['upload_dir'].$this->_getUserPath()
            .$version_path.$fileName;
    }


    protected function _getQuerySeparator($url)
    {
        return strpos($url, '?') === false ? '?' : '&';
    }


    protected function _getDownloadUrl($fileName, $version = null, $direct = false)
    {
        if (!$direct && $this->_options['download_via_php']) {
            $url = $this->_options['script_url']
                .$this->_getQuerySeparator($this->_options['script_url'])
                .$this->_getSingularParamName()
                .'='.rawurlencode($fileName);
            if ($version) {
                $url .= '&version='.rawurlencode($version);
            }

            return $url.'&download=1';
        }
        if (empty($version)) {
            $version_path = '';
        } else {
            $version_url = @$this->_options['image_versions'][$version]['upload_url'];
            if ($version_url) {
                return $version_url.$this->_getUserPath().rawurlencode($fileName);
            }
            $version_path = rawurlencode($version).'/';
        }

        return $this->_options['upload_url'].$this->_getUserPath()
            .$version_path.rawurlencode($fileName);
    }


    protected function _setAdditionalFileProperties($file)
    {
        $file->deleteUrl = $this->_options['script_url']
            .$this->_getQuerySeparator($this->_options['script_url'])
            .$this->_getSingularParamName()
            .'='.rawurlencode($file->name);
        $file->deleteType = $this->_options['delete_type'];
        if ($file->deleteType !== 'DELETE') {
            $file->deleteUrl .= '&_method=DELETE';
        }
        if ($this->_options['access_control_allow_credentials']) {
            $file->deleteWithCredentials = true;
        }
    }


    /**
     * php int to double conversion.
     *
     * Fix for overflowing signed 32 bit integers,
     * works for sizes up to 2^32-1 bytes (4 GiB - 1)
     */
    protected function _fixIntegerOverflow($size)
    {
        if ($size < 0) {
            $size += 2.0 * (PHP_INT_MAX + 1);
        }

        return $size;
    }


    protected function _getFileSize($filePath, $clearStatCache = false)
    {
        if ($clearStatCache) {
            if (version_compare(PHP_VERSION, '5.3.0') >= 0) {
                clearstatcache(true, $filePath);
            } else {
                clearstatcache();
            }
        }

        return $this->_fixIntegerOverflow(filesize($filePath));
    }


    protected function _isValidFileObject($fileName)
    {
        $file_path = $this->_geUploadPath($fileName);
        if (is_file($file_path) && $fileName[0] !== '.') {
            return true;
        }

        return false;
    }


    protected function _getFileObject($fileName)
    {
        if ($this->_isValidFileObject($fileName)) {
            $file = new \stdClass();
            $file->name = $fileName;
            $file->size = $this->_getFileSize(
                $this->_geUploadPath($fileName)
            );
            $file->url = $this->_getDownloadUrl($file->name);
            foreach ($this->_options['image_versions'] as $version => $options) {
                if (!empty($version)) {
                    if (is_file($this->_geUploadPath($fileName, $version))) {
                        $file->{$version.'Url'} = $this->_getDownloadUrl(
                            $file->name, $version
                        );
                    }
                }
            }
            $this->_setAdditionalFileProperties($file);

            return $file;
        }

        return null;
    }


    protected function _getFileObjects($iterationMethod = '_getFileObject')
    {
        $uploadDir = $this->_geUploadPath();
        if (!is_dir($uploadDir)) {
            return array();
        }

        return array_values(array_filter(array_map(
                    array($this, $iterationMethod), scandir($uploadDir)
        )));
    }


    protected function _countFileObjects()
    {
        return count($this->_getFileObjects('_isValidFileObject'));
    }


    protected function _getErrorMessage( $error )
    {
        return isset($this->_errorMessages[$error]) ?
            $this->_errorMessages[$error] : $error;
    }


    protected function _validate($uploadedFile, $file, $error, $index)
    {
        if ($error) {
            $file->error = $this->_getErrorMessage($error);

            return false;
        }
        $content_length = $this->_fixIntegerOverflow(
            (int) $this->_getServerVar('CONTENT_LENGTH')
        );
        $post_max_size = $this->getConfigBytes(ini_get('post_max_size'));
        if ($post_max_size && ($content_length > $post_max_size)) {
            $file->error = $this->_getErrorMessage('post_max_size');

            return false;
        }
        if (!preg_match($this->_options['accept_file_types'], $file->name)) {
            $file->error = $this->_getErrorMessage('accept_file_types');

            return false;
        }
        if ($uploadedFile && is_uploaded_file($uploadedFile)) {
            $file_size = $this->_getFileSize($uploadedFile);
        } else {
            $file_size = $content_length;
        }
        if ($this->_options['max_file_size'] && (
            $file_size > $this->_options['max_file_size'] ||
            $file->size > $this->_options['max_file_size'])
        ) {
            $file->error = $this->_getErrorMessage('max_file_size');

            return false;
        }
        if ($this->_options['min_file_size'] &&
            $file_size < $this->_options['min_file_size']) {
            $file->error = $this->_getErrorMessage('min_file_size');

            return false;
        }
        if (is_int($this->_options['max_number_of_files']) &&
            ($this->_countFileObjects() >= $this->_options['max_number_of_files']) &&
            // Ignore additional chunks of existing files:
            !is_file($this->_geUploadPath($file->name))) {
            $file->error = $this->_getErrorMessage('max_number_of_files');

            return false;
        }
        $max_width = @$this->_options['max_width'];
        $max_height = @$this->_options['max_height'];
        $min_width = @$this->_options['min_width'];
        $min_height = @$this->_options['min_height'];
        if (($max_width || $max_height || $min_width || $min_height) && preg_match($this->_options['image_file_types'],
                $file->name)) {
            list($img_width, $img_height) = $this->_getImageSize($uploadedFile);

            // If we are auto rotating the image by default, do the checks on
            // the correct orientation
            if (
                @$this->_options['image_versions']['']['auto_orient'] &&
                function_exists('exif_read_data') &&
                ($exif = @exif_read_data($uploadedFile)) &&
                (((int) @$exif['Orientation']) >= 5)
            ) {
                $tmp = $img_width;
                $img_width = $img_height;
                $img_height = $tmp;
                unset($tmp);
            }
        }
        if (!empty($img_width)) {
            if ($max_width && $img_width > $max_width) {
                $file->error = $this->_getErrorMessage('max_width');

                return false;
            }
            if ($max_height && $img_height > $max_height) {
                $file->error = $this->_getErrorMessage('max_height');

                return false;
            }
            if ($min_width && $img_width < $min_width) {
                $file->error = $this->_getErrorMessage('min_width');

                return false;
            }
            if ($min_height && $img_height < $min_height) {
                $file->error = $this->_getErrorMessage('min_height');

                return false;
            }
        }

        return true;
    }


    protected function _upcountNameCallback($matches)
    {
        $index = isset($matches[1]) ? ((int) $matches[1]) + 1 : 1;
        $ext = isset($matches[2]) ? $matches[2] : '';

        return ' ('.$index.')'.$ext;
    }


    protected function _upcountName($name)
    {
        return preg_replace_callback(
            '/(?:(?: \(([\d]+)\))?(\.[^.]+))?$/', array($this, '_upcountNameCallback'), $name, 1
        );
    }


    protected function _getUniqueFilename($filePath, $name, $size, $type, $error, $index,
        $contentRange)
    {
        while (is_dir($this->_geUploadPath($name))) {
            $name = $this->_upcountName($name);
        }
        // Keep an existing filename if this is part of a chunked upload:
        $uploaded_bytes = $this->_fixIntegerOverflow((int) $contentRange[1]);
        while (is_file($this->_geUploadPath($name))) {
            if ($uploaded_bytes === $this->_getFileSize(
                    $this->_geUploadPath($name))) {
                break;
            }
            $name = $this->_upcountName($name);
        }

        return $name;
    }


    protected function _fixFileExtension($filePath, $name, $size, $type, $error, $index,
        $contentRange)
    {
        // Add missing file extension for known image types:
        if (strpos($name, '.') === false &&
            preg_match('/^image\/(gif|jpe?g|png)/', $type, $matches)) {
            $name .= '.'.$matches[1];
        }
        if ($this->_options['correct_image_extensions'] &&
            function_exists('exif_imagetype')) {
            switch (@exif_imagetype($filePath)) {
                case IMAGETYPE_JPEG:
                    $extensions = array('jpg', 'jpeg');
                    break;
                case IMAGETYPE_PNG:
                    $extensions = array('png');
                    break;
                case IMAGETYPE_GIF:
                    $extensions = array('gif');
                    break;
            }
            // Adjust incorrect image file extensions:
            if (!empty($extensions)) {
                $parts = explode('.', $name);
                $extIndex = count($parts) - 1;
                $ext = strtolower(@$parts[$extIndex]);
                if (!in_array($ext, $extensions)) {
                    $parts[$extIndex] = $extensions[0];
                    $name = implode('.', $parts);
                }
            }
        }

        return $name;
    }


    protected function _trimFileName($filePath, $name, $size, $type, $error, $index,
        $contentRange)
    {
        // Remove path information and dots around the filename, to prevent uploading
        // into different directories or replacing hidden system files.
        // Also remove control characters and spaces (\x00..\x20) around the filename:
        $name = trim($this->_basename(stripslashes($name)), ".\x00..\x20");
        // Use a timestamp for empty filenames:
        if (!$name) {
            $name = str_replace('.', '-', microtime(true));
        }

        return $name;
    }


    protected function _getFileName($filePath, $name, $size, $type, $error, $index,
        $contentRange)
    {
        $name = $this->_trimFileName($filePath, $name, $size, $type, $error, $index,
            $contentRange);

        return $this->_getUniqueFilename(
                $filePath,
                $this->_fixFileExtension($filePath, $name, $size, $type, $error, $index,
                    $contentRange), $size, $type, $error, $index, $contentRange
        );
    }


    protected function _getScaledImageFilePaths($fileName, $version)
    {
        $file_path = $this->_geUploadPath($fileName);
        if (!empty($version)) {
            $version_dir = $this->_geUploadPath(null, $version);
            if (!is_dir($version_dir)) {
                mkdir($version_dir, $this->_options['mkdir_mode'], true);
            }
            $new_file_path = $version_dir.'/'.$fileName;
        } else {
            $new_file_path = $file_path;
        }

        return array($file_path, $new_file_path);
    }


    protected function _gdGetImageObject($filePath, $func, $noCache = false)
    {
        if (empty($this->_imageObjects[$filePath]) || $noCache) {
            $this->_gdDestroyImageObject($filePath);
            $this->_imageObjects[$filePath] = $func($filePath);
        }

        return $this->_imageObjects[$filePath];
    }


    protected function _gdSetImageObject($filePath, $image)
    {
        $this->_gdDestroyImageObject($filePath);
        $this->_imageObjects[$filePath] = $image;
    }


    protected function _gdDestroyImageObject($filePath)
    {
        $image = (isset($this->_imageObjects[$filePath])) ? $this->_imageObjects[$filePath] : null;

        return $image && imagedestroy($image);
    }


    protected function _gdImageflip($image, $mode)
    {
        if (function_exists('imageflip')) {
            return imageflip($image, $mode);
        }
        $newWidth = $src_width = imagesx($image);
        $newHeight = $src_height = imagesy($image);
        $new_img = imagecreatetruecolor($newWidth, $newHeight);
        $src_x = 0;
        $src_y = 0;
        switch ($mode) {
            case '1': // flip on the horizontal axis
                $src_y = $newHeight - 1;
                $src_height = -$newHeight;
                break;
            case '2': // flip on the vertical axis
                $src_x = $newWidth - 1;
                $src_width = -$newWidth;
                break;
            case '3': // flip on both axes
                $src_y = $newHeight - 1;
                $src_height = -$newHeight;
                $src_x = $newWidth - 1;
                $src_width = -$newWidth;
                break;
            default:
                return $image;
        }
        imagecopyresampled(
            $new_img, $image, 0, 0, $src_x, $src_y, $newWidth, $newHeight, $src_width, $src_height
        );

        return $new_img;
    }

    /**
     *
     * @param type $filePath
     * @param type $srcImg
     * @return boolean
     */
    protected function _gdOrientImage($filePath, $srcImg)
    {
        if (!function_exists('exif_read_data')) {
            return false;
        }
        $exif = @exif_read_data($filePath);
        if ($exif === false) {
            return false;
        }
        $orientation = (int) @$exif['Orientation'];
        if ($orientation < 2 || $orientation > 8) {
            return false;
        }
        switch ($orientation) {
            case 2:
                $new_img = $this->_gdImageflip(
                    $srcImg, defined('IMG_FLIP_VERTICAL') ? IMG_FLIP_VERTICAL : 2
                );
                break;
            case 3:
                $new_img = imagerotate($srcImg, 180, 0);
                break;
            case 4:
                $new_img = $this->_gdImageflip(
                    $srcImg, defined('IMG_FLIP_HORIZONTAL') ? IMG_FLIP_HORIZONTAL : 1
                );
                break;
            case 5:
                $tmp_img = $this->_gdImageflip(
                    $srcImg, defined('IMG_FLIP_HORIZONTAL') ? IMG_FLIP_HORIZONTAL : 1
                );
                $new_img = imagerotate($tmp_img, 270, 0);
                imagedestroy($tmp_img);
                break;
            case 6:
                $new_img = imagerotate($srcImg, 270, 0);
                break;
            case 7:
                $tmp_img = $this->_gdImageflip(
                    $srcImg, defined('IMG_FLIP_VERTICAL') ? IMG_FLIP_VERTICAL : 2
                );
                $new_img = imagerotate($tmp_img, 270, 0);
                imagedestroy($tmp_img);
                break;
            case 8:
                $new_img = imagerotate($srcImg, 90, 0);
                break;
            default:
                return false;
        }
        $this->_gdSetImageObject($filePath, $new_img);

        return true;
    }


    protected function _gdCreateScaledImage($fileName, $version, $options)
    {
        if (!function_exists('imagecreatetruecolor')) {
            error_log('Function not found: imagecreatetruecolor');

            return false;
        }
        list($file_path, $new_file_path) = $this->_getScaledImageFilePaths($fileName, $version);
        $type = strtolower(substr(strrchr($fileName, '.'), 1));
        switch ($type) {
            case 'jpg':
            case 'jpeg':
                $src_func = 'imagecreatefromjpeg';
                $write_func = 'imagejpeg';
                $image_quality = isset($options['jpeg_quality']) ?
                    $options['jpeg_quality'] : 75;
                break;
            case 'gif':
                $src_func = 'imagecreatefromgif';
                $write_func = 'imagegif';
                $image_quality = null;
                break;
            case 'png':
                $src_func = 'imagecreatefrompng';
                $write_func = 'imagepng';
                $image_quality = isset($options['png_quality']) ?
                    $options['png_quality'] : 9;
                break;
            default:
                return false;
        }
        $src_img = $this->_gdGetImageObject(
            $file_path, $src_func, !empty($options['no_cache'])
        );
        $image_oriented = false;
        if (!empty($options['auto_orient']) && $this->_gdOrientImage(
                $file_path, $src_img
            )) {
            $image_oriented = true;
            $src_img = $this->_gdGetImageObject(
                $file_path, $src_func
            );
        }
        $max_width = $img_width = imagesx($src_img);
        $max_height = $img_height = imagesy($src_img);
        if (!empty($options['max_width'])) {
            $max_width = $options['max_width'];
        }
        if (!empty($options['max_height'])) {
            $max_height = $options['max_height'];
        }
        $scale = min(
            $max_width / $img_width, $max_height / $img_height
        );
        if ($scale >= 1) {
            if ($image_oriented) {
                return $write_func($src_img, $new_file_path, $image_quality);
            }
            if ($file_path !== $new_file_path) {
                return copy($file_path, $new_file_path);
            }

            return true;
        }
        if (empty($options['crop'])) {
            $new_width = $img_width * $scale;
            $new_height = $img_height * $scale;
            $dst_x = 0;
            $dst_y = 0;
            $new_img = imagecreatetruecolor($new_width, $new_height);
        } else {
            if (($img_width / $img_height) >= ($max_width / $max_height)) {
                $new_width = $img_width / ($img_height / $max_height);
                $new_height = $max_height;
            } else {
                $new_width = $max_width;
                $new_height = $img_height / ($img_width / $max_width);
            }
            $dst_x = 0 - ($new_width - $max_width) / 2;
            $dst_y = 0 - ($new_height - $max_height) / 2;
            $new_img = imagecreatetruecolor($max_width, $max_height);
        }
        // Handle transparency in GIF and PNG images:
        switch ($type) {
            case 'gif':
            case 'png':
                imagecolortransparent($new_img, imagecolorallocate($new_img, 0, 0, 0));
            case 'png':
                imagealphablending($new_img, false);
                imagesavealpha($new_img, true);
                break;
        }
        $success = imagecopyresampled(
                $new_img, $src_img, $dst_x, $dst_y, 0, 0, $new_width, $new_height, $img_width,
                $img_height
            ) && $write_func($new_img, $new_file_path, $image_quality);
        $this->_gdSetImageObject($file_path, $new_img);

        return $success;
    }


    protected function _imagickGetImageObject($filePath, $noCache = false)
    {
        if (empty($this->_imageObjects[$filePath]) || $noCache) {
            $this->_imagickDestroyImageObject($filePath);
            $image = new \Imagick();
            if (!empty($this->_options['imagick_resource_limits'])) {
                foreach ($this->_options['imagick_resource_limits'] as $type => $limit) {
                    $image->setResourceLimit($type, $limit);
                }
            }
            $image->readImage($filePath);
            $this->_imageObjects[$filePath] = $image;
        }

        return $this->_imageObjects[$filePath];
    }


    protected function _imagickSetImageObject($filePath, $image)
    {
        $this->_imagickDestroyImageObject($filePath);
        $this->_imageObjects[$filePath] = $image;
    }


    protected function _imagickDestroyImageObject($filePath)
    {
        $image = (isset($this->_imageObjects[$filePath])) ? $this->_imageObjects[$filePath] : null;

        return $image && $image->destroy();
    }


    protected function _imagickOrientImage($image)
    {
        $orientation = $image->getImageOrientation();
        $background = new \ImagickPixel('none');
        switch ($orientation) {
            case \imagick::ORIENTATION_TOPRIGHT: // 2
                $image->flopImage(); // horizontal flop around y-axis
                break;
            case \imagick::ORIENTATION_BOTTOMRIGHT: // 3
                $image->rotateImage($background, 180);
                break;
            case \imagick::ORIENTATION_BOTTOMLEFT: // 4
                $image->flipImage(); // vertical flip around x-axis
                break;
            case \imagick::ORIENTATION_LEFTTOP: // 5
                $image->flopImage(); // horizontal flop around y-axis
                $image->rotateImage($background, 270);
                break;
            case \imagick::ORIENTATION_RIGHTTOP: // 6
                $image->rotateImage($background, 90);
                break;
            case \imagick::ORIENTATION_RIGHTBOTTOM: // 7
                $image->flipImage(); // vertical flip around x-axis
                $image->rotateImage($background, 270);
                break;
            case \imagick::ORIENTATION_LEFTBOTTOM: // 8
                $image->rotateImage($background, 270);
                break;
            default:
                return false;
        }
        $image->setImageOrientation(\imagick::ORIENTATION_TOPLEFT); // 1
        return true;
    }


    protected function _imagickCreateScaledImage($fileName, $version, $options)
    {
        list($file_path, $new_file_path) = $this->_getScaledImageFilePaths($fileName, $version);
        $image = $this->_imagickGetImageObject(
            $file_path, !empty($options['crop']) || !empty($options['no_cache'])
        );
        if ($image->getImageFormat() === 'GIF') {
            // Handle animated GIFs:
            $images = $image->coalesceImages();
            foreach ($images as $frame) {
                $image = $frame;
                $this->_imagickSetImageObject($fileName, $image);
                break;
            }
        }
        $image_oriented = false;
        if (!empty($options['auto_orient'])) {
            $image_oriented = $this->_imagickOrientImage($image);
        }
        $new_width = $max_width = $img_width = $image->getImageWidth();
        $new_height = $max_height = $img_height = $image->getImageHeight();
        if (!empty($options['max_width'])) {
            $new_width = $max_width = $options['max_width'];
        }
        if (!empty($options['max_height'])) {
            $new_height = $max_height = $options['max_height'];
        }
        if (!($image_oriented || $max_width < $img_width || $max_height < $img_height)) {
            if ($file_path !== $new_file_path) {
                return copy($file_path, $new_file_path);
            }

            return true;
        }
        $crop = !empty($options['crop']);
        if ($crop) {
            $x = 0;
            $y = 0;
            if (($img_width / $img_height) >= ($max_width / $max_height)) {
                $new_width = 0; // Enables proportional scaling based on max_height
                $x = ($img_width / ($img_height / $max_height) - $max_width) / 2;
            } else {
                $new_height = 0; // Enables proportional scaling based on max_width
                $y = ($img_height / ($img_width / $max_width) - $max_height) / 2;
            }
        }
        $success = $image->resizeImage(
            $new_width, $new_height,
            isset($options['filter']) ? $options['filter'] : \imagick::FILTER_LANCZOS,
            isset($options['blur']) ? $options['blur'] : 1,
            $new_width && $new_height // fit image into constraints if not to be cropped
        );
        if ($success && $crop) {
            $success = $image->cropImage(
                $max_width, $max_height, $x, $y
            );
            if ($success) {
                $success = $image->setImagePage($max_width, $max_height, 0, 0);
            }
        }
        $type = strtolower(substr(strrchr($fileName, '.'), 1));
        switch ($type) {
            case 'jpg':
            case 'jpeg':
                if (!empty($options['jpeg_quality'])) {
                    $image->setImageCompression(\imagick::COMPRESSION_JPEG);
                    $image->setImageCompressionQuality($options['jpeg_quality']);
                }
                break;
        }
        if (!empty($options['strip'])) {
            $image->stripImage();
        }

        return $success && $image->writeImage($new_file_path);
    }


    protected function _imagemagickCreateScaledImage($fileName, $version, $options)
    {
        list($file_path, $new_file_path) = $this->_getScaledImageFilePaths($fileName, $version);
        $resize = @$options['max_width']
            .(empty($options['max_height']) ? '' : 'X'.$options['max_height']);
        if (!$resize && empty($options['auto_orient'])) {
            if ($file_path !== $new_file_path) {
                return copy($file_path, $new_file_path);
            }

            return true;
        }
        $cmd = $this->_options['convert_bin'];
        if (!empty($this->_options['convert_params'])) {
            $cmd .= ' '.$this->_options['convert_params'];
        }
        $cmd .= ' '.escapeshellarg($file_path);
        if (!empty($options['auto_orient'])) {
            $cmd .= ' -auto-orient';
        }
        if ($resize) {
            // Handle animated GIFs:
            $cmd .= ' -coalesce';
            if (empty($options['crop'])) {
                $cmd .= ' -resize '.escapeshellarg($resize.'>');
            } else {
                $cmd .= ' -resize '.escapeshellarg($resize.'^');
                $cmd .= ' -gravity center';
                $cmd .= ' -crop '.escapeshellarg($resize.'+0+0');
            }
            // Make sure the page dimensions are correct (fixes offsets of animated GIFs):
            $cmd .= ' +repage';
        }
        if (!empty($options['convert_params'])) {
            $cmd .= ' '.$options['convert_params'];
        }
        $cmd .= ' '.escapeshellarg($new_file_path);
        exec($cmd, $output, $error);
        if ($error) {
            error_log(implode('\n', $output));

            return false;
        }

        return true;
    }


    protected function _getImageSize($filePath)
    {
        if ($this->_options['image_library']) {
            if (extension_loaded('imagick')) {
                $image = new \Imagick();
                try {
                    if (@$image->pingImage($filePath)) {
                        $dimensions = array($image->getImageWidth(), $image->getImageHeight());
                        $image->destroy();

                        return $dimensions;
                    }

                    return false;
                } catch (\Exception $e) {
                    error_log($e->getMessage());
                }
            }
            if ($this->_options['image_library'] === 2) {
                $cmd = $this->_options['identify_bin'];
                $cmd .= ' -ping '.escapeshellarg($filePath);
                exec($cmd, $output, $error);
                if (!$error && !empty($output)) {
                    // image.jpg JPEG 1920x1080 1920x1080+0+0 8-bit sRGB 465KB 0.000u 0:00.000
                    $infos = preg_split('/\s+/', substr($output[0], strlen($filePath)));
                    $dimensions = preg_split('/x/', $infos[2]);

                    return $dimensions;
                }

                return false;
            }
        }
        if (!function_exists('getimagesize')) {
            error_log('Function not found: getimagesize');

            return false;
        }

        return @getimagesize($filePath);
    }


    protected function _createScaledImage($fileName, $version, $options)
    {
        if ($this->_options['image_library'] === 2) {
            return $this->_imagemagickCreateScaledImage($fileName, $version, $options);
        }
        if ($this->_options['image_library'] && extension_loaded('imagick')) {
            return $this->_imagickCreateScaledImage($fileName, $version, $options);
        }

        return $this->_gdCreateScaledImage($fileName, $version, $options);
    }


    protected function _destroyImageObject($filePath)
    {
        if ($this->_options['image_library'] && extension_loaded('imagick')) {
            return $this->_imagickDestroyImageObject($filePath);
        }
    }


    protected function _isValidImageFile($filePath)
    {
        if (!preg_match($this->_options['image_file_types'], $filePath)) {
            return false;
        }
        if (function_exists('exif_imagetype')) {
            return @exif_imagetype($filePath);
        }
        $image_info = $this->_getImageSize($filePath);

        return $image_info && $image_info[0] && $image_info[1];
    }


    protected function _handleImageFile($filePath, $file)
    {
        $failed_versions = array();
        foreach ($this->_options['image_versions'] as $version => $options) {
            if ($this->_createScaledImage($file->name, $version, $options)) {
                if (!empty($version)) {
                    $file->{$version.'Url'} = $this->_getDownloadUrl(
                        $file->name, $version
                    );
                } else {
                    $file->size = $this->_getFileSize($filePath, true);
                }
            } else {
                $failed_versions[] = $version ? $version : 'original';
            }
        }
        if (count($failed_versions)) {
            $file->error = $this->_getErrorMessage('image_resize')
                .' ('.implode($failed_versions, ', ').')';
        }
        // Free memory:
        $this->_destroyImageObject($filePath);
    }


    protected function _handleFileUpload($uploadedFile, $name, $size, $type, $error,
        $index = null, $contentRange = null)
    {
        $file = new \stdClass();
        $file->name = $this->_getFileName($uploadedFile, $name, $size, $type, $error, $index,
            $contentRange);
        $file->size = $this->_fixIntegerOverflow((int) $size);
        $file->type = $type;
        if ($this->_validate($uploadedFile, $file, $error, $index)) {
            $this->_handleFormData($file, $index);
            $upload_dir = $this->_geUploadPath();
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, $this->_options['mkdir_mode'], true);
            }
            $file_path = $this->_geUploadPath($file->name);
            $append_file = $contentRange && is_file($file_path) &&
                $file->size > $this->_getFileSize($file_path);
            if ($uploadedFile && is_uploaded_file($uploadedFile)) {
                // multipart/formdata uploads (POST method uploads)
                if ($append_file) {
                    file_put_contents(
                        $file_path, fopen($uploadedFile, 'r'), FILE_APPEND
                    );
                } else {
                    move_uploaded_file($uploadedFile, $file_path);
                }
            } else {
                // Non-multipart uploads (PUT method support)
                file_put_contents(
                    $file_path, fopen($this->_options['input_stream'], 'r'),
                    $append_file ? FILE_APPEND : 0
                );
            }
            $file_size = $this->_getFileSize($file_path, $append_file);
            if ($file_size === $file->size) {
                $file->url = $this->_getDownloadUrl($file->name);
                if ($this->_isValidImageFile($file_path)) {
                    $this->_handleImageFile($file_path, $file);
                }
            } else {
                $file->size = $file_size;
                if (!$contentRange && $this->_options['discard_aborted_uploads']) {
                    unlink($file_path);
                    $file->error = $this->_getErrorMessage('abort');
                }
            }
            $this->_setAdditionalFileProperties($file);
        }

        return $file;
    }


    protected function _readfile( $filePath )
    {
        $file_size = $this->_getFileSize($filePath);
        $chunk_size = $this->_options['readfile_chunk_size'];
        if ( $chunk_size && $file_size > $chunk_size ) {
            $handle = fopen($filePath, 'rb');
            while ( !feof($handle) ) {
                echo fread($handle, $chunk_size);
                @ob_flush();
                @flush();
            }
            fclose($handle);

            return $file_size;
        }

        return readfile($filePath);
    }


    /**
     * Print http body contents by given string.
     *
     * @param string $str
     */
    protected function _body( $str )
    {
        echo $str;
    }


    /**
     * Outputs http header.
     *
     * @param string $str http header string
     */
    protected function _header( $str )
    {
        header($str);
    }


    protected function _getUploadData( $id )
    {
        return @$_FILES[$id];
    }


    protected function _getPostParam( $id )
    {
        return @$_POST[$id];
    }


    protected function _getQueryParam( $id )
    {
        return @$_GET[$id];
    }


    protected function _getServerVar( $id )
    {
        return @$_SERVER[$id];
    }


    protected function _handleFormData( $file, $index )
    {
        // Handle form data, e.g. $_POST['description'][$index]
    }


    protected function _getVersionParam()
    {
        return $this->_basename(stripslashes($this->_getQueryParam('version')));
    }


    protected function _getSingularParamName()
    {
        return substr($this->_options['param_name'], 0, -1);
    }


    protected function _getFileNameParam()
    {
        $name = $this->_getSingularParamName();

        return $this->_basename(stripslashes($this->_getQueryParam($name)));
    }


    protected function _getFileNamesParams()
    {
        $params = $this->_getQueryParam($this->_options['param_name']);
        if ( !$params ) {
            return null;
        }
        foreach ( $params as $key => $value ) {
            $params[$key] = $this->_basename(stripslashes($value));
        }

        return $params;
    }


    protected function _getFileType( $filePath )
    {
        switch ( strtolower(pathinfo($filePath, PATHINFO_EXTENSION)) )
        {
            case 'jpeg':
            case 'jpg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            default:
                return '';
        }
    }


    /**
     * Output header including a file download on success.
     *
     * @todo this stuff is too complicated. nosniff may be already set in ab .htaccess or
     * other server configs.
     * This is probably confusion in other methodes too.
     *      1. collect headers you want to set in order
     *          e.g.: _header[ str|order ] = str (you may want to manage headers before executing)
     *      2. dispatch() / output() / show() example methode name to use the collected data and
     *         pipes it out.
     *
     * @return http headers for a download or headers including error messages
     */
    protected function _download()
    {
        switch ($this->_options['download_via_php']) {
            case 1:
                $redirect_header = null;
                break;
            case 2:
                $redirect_header = 'X-Sendfile';
                break;
            case 3:
                $redirect_header = 'X-Accel-Redirect';
                break;
            default:
                return $this->_header('HTTP/1.1 403 Forbidden');
        }
        $file_name = $this->_getFileNameParam();
        if (!$this->_isValidFileObject($file_name)) {
            return $this->_header('HTTP/1.1 404 Not Found');
        }
        if ($redirect_header) {
            return $this->_header(
                    $redirect_header.': '.$this->_getDownloadUrl(
                        $file_name, $this->_getVersionParam(), true
                    )
            );
        }
        $filePath = $this->_geUploadPath($file_name, $this->_getVersionParam());

        // Prevent browsers from MIME-sniffing the content-type:
        $this->_header('X-Content-Type-Options: nosniff');
        if (!preg_match($this->_options['inline_file_types'], $file_name)) {
            $this->_header('Content-Type: application/octet-stream');
            $this->_header('Content-Disposition: attachment; filename="'.$file_name.'"');
        } else {
            $this->_header('Content-Type: '.$this->_getFileType($filePath));
            $this->_header('Content-Disposition: inline; filename="'.$file_name.'"');
        }
        $this->_header('Content-Length: '.$this->_getFileSize($filePath));
        $this->_header('Last-Modified: '.gmdate('D, d M Y H:i:s T', filemtime($filePath)));
        $this->_readfile($filePath);
    }


    protected function _sendContentTypeHeader()
    {
        $this->_header('Vary: Accept');
        if (strpos($this->_getServerVar('HTTP_ACCEPT'), 'application/json') !== false) {
            $this->_header('Content-type: application/json');
        } else {
            $this->_header('Content-type: text/plain');
        }
    }


    protected function _sendAccessControlHeaders()
    {
        $this->_header('Access-Control-Allow-Origin: ' . $this->_options['access_control_allow_origin']);
        $this->_header('Access-Control-Allow-Credentials: '
            . ($this->_options['access_control_allow_credentials'] ? 'true' : 'false'));
        $this->_header('Access-Control-Allow-Methods: '
            . implode(', ', $this->_options['access_control_allow_methods']));
        $this->_header('Access-Control-Allow-Headers: '
            . implode(', ', $this->_options['access_control_allow_headers']));
    }


    protected function _basename( $filePath, $suffix = null )
    {
        $splited = preg_split('/\//', rtrim($filePath, '/ '));

        return substr(basename('X' . $splited[count($splited) - 1], $suffix), 1);
    }

}
