<?php

/**
 * UserIdentity.php
 */
class UserIdentity extends CUserIdentity {

    /**
     * @var integer id of logged user
     */
    private $_id;
    private $_model;

    public function getModel() {
        return $this->_model;
    }

    /**
     * Authenticates username and password
     * @return boolean CUserIdentity::ERROR_NONE if successful authentication
     */
    public function authenticate() {

        try{

            $parseUser = new parseUser();
            $parseUser->username = $this->username;
            $parseUser->password = $this->password;

            $parseData = $parseUser->login();

            $user = new User();
            $user->attributes = array(
                'username' => $parseData->username,
                'createdAt' => $parseData->createdAt,
                'updatedAt' => $parseData->updatedAt,
                'sessionToken' => $parseData->sessionToken,
                'objectId' => $parseData->objectId
            );
        }catch(Exception $e){
            $user = null;
        }

        if ($user === null) {
            $this->errorCode = CBaseUserIdentity::ERROR_UNKNOWN_IDENTITY;
        }else {
            $this->_model = $user;
            $this->_id = $user->objectId;
            $this->username = $user->username;
            $this->errorCode = self::ERROR_NONE;
        }

        return !$this->errorCode;
    }

    /**
     * Creates an authenticated user with no passwords for registration
     * process (checkout)
     * @param string $username
     * @return self
     */
    public static function createAuthenticatedIdentity($id, $username) {
        $identity = new self($username, '');
        $identity->_id = $id;
        $identity->errorCode = self::ERROR_NONE;
        return $identity;
    }

    /**
     *
     * @return integer id of the logged user, null if not set
     */
    public function getId() {
        return $this->_id;
    }

}