<?php
/**
 * quick nav class
 * help you active current nav by controller
 */
class WQuickNav extends CWidget{
    public function run(){
        $currentController = $this->controller->id;

        $this->render('quick_nav', array(
            'currentController' => $currentController
        ));
    }
}