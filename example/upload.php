<?php
$file = $_FILES['file'];
echo '{"name":"'.$file['name'].'","type":"'.$file['type'].'","size":"'.$file['size'].'"}';
?>