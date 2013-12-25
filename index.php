<?php
// remove the following line when in production mode
/*defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_TRACE_LEVEL') or define('YII_TRACE_LEVEL', 3);*/
date_default_timezone_set('UTC');
error_reporting(0);

// change the following paths if necessary
$yii=dirname(__FILE__).'/common/libs/framework/yii.php';
$config=dirname(__FILE__).'/protected/config/main.php';
$global=dirname(__FILE__).'/common/libs/global.php';

//constant and define
$define = dirname(__FILE__) . '/common/define.php';

require_once($yii);
require_once($global);
require_once($define);

Yii::createWebApplication($config)->run();