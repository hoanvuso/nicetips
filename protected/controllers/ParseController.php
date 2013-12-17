<?php
//include_once(Yii::getPathOfAlias('common.components.parse').'/EnhanceTestFramework.php');

class ParseController extends Controller
{
    public function actionIndex()
    {
        //This example is a sample video upload stored in parse

        $parse = new parseObject('Post');
        $o = $parse->get('3eGZrtwbfC');

        dump($o);
        die();
        $parse->title = 'xxxxxxxxxx';
        $parse->content = 'this is sample content';

        //use pointer to other class
        //$parse->userId = array("__type" => "Pointer", "className" => "_User", "objectId" => 'LSRLqTCNvJ');
        $r = $parse->save();

        //  dump($r);
    }

    public function actionSignIn()
    {
        $loginUser = new parseUser();
        $loginUser->username = 'abc';
        $loginUser->password = '123456';

        try {
            $returnLogin = $loginUser->login();
        } catch (Exception $e) {

        }
        // dump($returnLogin);
    }


    public function actionCheck()
    {
        $parseQuery = new parseQuery('users');
        $users = $parseQuery->find();
        dump($users);
    }

    public function actionCloud()
    {
        $parseCloud = new parseCloud('freeSearch');
        $parseCloud->freeText = '100 Washington';
        $parseCloud->countryCode = 'US';
        $temp = $parseCloud->run();

        dump($temp);
    }

    public function actionAddPeople()
    {
        //test add people
        $parseCloud = new parseCloud('addPeople');
        $parseCloud->placeId = 'HPa8qlLQdg';
        $parseCloud->countryCode = 'USA';
        $parseCloud->peopleName = 'test 3';
        $parseCloud->peopleAvatarName = 'none';
        $parseCloud->voteValue = 1;
        $parseCloud->userId = user()->id;
        $parseCloud->paymentType = 'paypal';
        $parseCloud->paymentAccount = 'myaccount@gmail.com';
        $temp = $parseCloud->run();

        //  dump($temp);
    }


    public function actionAddvote()
    {
        $parseCloud = new parseCloud('addVote');
        $parseCloud->placeId = 'HPa8qlLQdg';
        $parseCloud->countryCode = 'USA';
        $parseCloud->peopleName = 'test 3';
        $parseCloud->peopleAvatarName = 'none';
        $parseCloud->voteValue = 1;
        $parseCloud->userId = user()->id;
        $parseCloud->paymentType = 'paypal';
        $parseCloud->paymentAccount = 'myaccount@gmail.com';
        $parseCloud->peopleId = 'ixzcmSgqpp';

        $parseCloud->lat = 10;
        $parseCloud->lon = -10;
        $temp = $parseCloud->run();

        // dump($temp);
    }

    public function actionNewPlace()
    {
        $parseCloud = new parseCloud('savePlace');
        //$parseCloud->placeId = '1uT4LFHjCk';
        $parseCloud->defaultCurrency = 'EUR';
        $parseCloud->userId = user()->id;
        //$parseCloud->location = new parseGeoPoint(100, -100);
        $parseCloud->formattedAddress = '100 abc, asdas, 40ssss, adad';
        $temp = $parseCloud->run();

        //     dump($temp);
    }


    public function actionFindVote()
    {
        $parseCloud = new parseCloud('findVote');
        $parseCloud->placeId = '1uT4LFHjCk';
        $temp = $parseCloud->run();

        //    dump($temp);
    }

    /*
     * @return a list places on inside distance
     */

    public function actionGeo()
    {

        $parseCloud = new parseCloud('filterPlaceOnDistance');
        $my_lat = 10.822473;
        $my_lng = 106.632074;
        $parseCloud->my_location = array($my_lat, $my_lng);
        $parseCloud->distance = 1;
        $results = $parseCloud->run();

        dump($results);

        $this->render('geo');
    }

}