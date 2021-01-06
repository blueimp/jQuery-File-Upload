<?php
session_start();



include $_SESSION['getcwd']."/include_files/writelog.php";
include $_SESSION['getcwd']."/include_files/xml_load.php";
include $_SESSION['getcwd']."/include_files/db_connect.php";
include $_SESSION['getcwd']."/include_files/htmlprint.php";
include $_SESSION['getcwd']."/include_files/checkCategory.php";

writelog("Visited Upload Index");

//variables for uploadhandler. differ between uploading path of catalogs or uploading path of photos etc.
if($_GET['upload']=="catalogs"){
    $_SESSION['galleryCategory'] = "catalogs";
}
if($_GET['upload']=="photos"){
    $_SESSION['galleryCategory'] = "photos";
}






if ($_SESSION["login"] != 1)
    {
        echo '<meta http-equiv="refresh" content="0; URL='.$_SESSION['logoff_page']."c=".$_SESSION['category']."&id=".$_SESSION['primarykey'].'">';
        exit;
    }

$urlParam = NULL;

//some urls cant be transferred with ? and & letters
//if(filter_input( INPUT_GET, 'upload', FILTER_SANITIZE_URL) == $_SESSION['galleryCategory']){
//    $_SESSION['urlParamCatalogs'] = "?login=true&upload=".$_SESSION['galleryCategory'];
//}
checkCategory();


$now = time();

include $_SESSION['getcwd']."/include_files/sessionTimeout.php";

$var = $now + 60* intval($adminfields->session_logoff);
$now_db = date('Y-m-d H:i:s', $var);
mysqli_query($con,"UPDATE login_usernamen SET active='$now_db' WHERE id=".$_SESSION['userid']);



                ?>


