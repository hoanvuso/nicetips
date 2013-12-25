<?php
/** app path **/
$root = dirname(__FILE__) . DIRECTORY_SEPARATOR . '..';
define('ROOT', $root);


/*define('APP_TIMEZONE','Asia/Ho_Chi_Minh');
define('RESOURCE_URL','http://shrouded-bastion-6698.herokuapp.com/www/resources/');
define('AVATAR_URL','http://shrouded-bastion-6698.herokuapp.com/www/uploads/avatar/');
define('PRODUCT_URL','http://shrouded-bastion-6698.herokuapp.com/www/uploads/products/');
define('SITE_NAME','Nie tips');
define('SLOGAN','We build apps for better life experience');
define('SITE_NAME_URL','http://shrouded-bastion-6698.herokuapp.com/');
define('SUPPORT_EMAIL','info@myproject.com');
define('FRONT_SITE_URL','http://shrouded-bastion-6698.herokuapp.com/');
define('BACKEND_SITE_URL','http://shrouded-bastion-6698.herokuapp.com/backend/');
define('WWW_URL', 'http://shrouded-bastion-6698.herokuapp.com/www/');
define('WWW_MOBILE_URL', 'http://shrouded-bastion-6698.herokuapp.com/mobile/www/');*/

define('APP_TIMEZONE','Asia/Ho_Chi_Minh');
define('RESOURCE_URL','http://localhost/happytips/www/resources/');
define('AVATAR_URL','http://localhost/happytips/www/uploads/avatar/');
define('PRODUCT_URL','http://localhost/happytips/www/uploads/products/');
define('SITE_NAME','Nie tips');
define('SLOGAN','We build apps for better life experience');
define('SITE_NAME_URL','http://localhost/happytips/');
define('SUPPORT_EMAIL','info@myproject.com');
define('FRONT_SITE_URL','http://localhost/happytips/');
define('BACKEND_SITE_URL','http://localhost/happytips/backend/');
define('WWW_URL', 'http://localhost/happytips/www/');
define('WWW_MOBILE_URL', 'http://localhost/happytips/mobile/www/');

/******file*******/
$wwwPath = ROOT . DIRECTORY_SEPARATOR . 'www' . DIRECTORY_SEPARATOR ;
define('UPLOAD_PATH', $wwwPath . 'uploads' . DIRECTORY_SEPARATOR);
define('AVATAR_PATH', $wwwPath . 'uploads' . DIRECTORY_SEPARATOR . 'avatar' . DIRECTORY_SEPARATOR);
define('PRODUCT_PATH', $wwwPath . 'uploads' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR);
define('UPLOAD_URL', WWW_URL . 'uploads/');
define('THUMB_PATH', $wwwPath . 'thumbs' . DIRECTORY_SEPARATOR);
define('THUMB_URL', WWW_URL . 'thumbs/');
//caching
define('FRONTEND_CLEAR_CACHE_KEY', 'af234uajad234piasdjal32');
