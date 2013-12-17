<?php

// This is the main Web application configuration. Any writable
// application properties can be configured here.

// Setup some default path aliases. These alias may vary from projects.
Yii::setPathOfAlias('root', ROOT);
Yii::setPathOfAlias('common', ROOT . DIRECTORY_SEPARATOR . 'common');
Yii::setPathOfAlias('www', ROOT . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'www');

return array(
    'basePath' => dirname(__FILE__) . DIRECTORY_SEPARATOR . '..',
    'name' => 'Nice tips',
    'preload' => array('log'),
    // autoloading model and component classes
    'import' => array(
        'common.components.*',
        'common.components.parse.*',
        'common.models.*',
        'application.components.*',
    ),
    'sourceLanguage'=>'en',

    // application components
    'components' => array(
        'errorHandler' => array(
            // @see http://www.yiiframework.com/doc/api/1.1/CErrorHandler#errorAction-detail
            'errorAction' => 'site/error'
        ),
        'user' => array(
            // enable cookie-based authentication
            'allowAutoLogin' => true,
            'class' => 'WebUser'
        ),
        'log' => array(
            'class' => 'CLogRouter',
            'routes' => array(
                array(
                    'class' => 'CWebLogRoute', 'levels' => 'trace, info, error, warning',
                ),
            )
        ),
        'urlManager' => array(
            'urlFormat' => 'path',
            'showScriptName' => false,
            'urlSuffix' => '',
            'rules' => array(
                '' => 'site/index',
                //'place/<id:\w+>' => 'place',
                //'place/<action:\w+>'=>'place/<action>',
              /*  'team/<id:\w+>' => 'team',
                'tips/<id:\w+>' => 'tips',
                'vote/<id:\w+>' => 'vote',*/
                /* for REST please @see http://www.yiiframework.com/wiki/175/how-to-create-a-rest-api/ */
                /* other @see http://www.yiiframework.com/doc/guide/1.1/en/topics.url */
                '<controller:\w+>/<id:\d+>' => '<controller>/view',
                '<controller:\w+>/<action:\w+>/<id:\d+>' => '<controller>/<action>/<id:\d+>',
                '<controller:\w+>/<action:\w+>' => '<controller>/<action>',
            )
        ),
    ),
);