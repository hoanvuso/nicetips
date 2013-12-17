<?php
/**
 * Created by PhpStorm.
 * User: david
 * Date: 10/8/13
 * Time: 9:38 AM
 */

class Tip extends CFormModel{

    public $placeId;
    public $accountName;
    public $accountType;
    public $name;
    public $objectId;
    public $userId;


    public function save() {

        $parseCloud = new parseCloud('saveAccount');

        $parseCloud->userId = $this->userId;
        $parseCloud->accountName = $this->accountName;
        $parseCloud->accountType = $this->accountType;
        $parseCloud->name = $this->name;
        $parseCloud->objectId = $this->objectId;
        $parseCloud->userId = $this->userId;


        try{
            $result = $parseCloud->run();
            return $result;
        }  catch (Exception $e){
            print_r($e);
            die();
        }
    }

    /*
     * @get people from place have place id of current user id. People Role
     */

    public function getPeopleAccount() {

        $parseCloud = new parseCloud('getPeopleAccount');
        $parseCloud->userId = $this->userId;
        $parseCloud->placeId = $this->placeId;

        try{
            $results = $parseCloud->run();


            return $results;
        }  catch (Exception $e){
            print_r($e);
            die();
        }

    }
    /*
     * delete people from parse cloud
     */
    public function deletePeople() {

        $parseCloud = new parseCloud('deletePeople');
        $parseCloud->objectId = $this->objectId;

        try{
            $results = $parseCloud->run();

            return $results;
        }  catch (Exception $e){
            print_r($e);
            die();
        }

    }

    /*
     * edit people from parse cloud
     */
    public function editPeople() {

        $parseCloud = new parseCloud('editPeople');
        $parseCloud->objectId = $this->objectId;
        $parseCloud->peopleName = $this->peopleName;
        $parseCloud->peopleAvatar = $this->peopleAvatar;


        try{
            $results = $parseCloud->run();

            return $results;
        }  catch (Exception $e){
            print_r($e);
            die();
        }

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