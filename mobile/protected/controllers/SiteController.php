<?php
$path = Yii::getPathOfAlias('common.components.parse');
include_once($path . DIRECTORY_SEPARATOR . 'parse.php');
class SiteController extends Controller{
    public function actionIndex(){
        $this->render('index');
    }

    /**
     * change the language
     */
    public function actionLang(){

        if(isset($_GET['lang'])) {
            $this->lang = $_GET['lang'];
            // set the language to session. Because we dont have CWebUser on mobile in rev 1.0
            $this->redirect(app()->request->urlReferrer);
        }

        $this->render('lang');
    }

    public function actionFaq() {
        $this->render('faq');
    }

    public function actionJohnNice() {
        $this->render('johnnice');
    }

    public function actionJohnNiceDetail() {
        $this->render('johnnicedetail');
    }

    public function actionFaqDetail() {
        $this->render('faqdetail');
    }

}