<?php
/**
 * Created by PhpStorm.
 * User: david
 * Date: 10/8/13
 * Time: 9:38 AM
 */

class People extends CFormModel
{
    public $confirmed;
    public $paymentAccount;
    public $peopleAvatar;
    public $peopleEmail;
    public $peopleName;
    public $objectId;
    public $userId;
    public $placeId;
    public $department;
    public $peoplePictureBase64;
    public $namePicture;

    public function save()
    {
        $parseCloud = new parseCloud('savePeople');

        //$parseCloud->peopleAvatarName = 'dddddsadsa';
        $parseCloud->userId = $this->userId;
        $parseCloud->confirmed = 'false';
        $parseCloud->peopleName = $this->peopleName;
        $parseCloud->peopleEmail = $this->peopleEmail;
        $parseCloud->peopleAvatar = $this->peopleAvatar;
        $parseCloud->placeId = $this->placeId;
        $parseCloud->paymentAccount = $this->peopleEmail;
        $parseCloud->department = $this->department;
        $parseCloud->objectId = $this->objectId;
        $parseCloud->peoplePictureBase64 = $this->peoplePictureBase64;
        $parseCloud->namePicture = $this->namePicture;

        try {
            $result = $parseCloud->run();
            return $result;
        } catch (Exception $e) {
            print_r($e);
            die();
        }
    }

    /*
     * @get people from place have place id of current user id. People Role
     */

    public function getPeople()
    {

        $parseCloud = new parseCloud('getPeople');
        $parseCloud->userId = $this->userId;
        $parseCloud->placeId = $this->placeId;

        try {
            $results = $parseCloud->run();
            return $results;
        } catch (Exception $e) {
            print_r($e);
            die();
        }

    }

    /*
     * delete people from parse cloud
     */
    public function deletePeople()
    {

        $parseCloud = new parseCloud('deletePeople');
        $parseCloud->objectId = $this->objectId;

        try {
            $results = $parseCloud->run();

            return $results;
        } catch (Exception $e) {
            print_r($e);
            die();
        }

    }

    /*
     * edit people from parse cloud
     */
    public function editPeople()
    {

        $parseCloud = new parseCloud('editPeople');
        $parseCloud->objectId = $this->objectId;
        $parseCloud->peopleName = $this->peopleName;
        $parseCloud->peopleAvatar = $this->peopleAvatar;


        try {
            $results = $parseCloud->run();

            return $results;
        } catch (Exception $e) {
            print_r($e);
            die();
        }

    }


    public function attributeLabels()
    {
        return array(
            'confirmed' => 'aaa',
            'paymentAccount' => '',
            'peopleAvatar' => '',
            'peopleEmail' => '',
            'peopleName' => '',
            'objectId' => '',
            'userId' => '',
            'placeId' => '',
            'department' => '',
            'peoplePictureBase64' => '',
            'namePicture' => '',
        );
    }

    /*
     * @get people info from People
     */
    /*public function getPeopleInfo() {
        $parseCloud = new parseCloud('getPeopleInfo');


        try{
            $results = $parseCloud->run();

           return $results;

        }  catch (Exception $e){
            print_r($e);
            die();
        }
    }*/


} 