<!DOCTYPE HTML>
<!--
/*
 * jQuery File Upload Plugin Demo
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
-->
<html lang="en">
<head>
<!-- Force latest IE rendering engine or ChromeFrame if installed -->
<!--[if IE]>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<![endif]-->

<title><?php echo $_SESSION['app_name'];?> File Upload</title>
<meta name="description" content="File Upload widget with multiple file selection, drag&amp;drop support, progress bars, validation and preview images, audio and video for jQuery. Supports cross-domain, chunked and resumable file uploads and client-side image resizing. Works with any server-side platform (PHP, Python, Ruby on Rails, Java, Node.js, Go etc.) that supports standard HTML form file uploads.">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Bootstrap styles -->
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
<!-- Generic page styles -->
<link rel="stylesheet" href="css/style.css">
<!-- blueimp Gallery styles -->
<link rel="stylesheet" href="css/Gallery/blueimp-gallery.min.css">
<!-- CSS to style the file input field as button and adjust the Bootstrap progress bars -->
<link rel="stylesheet" href="css/jquery.fileupload.css">
<link rel="stylesheet" href="css/jquery.fileupload-ui.css">
<style media="screen">
div.popup {
  padding: 20px;
  border: 3px solid;
  display: block;
  position: fixed;
  width: 80%;
  margin: auto;
  left: 0;
  right: 0;
  margin-top: -40%;
  opacity: 0.0;
  transition: margin-top 1s,opacity 1s;
  border-width: thin;
  border-radius: 5px;
  box-shadow: 1px 1px 1px lightgrey;
  z-index: 9999;
  color: #666;
  font-family: "Helvetiva";
  background-color: rgb(212,237,218);
  border-color: rgb(195,230,203);
}


div.popupButtonDiv {
  display: inline;
  float: right;
}

div.popupButtonDiv a {
  text-decoration: none;
  font-family: sans-serif;
  color: rgb(117,162,12);

}

div.popupContent {
  display: inline;
  margin: auto;
}
</style>
<!-- CSS adjustments for browsers with JavaScript disabled -->
<noscript><link rel="stylesheet" href="css/jquery.fileupload-noscript.css"></noscript>
<noscript><link rel="stylesheet" href="css/jquery.fileupload-ui-noscript.css"></noscript>

</head>
<body>
  <div class="popup">
    <div class="popupContent">
      <?php echo $texts->attachFile->favoriteSet."!";?>
    </div>
    <div class="popupButtonDiv">
      <a href="javascript:function hide() {  const popup = document.getElementsByClassName('popup')[0];
        popup.style.opacity = 0.0;
        popup.style.marginTop = '-40%'} hide();">X</a>
    </div>
  </div>
<center>
    <!-- The file upload form used as target for the file upload widget -->
    <form id="fileupload" method="POST" enctype="multipart/form-data">
        <!-- The fileupload-buttonbar contains buttons to add/delete files and start/cancel the upload -->
        <div class="row fileupload-buttonbar">
            <div class="col-lg-7">
                <!-- The fileinput-button span is used to style the file input field as button -->
                <span class="btn btn-success fileinput-button">
                    <i class="glyphicon glyphicon-plus"></i>
                    <span><?php echo iconv('ISO-8859-1', 'UTF-8', htmlPrint($texts->attachFile->addFile));?></span>
                    <input type="file" name="files[]" multiple>
                </span>
                <button type="submit" class="btn btn-primary start">
                    <i class="glyphicon glyphicon-upload"></i>
                    <span><?php echo iconv('ISO-8859-1', 'UTF-8', htmlPrint($texts->attachFile->startUpload));?></span>
                </button>
                <button type="reset" class="btn btn-warning cancel">
                    <i class="glyphicon glyphicon-ban-circle"></i>
                    <span><?php echo iconv('ISO-8859-1', 'UTF-8', htmlPrint($texts->attachFile->cancelUpload));?></span>
                </button>
                <button type="button" class="btn btn-danger delete">
                    <i class="glyphicon glyphicon-trash"></i>
                    <span><?php echo iconv('ISO-8859-1', 'UTF-8', htmlPrint($texts->attachFile->delete));?></span>
                </button>
                <input type="checkbox" class="toggle">
                <!-- The global file processing state -->
                <span class="fileupload-process"></span>
            </div>
            <!-- The global progress state -->
            <div class="col-lg-5 fileupload-progress fade">
                <!-- The global progress bar -->
                <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar progress-bar-success" style="width:0%;"></div>
                </div>
                <!-- The extended global progress state -->
                <div class="progress-extended">&nbsp;</div>
            </div>
        </div>
        <!-- The table listing the files available for upload/download -->
        <table role="presentation" class="table table-striped"><tbody class="files"></tbody></table>
    </form>


<!-- The blueimp Gallery widget -->
<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls" data-filter=":even">
    <div class="slides"></div>
    <h3 class="title"></h3>
    <a class="prev">‹</a>
    <a class="next">›</a>
    <a class="close">×</a>
    <a class="play-pause"></a>
    <ol class="indicator"></ol>
</div>
<!-- The template to display files available for upload -->
<script id="template-upload" type="text/x-tmpl">
{% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-upload fade">
        <td>
            <span class="preview"></span>
        </td>
        <td>
            <p class="name">{%=file.name%}</p>
            <strong class="error text-danger"></strong>
        </td>
        <td>
            <p class="size">Processing...</p>
            <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar progress-bar-success" style="width:0%;"></div></div>
        </td>
        <td>
            {% if (!i && !o.options.autoUpload) { %}
                <button class="btn btn-primary start" disabled>
                    <i class="glyphicon glyphicon-upload"></i>
                    <span>Start</span>
                </button>
            {% } %}
            {% if (!i) { %}
                <button class="btn btn-warning cancel">
                    <i class="glyphicon glyphicon-ban-circle"></i>
                    <span>Cancel</span>
                </button>
            {% } %}
        </td>
    </tr>
{% } %}
</script>
<!-- The template to display files available for download -->
<script id="template-download" type="text/x-tmpl">
{% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-download fade">
        <td>
            <span class="preview">
                {% if (file.thumbnailUrl) { %}
                    <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" data-gallery><img src="{%=file.thumbnailUrl%}"></a>
                {% } %}
            </span>
        </td>
        <td>
            <p class="name">
                {% if (file.url) { %}
                    <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" {%=file.thumbnailUrl?'data-gallery':''%}>{%=file.name%}</a>
                {% } else { %}
                    <span>{%=file.name%}</span>
                {% } %}
            </p>
            {% if (file.error) { %}
                <div><span class="label label-danger">Error</span> {%=file.error%}</div>
            {% } %}
        </td>
        <td>
            <span class="size">{%=o.formatFileSize(file.size)%}</span>
        </td>
        <td>
      <button class="btn btn-warning fav">
          <i class="glyphicon glyphicon-star"></i>
          <span><?php echo iconv('ISO-8859-1', 'UTF-8', htmlPrint($texts->attachFile->favorite));?></span>
      </button>
      </td>
        <td>
            {% if (file.deleteUrl) { %}
                <button class="btn btn-danger delete" data-type="{%=file.deleteType%}" data-url="{%=file.deleteUrl%}"{% if (file.deleteWithCredentials) { %} data-xhr-fields='{"withCredentials":true}'{% } %}>
                    <i class="glyphicon glyphicon-trash"></i>
                    <span><?php echo iconv('ISO-8859-1', 'UTF-8', htmlPrint($texts->attachFile->delete));?></span>
                </button>
                <input type="checkbox" name="delete" value="1" class="toggle">
            {% } else { %}
                <button class="btn btn-warning cancel">
                    <i class="glyphicon glyphicon-ban-circle"></i>
                    <span>Cancel</span>
                </button>
            {% } %}
        </td>
    </tr>
{% } %}
</script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<!-- The jQuery UI widget factory, can be omitted if jQuery UI is already included -->
<script src="js/vendor/jquery.ui.widget.js"></script>
<!-- The Templates plugin is included to render the upload/download listings -->
<script src="js/JavaScript-Templates/js/tmpl.min.js"></script>
<!-- The Load Image plugin is included for the preview images and image resizing functionality -->
<script src="js/JavaScript-Load-Image/js/load-image.all.min.js"></script>
<!-- The Canvas to Blob plugin is included for image resizing functionality -->
<script src="js/JavaScript-Canvas-to-Blob/js/canvas-to-blob.min.js"></script>
<!-- Bootstrap JS is not required, but included for the responsive demo navigation -->
<script src="//netdna.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
<!-- blueimp Gallery script -->
<script src="js/Gallery/js/jquery.blueimp-gallery.min.js"></script>
<!-- The Iframe Transport is required for browsers without support for XHR file uploads -->
<script src="js/jquery.iframe-transport.js"></script>
<!-- The basic File Upload plugin -->
<script src="js/jquery.fileupload.js"></script>
<!-- The File Upload processing plugin -->
<script src="js/jquery.fileupload-process.js"></script>
<!-- The File Upload image preview & resize plugin -->
<script src="js/jquery.fileupload-image.js"></script>
<!-- The File Upload audio preview plugin -->
<script src="js/jquery.fileupload-audio.js"></script>
<!-- The File Upload video preview plugin -->
<script src="js/jquery.fileupload-video.js"></script>
<!-- The File Upload validation plugin -->
<script src="js/jquery.fileupload-validate.js"></script>
<!-- The File Upload user interface plugin -->
<script src="js/jquery.fileupload-ui.js"></script>
<!-- The main application script -->
<script src="js/main.js"></script>


<!-- The XDomainRequest Transport is included for cross-domain file deletion for IE 8 and IE 9 -->
<!--[if (gte IE 8)&(lt IE 10)]>
<script src="js/cors/jquery.xdr-transport.js"></script>
<![endif]-->
<a href="
    <?php
 session_start();
 //echo $_SESSION['server_name'].'/Basis.php?c='.$_SESSION['category'].'&id='.$_SESSION['primarykey'];
 echo $_SESSION['server_name']."/Basis.php?c=".$_SESSION['category']."&id=".$_SESSION['primarykey'];
 ?>
   " style="font-size: 30px"><?php echo iconv('ISO-8859-1', 'UTF-8', htmlPrint($texts->general->back_button));?></a>
</center>



</body>

<script>setTimeout(function() {window.location.href = "<?php echo $_SESSION['logoff_page'];?>";},<?php $time = 60000 * intval($adminfields->session_logoff); echo ''.$time; ?>);</script>
</html>
