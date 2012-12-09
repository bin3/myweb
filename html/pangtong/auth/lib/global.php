<?php
/**
 * Some global functions.
 *
 * @author	bin3 (wbzhang@ir.hit.edu.cn)
 * @date	2011-03-22
 */

include_once(ABSPATH.'conf/config.php');

/**
 * 用户第一次通过OAuth验证完后，向后台服务器注册用户 
 *
 * @param string $oauth_token
 * @param string $oauth_token_secret
 * @param string $user_id
 */
function register_user($oauth_token, $oauth_token_secret, $user_id) {
  global $config;
  
  // create a new cURL resource
  $ch = curl_init();

  $args_str = 'oauth_token='.$oauth_token.'&oauth_token_secret='
    .$oauth_token_secret.'&user_id='.$user_id;
  $url = $config['url']['data_server'].$config['cmd']['oauth'].'?'.$args_str;
    
  //echo 'URL: '.$url.'<hr/>';  // debug
  
  // set URL and other appropriate options
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HEADER, 0);

  // grab URL and pass it to the browser
  curl_exec($ch);

  // close cURL resource, and free up system resources
  curl_close($ch);

  /*
  // 设置会话，记录user_id
  if(!isset($_SESSION)){
    session_start();
  }
  $_SESSION['user_id'] = $user_id;
  */
}
