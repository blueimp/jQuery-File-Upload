<?php

session_start();

if(strpos($_GET['image'],"..") !== false || strpos($_GET['image'],"://") !== false || $_GET['image'] === null || strpos($_GET['image'],"favorite.json")!== false) {
  http_response_code(404);
  exit;
}
// open the file in a binary mode
$name = $_SESSION['customerDataDir']."/userdata/media/".$_GET['image'];
$fp = fopen($name, 'rb');
if($fp === false) {
  http_response_code(404);
  exit;
}


$imageIsLogo = strpos($name, "logos/");

session_start();
if ($_SESSION["login"] != 1 && ($imageIsLogo == false)){
        echo '<meta http-equiv="refresh" content="0; URL='.$_SESSION['logoff_page']."c=".$_SESSION['category']."&id=".$_SESSION['primarykey'].'">';
        exit;
  }
// send the right headers
header("Content-Type: image/*");
header("Content-Length: " . filesize($name));


// dump the picture and stop the script
fpassthru($fp);
exit;
