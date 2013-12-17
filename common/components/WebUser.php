<?php

/**
 *
 */
class WebUser extends CWebUser {

    /**
     * get user model from session
     * @return User
     */
    public function getModel() {
        $model = Yii::app()->getSession()->get('current_user');

        if (!$model && !user()->isGuest) {
            //load from db
            $model = User::findByPk(user()->id);

            Yii::app()->getSession()->add('current_user', $model);
        }


        return $model;
    }

    public function setModel($model) {
        Yii::app()->getSession()->add('current_user', $model);
    }

    public function login($identity, $duration = 0) {
        parent::login($identity, $duration);
        Yii::app()->getSession()->add('current_user', $identity->getModel());
        return $this;
    }

    /**
     * destroy some session variables
     * @param type $destroySession
     */
    public function logout($destroySession = true) {
        // I always remove the session variable model.
        Yii::app()->getSession()->remove('current_user');

        parent::logout($destroySession);
    }

    public function getUsername() {
        return $this->getUserProperty('display_name');
    }

    public function getUserProperty($keyname) {
        if (!$this->isLogged())
            return "";
        $user = Yii::app()->getSession()->get('current_user');
        //var_dump($user->attributes);
        return $user->{$keyname};
    }

    public function isLogged() {
        return !(Yii::app()->user->isGuest);
    }

}