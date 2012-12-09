<?php
// н╒╡╘есмЁ
//define('WB_AKEY' , '2572950423');
//define('WB_SKEY' , '67321ab58f2714d1ba77275644a77978');
// н╖╡╠есмЁ
define('WB_AKEY' , '2662497337');
define('WB_SKEY' , 'b60c66443ff5df8424c7ce7566ebac24');
// н╖╡╠есмЁ1
//define('WB_AKEY' , '4165538274');
//define('WB_SKEY' , 'be7d88f554bfec4fb3c286802490a8fb');
// н╖╡╠есмЁ0
//define('WB_AKEY' , '1465315311');
//define('WB_SKEY' , '907fb44ab9e16a04f536bf69f806099b');
// н╖╡╠есмЁ2
//define('WB_AKEY' , '664043363');
//define('WB_SKEY' , '98916a52c62f239947617eb875f524ad');

$config['url']['domain'] = 'pangtong.sinaapp.com';
$config['url']['base'] = 'http://pangtong.sinaapp.com';
$config['url']['callback'] = $config['url']['base'].'/auth/callback.php';

$config['url']['data_server'] = 'http://ir.hit.edu.cn/pangtong/';

$config['cookie']['lifetime'] = 3600*24*30;	// 30days

$config['cmd']['oauth'] = 'useroauth/';
$config['cmd']['region'] = 'chinamap/';
$config['cmd']['tag'] = 'tagchart/';
$config['cmd']['gender'] = 'sexchart/';

?>