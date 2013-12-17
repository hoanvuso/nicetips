<?php

/**
 * SiteController is the default controller to handle user requests.
 */

$path = Yii::getPathOfAlias('common.components.parse');
include_once($path . DIRECTORY_SEPARATOR . 'parse.php');

class SiteController extends CController
{

    /**
     * filter for access control
     * @return array
     */
    public function filters()
    {
        return array('accessControl'); // perform access control for CRUD operations
    }

    public function actions()
    {
        return array(

            'captcha' => array(
                'class' => 'CCaptchaAction',
                'backColor' => 0xFFFFFF,
            ),

        );
    }

    /**
     * the rule list
     * @return array
     */
    public function accessRules()
    {
        return array(
            array('allow', // allow authenticated users to access all actions
                'actions' => array('login', 'register', 'logout','test'),
                'users' => array('*'),
            ),
            array('allow', // allow authenticated users to access all actions
                'actions' => array('index', 'selectlang'),
                'users' => array('@'),
            ),
            array('deny'),
        );
    }

    /**
     * Index action is the default action in a controller.
     */
    public function actionIndex()
    {
        $this->redirect(array('/place'));
    }

    /*
     * Login action is action to authenticate user
     */

    public function actionLogin()
    {

        if (!user()->isGuest) {
            $this->redirect(array('/place'));
        }

        $this->layout = 'register';
        $this->layout = 'login';


        $model = new User();
        if (isset($_POST['User'])) {
            $model->attributes = $_POST['User'];
            if ($model->login()) {

                //go to place
                $this->redirect(array('/place'));
            } else {
                $model->addError('identity', 'Incorrect username or password');
            }
        }
        $this->render('login', array('model' => $model));
    }

    /**
     * Register a new member
     */
    public function actionRegister()
    {
        if (!user()->isGuest) {
            $this->redirect(array('/place'));
        }

        $model = new User();
        if (isset($_POST['User'])) {
            $model->attributes = $_POST['User'];
            if ($model->validate()) {
                //save
                if ($model->insert()) {
                    //do login

                    $identity = UserIdentity::createAuthenticatedIdentity($model->objectId, $model->username);
                    user()->login($identity);

                    //redirect to place
                    $this->redirect(array('/place'));
                }
            }
        }


        $this->layout = 'register';
        $this->render('register', array(
            'model' => $model
        ));
    }

    /**
     * log out action
     */
    public function actionLogout()
    {
        user()->logout();
        $this->redirect(array('/site/login'));
    }

    public function actionSelectLang()
    {

        if (isset($_POST['lang'])) {
            app()->setLanguage($_POST['lang']);
            app()->user->setState('language', $_POST['lang']);

            // get language on parse for localised place
            $lang = app()->language;
            $query = new parseQuery('PlaceCategory');
            $query->where('countryCode', $lang);
            $result = $query->find();
            app()->session['localisedPlace'] = $result->results;

        }
        $this->redirect(app()->request->urlReferrer);
    }

}