<?php

/**
 * user model
 * @property string $objectId uniqueId
 * @property string $username
 * @property string $password
 * @property authData $authData
 * @property boolean $emailVerified
 * @property Place[] $bestPlaces
 * @property string $email
 * @property date $createAt
 * @property date $updateAt
 * @property string $sessionToken
 */
class User extends CFormModel {

    public $objectId;
    public $username;
    public $password;
    public $authData;
    public $emailVerified;
    public $email;
    public $createdAt;
    public $updatedAt;
    public $sessionToken;

    public $rememberMe;

    /**
     * @return array validation rules for model attributes.
     */
    public function rules() {
        // NOTE: you should only define rules for those attributes that
        // will receive user inputs.
        return array(
            array('username, email, password', 'required'),
            array('email', 'email'),
            array('username', 'checkUsername'),
            array('email', 'checkEmail'),
            array('createdAt, updatedAt, sessionToken, objectId', 'safe')
        );
    }

    /**
     * get one record by attributes
     * @param array $attributes
     * @return null|\User
     */
    public static function findByAttributes($attributes) {
        $parseQuery = new parseQuery('users');

        foreach ($attributes as $key => $value) {
            $parseQuery->where($key, $value);
        }
        $parseQuery->setLimit(1);

        try {
            $returnObj = $parseQuery->find();

            if (!empty($returnObj->results)) {
                $model = new User();
                $model->attributes = $returnObj->results[0];

                return $model;
            }

            return null;
        } catch (Exception $e) {
            //non object found
            //do nothing here
            return null;
        }
    }

    /**
     * ind one record by objectID
     * @param string $objectId
     * @return null|\User
     */
    public static function findByPk($objectId) {
        $parseUser = new parseUser();

        try {
            //user found
            $returnObj = $parseUser->get($objectId);

            $model = new User();
            $model->attributes = $returnObj[0];

            return $model;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * check user name is already exists?
     * @return void
     */
    public function checkUsername() {
        $user = self::findByAttributes(array(
            'username' => $this->username
        ));

        //exists
        if ($user) {
            $this->addError('username', 'Username has been already taken');
        }
    }

    /**
     * check email is exists?
     */
    public function checkEmail() {
        $user = self::findByAttributes(array(
            'email' => $this->email
        ));
        //exists
        if ($user) {
            $this->addError('email', 'Email has been already taken');
        }
    }


    /**
     * login to the site
     * @return boolean
     */
    public function login(){
        $identity = new UserIdentity($this->username, $this->password);
        $identity->authenticate();

        if ($identity->errorCode === UserIdentity::ERROR_NONE) {
            $duration = $this->rememberMe ? 3600 * 24 * 30 : 0; // 30 days
            Yii::app()->user->login($identity, $duration);
            return true;
        }

        return false;
    }


    /**
     * create new user
     * @param boolean $login login this account to our system?
     * @return $this, false if error
     */
    public function insert(){

        $parseUser = new parseUser();
        $parseUser->email = $this->email;

        try{
            $returnUser = $parseUser->signup($this->username, $this->password);
            //bind return value to this
           // $this->updatedAt = $returnUser->updatedAt;
            $this->createdAt = $returnUser->createdAt;
            $this->sessionToken = $returnUser->sessionToken;
            $this->objectId = $returnUser->objectId;

            return true;
        }catch(Exception $e){
            return false;
        }
    }

    /**
     *
     */
    public function update(){
        if($this->objectId == '' || $this->sessionToken == ''){
            return false;
        }
    }

    public function attributeLabels() {
        return array(
            //'username'=>'',
        );
    }

}