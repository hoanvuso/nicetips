<?php

/**
 * Controller.php
 */
class Controller extends CController {

    public $breadcrumbs = array();
    public $menu = array();
    public $description;
    public $keywords;

    /**
     * current selected place
     * @var string
     */
    public $placeId;

    /**
     * list place of current user
     * @var Place[]
     */
    public $listPlace = array();

    public function __construct($id, $module = null) {
        parent::__construct($id, $module);

        //check and set list place
        if(!user()->isGuest){

            // get all place of current user and add to session
            if(!isset(app()->session['placeList']))
                app()->session['placeList'] = Place::findAll(user()->id);
            else {
                $this->listPlace = app()->session['placeList'];
            }
            //dump($this->listPlace); die();
        }
        cs()->registerCoreScript('jquery');
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
