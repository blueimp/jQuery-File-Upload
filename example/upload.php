<?php
/*
 * jQuery File Upload Plugin PHP Example 4.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

error_reporting(E_ALL | E_STRICT);

$script_dir = dirname(__FILE__);
$upload_dir = $script_dir.'/files/';
$thumbnails_dir = $script_dir.'/thumbnails/';
$thumbnail_max_width = $thumbnail_max_height = 80;

class UploadHandler
{
    private $upload_dir;
    
    function __construct($upload_dir, $thumbnails_dir, $thumbnail_max_width, $thumbnail_max_height) {
        $this->upload_dir = $upload_dir;
        $this->thumbnails_dir = $thumbnails_dir;
        $this->thumbnail_max_width = $thumbnail_max_width;
        $this->thumbnail_max_height = $thumbnail_max_height;
    }
    
    private function get_file_object ($file_name) {
        $file_path = $this->upload_dir.$file_name;
        if (is_file($file_path) && $file_name[0] !== '.') {
            $file = new stdClass();
            $file->name = $file_name;
            $file->size = filesize($file_path);
            $file->thumbnail = is_file($this->thumbnails_dir.$file_name);
            return $file;
        }
        return null;
    }

    private function create_thumbnail ($file_name) {
        $file_path = $this->upload_dir.$file_name;
        $thumbnail_path = $this->thumbnails_dir.$file_name;
        list($img_width, $img_height) = @getimagesize($file_path);
        if (!$img_width || !$img_height) {
            return false;
        }
        $scale = min(
            $this->thumbnail_max_width / $img_width,
            $this->thumbnail_max_height / $img_height
        );
        if ($scale > 1) {
            $scale = 1;
        }
        $thumbnail_width = $img_width * $scale;
        $thumbnail_height = $img_height * $scale;
        $thumbnail_img = @imagecreatetruecolor($thumbnail_width, $thumbnail_height);
        switch (strtolower(substr(strrchr($file_name, '.'), 1))) {
            case 'jpg':
            case 'jpeg':
                $src_img = @imagecreatefromjpeg($file_path);
                $write_thumbnail = 'imagejpeg';
                break;
            case 'gif':
                $src_img = @imagecreatefromgif($file_path);
                $write_thumbnail = 'imagegif';
                break;
            case 'png':
                $src_img = @imagecreatefrompng($file_path);
                $write_thumbnail = 'imagepng';
                break;
            default:
                $src_img = $write_thumbnail = null;
        }
        $success = $src_img && @imagecopyresampled(
            $thumbnail_img,
            $src_img,
            0, 0, 0, 0,
            $thumbnail_width,
            $thumbnail_height,
            $img_width,
            $img_height
        ) && $write_thumbnail($thumbnail_img, $thumbnail_path);
        // Free up memory (imagedestroy does not delete files):
        @imagedestroy($src_img);
        @imagedestroy($thumbnail_img);
        return $success;
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
        $file->size = intval(isset($headers['X-File-Size']) ? $headers['X-File-Size'] : $file_request['size']);
        if ($file->name[0] === '.') {
            $file->name = substr($file->name, 1);
        }
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
            $file_size = filesize($file_path);
            if ($file_size === $file->size) {
                $file->thumbnail = $this->create_thumbnail($file->name);
            }
            $file->size = $file_size;
        }
        if (isset($headers['X-Requested-With']) && $headers['X-Requested-With'] === 'XMLHttpRequest') {
            header('Content-type: application/json');
        }
        echo json_encode($file);
    }
    
    public function delete () {
        $file_name = isset($_REQUEST['file']) ? basename(stripslashes($_REQUEST['file'])) : null;
        $file_path = $this->upload_dir.$file_name;
        $thumbnail_path = $this->thumbnails_dir.$file_name;
        $success = is_file($file_path) && $file_name[0] !== '.' && unlink($file_path);
        if ($success && is_file($thumbnail_path)) {
            unlink($thumbnail_path);
        }
        header('Content-type: application/json');
        echo json_encode($success);
    }
}

$upload_handler = new UploadHandler($upload_dir, $thumbnails_dir, $thumbnail_max_width, $thumbnail_max_height);

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