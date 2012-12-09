<?php
header("Content-type: text/html; charset=utf-8");

include_once 'settings.php';
include_once ABSPATH.'conf/config.php';
include_once ABSPATH.'lib/global.php';
include_once ABSPATH.'lib/sinaweibo/weibooauth.php';

session_set_cookie_params(time() + $config['cookie']['lifetime'] , '/', $config['url']['domain']);
if(!isset($_SESSION)){
	//session_set_cookie_params(time() + $config['cookie']['lifetime'] , '/', $config['url']['domain']);
	session_start();
}

$o = new WeiboOAuth( WB_AKEY , WB_SKEY , $_SESSION['keys']['oauth_token'] , $_SESSION['keys']['oauth_token_secret']  );

$access_token = $o->getAccessToken(  $_REQUEST['oauth_verifier'] ) ;

$_SESSION['access_token'] = $access_token;

$oauth_token = $access_token['oauth_token'];
$oauth_token_secret = $access_token['oauth_token_secret'];
$user_id = $access_token['user_id'];

/*
在PHP中用header("location:test.php")进行跳转要注意以下几点：
1、location和":"号间不能有空格，否则会出错。
2、在用header前不能有任何的输出。
3、header后的PHP代码还会被执行。
*/
// Redirect to wbstat index page
header("Location: ".$config['url']['base']);

//setcookie("user_id", $user_id);
//setcookie("user_id", $user_id, time() + $config['cookie']['lifetime']);  /* expire in 30 days */
// 设置cookie前不能输出任何东西，否则cookie无效
setcookie("user_id", $user_id, time() + $config['cookie']['lifetime'], '/', $config['url']['domain']);

register_user($oauth_token, $oauth_token_secret, $user_id);

/*// debug
echo "<pre><h2>access token</h2>";
var_dump($access_token);
echo "</pre>";
*/

?>



