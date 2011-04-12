<?php
/*
 * jQuery File Upload Plugin PHP Example 4.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

error_reporting(E_ALL | E_STRICT);

$upload_dir = dirname(__FILE__).'/upload/';

class UploadHandler
{
    private $upload_dir;
    
    function __construct($upload_dir) {
        $this->upload_dir = $upload_dir;
    }
    
    private function get_file_object ($file_name) {
        $file_path = $this->upload_dir.$file_name;
        if ($file_name[0] === '.' || !is_file($file_path)) {
            return null;
        }
        $file = new stdClass();
        $file->name = $file_name;
        $file->size = filesize($file_path);
        return $file;
    }
    
    public function get () {
        $file_name = isset($_REQUEST['file']) ? basename(stripslashes($_REQUEST['file'])) : null;
               
        if ($file_name) {
            $info = $this->get_file_object($file_name);
        } else {
            $info = array_values(array_filter(array_map(
                array($this, 'get_file_object'),
                scandir($this->upload_dir)
            )));
        }
        
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');
        echo json_encode($info);
    }
    
    public function post () {
        $headers = getallheaders();
        $file_request = isset($_FILES['file']) ? $_FILES['file'] : null;
        $uploaded_file = $file_request ? $file_request['tmp_name'] : null;

        $file = new stdClass();
        $file->name = basename(isset($headers['X-File-Name']) ? $headers['X-File-Name'] : $file_request['name']);
        $file->type = isset($headers['X-File-Type']) ? $headers['X-File-Type'] : $file_request['type'];
        $file->size = intval(isset($headers['X-File-Size']) ? $headers['X-File-Size'] : $file_request['size']);

        if ($file->name) {
            $file_path = $this->upload_dir.$file->name;
            $append_file = is_file($file_path) && $file->size > filesize($file_path);
            clearstatcache();

            if ($uploaded_file && is_uploaded_file($uploaded_file)) {
                // multipart/formdata uploads (POST method uploads)
                if ($append_file) {
                    file_put_contents(
                        $file_path,
                        fopen($uploaded_file, 'r'),
                        FILE_APPEND
                    );
                } else {
                    move_uploaded_file($uploaded_file, $file_path);
                }
            } else {
                // Non-multipart uploads (PUT method support)
                file_put_contents(
                    $file_path,
                    fopen('php://input', 'r'),
                    $append_file ? FILE_APPEND : 0
                );
            }
            $file->size = filesize($file_path);
        }

        if (isset($headers['X-Requested-With']) && $headers['X-Requested-With'] === 'XMLHttpRequest') {
            header('Content-type: application/json');
        }
        echo json_encode($file);
    }
    
    public function delete () {
        $file_name = isset($_REQUEST['file']) ? basename(stripslashes($_REQUEST['file'])) : null;
        $file_path = $this->upload_dir.$file_name;
        $success = is_file($file_path) && unlink($file_path);
        
        header('Content-type: application/json');
        echo json_encode($success);
    }
}

$upload_handler = new UploadHandler($upload_dir);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'HEAD':
    case 'GET':
        $upload_handler->get();
        break;
    case 'POST':
        $upload_handler->post();
        break;
    case 'DELETE':
        $upload_handler->delete();
        break;
    default:
        header('HTTP/1.0 405 Method Not Allowed');
}
?>