<?php
header("Content-type: text/html; charset=utf-8"); 

include_once 'settings.php';
include_once ABSPATH.'conf/config.php';
include_once ABSPATH.'lib/sinaweibo/weibooauth.php';

session_set_cookie_params(time() + $config['cookie']['lifetime'] , '/', $config['url']['domain']);
if(!isset($_SESSION)){
	//session_set_cookie_params(time() + $config['cookie']['lifetime'] , '/', $config['url']['domain']);
	session_start();
}
//if( isset($_SESSION['access_token']) ) header("Location: main.php");

$o = new WeiboOAuth( WB_AKEY , WB_SKEY  );

$keys = $o->getRequestToken();

/*
// debug
echo "<pre><h2>request token</h2>";
var_dump($keys);
echo "<h2>APP KEY and SECRET</h2>KEY: ".WB_AKEY."<br/>SECRET: ".WB_SKEY;
echo "</pre>";
*/

$callback = $config['url']['callback'];

$aurl = $o->getAuthorizeURL( $keys['oauth_token'] ,false , $callback );

$_SESSION['keys'] = $keys;

// Redirect to auth page
header("Location: ".$aurl);

?>
