<?php
session_start();
if ($_SESSION["login"] != 1){
	       echo '<meta http-equiv="refresh" content="0; URL='.$_SESSION['logoff_page']."c=".$_SESSION['category']."&id=".$_SESSION['primarykey'].'">';
	       exit;
    }

if(!isset($_GET['name'])) {exit;}

$name = htmlspecialchars($_GET['name']);
$fp = fopen($_SESSION['customerDataDir']."/userdata/media/files/" . $_SESSION['category'] . "/". $_SESSION['primarykey'] ."/favorite.json","w+");
if($fp) {
var_dump(fwrite($fp,$name));
fclose($fp);
} else {
  echo "fp is null";
}
