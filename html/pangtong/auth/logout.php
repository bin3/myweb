<?php
header("Content-type: text/html; charset=utf-8"); 

include_once 'settings.php';
include_once ABSPATH.'conf/config.php';

session_set_cookie_params(time() + $config['cookie']['lifetime'] , '/', $config['url']['domain']);
if(!isset($_SESSION)){
  session_start();
}

unset($_SESSION['access_token']);
//setcookie ("user_id", "", time() - 3600);
setcookie("user_id", "", time() - 3600, '/', $config['url']['domain']);

// Redirect to wbstat index page
header("Location: ".$config['url']['base']);

?>
<!--
<a href=".">登出成功了吗？</a>
-->