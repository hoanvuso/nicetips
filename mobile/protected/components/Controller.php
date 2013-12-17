<?php

/**
 * Controller.php
 */
class Controller extends CController {

    public $breadcrumbs = array();
    public $menu = array();
    public $description;
    public $keywords;
    public $previous_link = '';
    public $lang = 'en';

    public function __construct($id, $module = null) {
        parent::__construct($id, $module);

        if(isset($_GET['lang'])){
            $this->lang = $_GET['lang'];

            app()->session->add('lang', $_GET['lang']);
        }else{
            //get lang
            if(($lang = app()->session->get('lang'))){
                $this->lang = $lang;
            }
        }



        /*
         * create stack for back button. This is a handler when the user click the back button
         * use the stack for storing links for returning back.
         */
        if(!app()->session['back']) {
            app()->session['back'] = new CStack();
        }

        $back_links = app()->session['back'];
        $defaultReturnLink = app()->baseUrl . '/site/return?re=1';
        if($back_links->count()>1) {
            if(isset($_GET['re'])) {
                $back_links->pop();             // pop out the current link
                $link = $back_links->pop();     // get the previous link
                $this->redirect($link);
            } else {
                if($back_links->peek() != app()->request->requestUri && app()->request->requestUri!= $defaultReturnLink) {
                    $back_links->push(app()->request->requestUri);
                }
            }
        } else {
            if(app()->request->requestUri!= $defaultReturnLink) {
                $back_links->push(app()->request->requestUri);
            }
        }

        app()->session['back'] = $back_links;

        cs()->registerCoreScript('jquery');
    }

    /*
     * auto redirect to the place index. Redirect here when the back link stack is == 1. So the current link now is the index
     */
    public function actionReturn() {
        $this->redirect(app()->createUrl('/place/index'));
    }

    /**
     * function run after layout loaded
     * @param type $view
     * @param type $output
     */
    public function afterRender($view, &$output) {

        Yii::app()->clientScript->registerMetaTag($this->description, 'description');
        Yii::app()->clientScript->registerMetaTag($this->keywords, 'keywords');

    }

}
