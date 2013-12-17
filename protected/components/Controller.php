<?php

/**
 * Controller.php
 */
class Controller extends CController
{

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

    public function __construct($id, $module = null)
    {
        parent::__construct($id, $module);
        //check and set list place

        if (!user()->isGuest) {

            // get all place of current user and add to session
            if (!app()->session['placeList']) {
                $this->listPlace = Place::findAll(user()->id);
                app()->session['placeList'] = $this->listPlace;
            } else {
                $this->listPlace = app()->session['placeList'];
            }
        }

        //    $this->redirect(app()->createUrl('/site/login'));


        // set language for current user

        if (app()->user->hasState('language')) {
            $lang = app()->user->getState('language');
            app()->language = $lang;
        } else {
            app()->language = app()->sourceLanguage;
        }
        // get the localPlace
        $query = new parseQuery('PlaceCategory');
        $query->where('countryCode', app()->language);
        $query->orderByAscending('label');
        $result = $query->find();
        app()->session['localisedPlace'] = $result->results;

        cs()->registerCoreScript('jquery');
    }


    /**
     * function run after layout loaded
     * @param type $view
     * @param type $output
     */
    public function afterRender($view, &$output)
    {

        Yii::app()->clientScript->registerMetaTag($this->description, 'description');
        Yii::app()->clientScript->registerMetaTag($this->keywords, 'keywords');

    }


}
