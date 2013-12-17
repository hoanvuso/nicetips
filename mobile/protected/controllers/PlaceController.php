<?php
$path = Yii::getPathOfAlias('common.components.parse');
include_once($path . DIRECTORY_SEPARATOR . 'parse.php');
class PlaceController extends Controller
{
    public function actionIndex()
    {
        $this->pageTitle = 'Place Nearby';

        $this->render('index');
    }


    public function actionView($id)
    {

        //get place by id
        $parseQuery = new parseQuery('Place');
        $parseQuery->where('objectId', $id);
        $parseQuery->setLimit(1);

        try {
            $place = $parseQuery->find();

            if (isset($place->results[0])) {
                $place = $place->results[0];
            } else {
                //no place found
                $this->redirect(array('/'));
            }

            //get people
            $peopleRoleQuery = new parseQuery('PeopleRole');
            $peopleRoleQuery->whereInclude('people');
            $peopleRoleQuery->wherePointer('place', 'Place', $id);

            //
            $peopleRoles = $peopleRoleQuery->find();


            $people = array();

            if (!empty($peopleRoles->results)) {


                foreach ($peopleRoles->results as $peopleRole) {

                    $departmentQuery = new parseQuery('PeopleRoleDepartment');
                    $departmentQuery->whereRelatedTo('department', 'PeopleRole', $peopleRole->objectId);

                    $departmentsEachRole = $departmentQuery->find();


                    if (!empty($departmentsEachRole->results)) {
                        foreach ($departmentsEachRole->results as $dep) {
                            $people[$dep->name][] = $peopleRole;
                        }
                    } else {
                        if ($peopleRole->people) {
                            $people['Other'][] = $peopleRole;
                        }
                    }
                }
            }


            $this->render('view', array(
                'place' => $place,
                'people' => $people
            ));
        } catch (Exception $e) {
            //go to index
            $this->redirect(array('/'));
        }

    }

    /**
     * view detail of people
     * @param type $peopleRoleId
     */
    public function actionPersonal($peopleRoleId)
    {
        //find this object
        $peopleRole = $this->_findPeopleRole($peopleRoleId);

        $place = $this->_findPlace($peopleRole->place->objectId);
        $people = $this->_findPeople($peopleRole->people->objectId);

        //set the vote query
        $voteQuery = new parseQuery('Vote');
        $voteQuery->wherePointer('place', 'Place', $peopleRole->place->objectId);
        $voteQuery->wherePointer('people', 'People', $peopleRole->people->objectId);

        $voteQuery->orderByDescending('updatedAt');
        //retreive data
        $votes = $voteQuery->find();

        if (!empty($votes->results)) {
            $votes = $votes->results;
        } else {
            $votes = array();
        }

        $this->render('personal', array(
            'votes' => $votes,
            'place' => $place,
            'peopleRole' => $peopleRole,
            'people' => $people
        ));
    }

    /**
     * add the vote to user
     */
    public function actionVote($peopleRoleId)
    {
        $peopleRole = $this->_findPeopleRole($peopleRoleId);
        $place = $this->_findPlace($peopleRole->place->objectId);
        $people = $this->_findPeople($peopleRole->people->objectId);

        $userQuery = new parseQuery('_User');
        $users = $userQuery->find()->results;

        $array = array();

        foreach ($users as $user) {
            $array[$user->objectId] = $user->username;
        }

        if (r()->isPostRequest) {

            //check rating and save
            if (isset($_POST['rating']) && $_POST['rating'] >= 1 && $_POST['rating'] <= 5) {
                //call add vote function
                $parseCloud = new parseCloud('addVote');
                $parseCloud->rating = $_POST['rating'];
                $parseCloud->peopleId = $_POST['peopleId'];
                $parseCloud->comment = $_POST['comments'];
                $parseCloud->lat = $_POST['lat'];
                $parseCloud->lon = $_POST['lon'];
                $parseCloud->placeId = $place->objectId;
                $parseCloud->user = $_POST['user'];

                try {
                    $parseCloud->run();

                    $this->render('vote_thank', array(
                        'people' => $people
                    ));

                    app()->end();
                } catch (Exception $e) {
					dump($e);
					
                    app()->end();
                }
            }
        }

        $this->render('vote', array(
            'place' => $place,
            'people' => $people,
            'users' => $array
        ));
    }

    public function actionTip($peopleRoleId)
    {



        $peopleRole = $this->_findPeopleRole($peopleRoleId);
        $place = $this->_findPlace($peopleRole->place->objectId);
        $people = $this->_findPeople($peopleRole->people->objectId);

        // try to get people payment account first
        $paymentQuery = new parseQuery('PaymentAccount');
        $paymentQuery->whereRelatedTo('paymentAccount', 'People', $peopleRole->people->objectId);

        $paymentAccount = $paymentQuery->find()->results[0];

        if($paymentAccount->accountName=='') {
            // if not exits people payment account. Get the payment account of the place
            $placePaymentAccountQuery = new parseQuery('PaymentAccount');
            $placePaymentAccountQuery->whereRelatedTo('paymentAccount', 'Place', $place->objectId);
            $paymentAccount = $placePaymentAccountQuery->find()->results[0];
        }

        // if place payment account is not found. Throw error

        if (r()->isPostRequest) {
            //check rating and save
            if (isset($_POST['amount']) && $_POST['amount'] > 0) {
                //call add vote function
                $parseCloud = new parseCloud('addVote');
                $parseCloud->rating = 5;
                $parseCloud->amount = $_POST['amount'];
                $parseCloud->peopleId = $_POST['peopleId'];
                $parseCloud->comment = $_POST['comments'];
                $parseCloud->lat = $_POST['lat'];
                $parseCloud->lon = $_POST['lon'];
                $parseCloud->placeId = $place->objectId;
                $parseCloud->currency = $place->defaultCurrency;

                try {
                    $parseCloud->run();
                    //get payment account
                    $this->render('tip_thank', array(
                        'people' => $people,
                        'amount' => $_POST['amount'],
                        'paymentAccount' => $paymentAccount->accountName,
                        'currency' => $place->defaultCurrency
                    ));

                    app()->end();
                } catch (Exception $e) {
                    app()->end();
                }
            }
        }

        $this->render('tip', array(
            'place' => $place,
            'people' => $people,
            'paymentAccount'=>$paymentAccount->accountName,
            'peopleRoleId'=>$peopleRoleId
        ));
    }

    private function _findPeopleRole($peopleRoleId)
    {
        //find this object
        //get people

        $peopleRoleObject = app()->cache->get('people_role_' . $peopleRoleId);
        if (!$peopleRoleObject) {
            try {
                $peopleRoleObject = new parseObject('PeopleRole');
                $peopleRole = $peopleRoleObject->get($peopleRoleId);
                app()->cache->set('people_role_' . $peopleRoleId, $peopleRole, 300);
                return $peopleRole;

            } catch (Exception $e) {
                $this->redirect(array('/'));
            }
        } else {

            return $peopleRoleObject;
        }

    }

    private function _findPlace($placeId)
    {
        $placeObj = new parseObject('Place');
        $place = $placeObj->get($placeId);

        return $place;
    }

    private function _findPeople($peopleId)
    {
        //get people info
        $peopleObj = new parseObject('People');
        try {
            $query = new parseQuery('People');
            $query->where('objectId', $peopleId);
            $people = $query->find()->results[0];
            return $people;
        } catch (Exception $e) {
            $this->redirect(array('/'));
        }
    }
}