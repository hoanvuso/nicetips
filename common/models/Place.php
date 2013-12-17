<?php
class Place extends CFormModel{
    public $objectId;
    public $activeTips = true;
    public $defaultCurrency = 'EUR';
    public $formattedAddress = '';
    public $googleReference;
    public $location;
    public $name;
    public $userId;
    public $placeId;
    public $placeType;
    public $printWithName;
    public $printWithPicture;
    public $showTips;
    public $createdAt;
    public $updatedAt;
    public $logo;

    public $address;
    public $country;
    public $city;
    public $zip;
    public $category;
    public $parseClass = 'Place';

    public static function find($userId, $placeId = ''){
        //if empty place Id, we will get the first place
        $parseQuery = new parseQuery('Place');
        $parseQuery->wherePointer('owner','_User', $userId);
        $parseQuery->where('objectId', $placeId);

        try{
            $result = $parseQuery->find();

            return $result;
        }catch(Exception $e){
            return null;
        }

        return null;
    }

    public static function findAll($userId){
        //if empty place Id, we will get the first place
        $parseQuery = new parseQuery('Place');
        $parseQuery->wherePointer('owner','_User', $userId);

        try{
            $results = $parseQuery->find();
            return $results;
        }catch(Exception $e){
            return array();
        }

        return array();
    }

    /**
     * insert new record
     * @param string $userId owner
     * @return mixed place object or false
     */
    public function insert(){
        $parseObject = new parseObject('Place');
        $parseObject->owner = $this->userId;
        $parseObject->activeTips = $this->activeTips;
        $parseObject->formattedAddress = "{$this->address}, {$this->zip}, {$this->city}, {$this->country}";
        $parseObject->location = $this->location;
        $parseObject->name = $this->name;
        $parseObject->placeId = $this->placeId;
        $parseObject->placeType = $this->placeType;
        $parseObject->printWithName = $this->printWithName;
        $parseObject->printWithPicture = $this->printWithPicture;
        $parseObject->showTips = $this->showTips;

        try{
            $returnValue = $parseObject->save();

            $this->objectId = $returnValue->objectId;
            $this->createdAt = $this->updatedAt = $returnValue->createdAt;

            return TRUE;
        }catch(Exception $e){
            return false;
        }

        return false;
    }

    /**
     * update place
     * @return boolean
     */
    public function update(){
        $parseObject = new parseObject('Place');
        $parseObject->owner = $this->userId;
        $parseObject->activeTips = $this->activeTips;
        $parseObject->formattedAddress = "{$this->address}, {$this->zip}, {$this->city}, {$this->country}";
        $parseObject->location = $this->location;
        $parseObject->name = $this->name;
        $parseObject->placeId = $this->placeId;
        $parseObject->placeType = $this->placeType;
        $parseObject->printWithName = $this->printWithName;
        $parseObject->printWithPicture = $this->printWithPicture;
        $parseObject->showTips = $this->showTips;

        try{
            $returnValue = $parseObject->update($this->objectId);

            $this->updatedAt = $returnValue->createdAt;

            return TRUE;
        }catch(Exception $e){
            return false;
        }

        return false;
    }

    public function save(){
        $parseCloud = new parseCloud('savePlace');

        $parseCloud->objectId = $this->objectId;
        $parseCloud->placeId = $this->placeId;
        $parseCloud->googleReference = $this->googleReference;
        $parseCloud->defaultCurrency = 'EUR';

        $parseCloud->userId = user()->id;
      //  $parseCloud->location = new parseGeoPoint($this->location[0], $this->location[1]);

        //print_r($parseCloud->location);exit;

        $parseCloud->formattedAddress = $this->address;
        $parseCloud->activeTips = $this->activeTips;
        $parseCloud->location = $this->location;
        if(isset( $this->logo))
            $parseCloud->logo = $this->logo;
        $parseCloud->name = $this->name;
        $parseCloud->placeType = $this->placeType;
        $parseCloud->printWithName = $this->printWithName;
        $parseCloud->printWithPicture = $this->printWithPicture;
        $parseCloud->showTips = $this->showTips;
        $parseCloud->country = $this->country;
        $parseCloud->zip = $this->zip;
        $parseCloud->city = $this->city;
        $parseCloud->category = $this->category;
        $parseCloud->activateTip = false;

        try{
            $results = $parseCloud->run();
            // reset session if modify place data
            app()->session['placeList'] = Place::findAll(user()->id);
            return $results;
        }  catch (Exception $e){
            print_r($e);
            die();
        }
    }



    public function delete()  {
        $parseCloud = new parseCloud('deletePlace');
        $parseCloud->placeId = $this->placeId;

        try{
            $results = $parseCloud->run();
            return $results;
        }  catch (Exception $e){
            print_r($e);
            die();
        }

    }

}