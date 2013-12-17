<?php
$path = Yii::getPathOfAlias('common.components.parse');
$extension_path = Yii::getPathOfAlias('common.extensions');
include_once($path . DIRECTORY_SEPARATOR . 'parse.php');
include_once($extension_path . DIRECTORY_SEPARATOR . 'html2pdf' . DIRECTORY_SEPARATOR . 'html2pdf.class.php');
/**
 * @author Tuong Tran <tuong.tran@outlook.com>
 */
class TipsController extends Controller
{

    public $placeId;

    public function filters()
    {
        return array('accessControl'); // perform access control for CRUD operations
    }

    /**
     * the rule list
     * @return array
     */
    public function accessRules()
    {
        return array(
            array('allow', // allow authenticated users to access all actions
                'actions' => array('index', 'getpeopleaccount', 'save', 'delete',
                    'savepaypalaccount', 'deleteplacepaypalaccount', 'downloadpdf', 'savetipconfig','savevaluecash'),
                'users' => array('@'),
            ),
            array('deny',
                'users' => array('*')
            ),
        );
    }

    /*
     * @index page of tips
     */

    public function actionIndex($id = '')
    {
        if ($id != '') {
            $this->placeId = $id;
            // get place account if exist
            $paymentAccountObjectId = '';
            $placePayment = '';
            // get list of place
            foreach ($this->listPlace->results as $place) {
                if ($place->objectId == $id) {
                    // try to get the payment account of place is exit
                    if (isset($place->paymentAccount)) {

                        $parseQuery = new parseQuery('PaymentAccount');
                        $parseQuery->whereRelatedTo('paymentAccount', 'Place', $place->objectId);
                        try {
                            $results = $parseQuery->find();
                            // default select first payment
                            if (count($results->results) > 0) {
                                $paymentAccountObjectId = $results->results[0]->objectId;
                            }
                        } catch (Exception $e) {
                            // no relation add
                            $paymentAccountObjectId = '';
                        }
                        break;
                    }
                }
            }


            if ($paymentAccountObjectId) {
                $placePaymentAccount = new parseObject('PaymentAccount');
                $placePayment = $placePaymentAccount->get($paymentAccountObjectId);
            }
            // get the activateTip & showTip
            $placeQuery = new parseQuery('Place');
            $placeQuery->where('objectId', $this->placeId);
            $place = $placeQuery->find()->results[0];

            if (isset($place->activateTips))
                $activateTips = $place->activateTips;
            else
                $activateTips = false;

            if (isset($place->showTips))
                $showTips = $place->showTips;
            else
                $showTips = false;

        } else {
            user()->setFlash('error', 'You must select or create place first');
            $this->redirect(array('/place'));
        }
        $this->render('index', array('placePayment' => $placePayment,
                                      'activateTips' => $activateTips,
                                      'showTips' => $showTips,
                                      'valueCash'=>$place->defaultCurrency));
    }

    /*
     * get people payment account from place
     */

    public function actionGetPeopleAccount()
    {
        if (r()->isPostRequest) {

            $tips = new Tip();
            $tips->userId = user()->id;
            $tips->placeId = $_POST['placeId'];

            // get people role for people because the people roles are related to place
            $query_people_role = new parseQuery('PeopleRole');
            $query_people_role->whereInclude('people');
            $query_people_role->whereInclude('paymentAccount');
            $query_people_role->wherePointer('place', 'Place', $tips->placeId);


            $result = $query_people_role->find();

            $paymentAccountArray = array();
            // from people role get people
            $people_list = array();


            foreach ($result->results as $peopleRole) {

                if(isset($peopleRole->people)) {
                    $query_people = new parseQuery('People');
                    $query_people->whereEqualTo('objectId', $peopleRole->people->objectId);

                    $people = $query_people->find()->results[0];

                    // get the payment account from relation
                    $q = new parseQuery('PaymentAccount');
                    $q->whereRelatedTo('paymentAccount', 'People', $people->objectId);
                    try {
                        // get the payment account of people. 1 people only have one account in 1 place.
                        $paymentResult = $q->find();

                        if (count($paymentResult->results) > 0) {

                            $paymentAccountArray[] = $paymentResult->results[0];
                        }
                    } catch (Exception $e) {
                        // no relation add
                        // $paymentAccountObjectId = '';
                    }
                    $people_list[] = $peopleRole;
                }

            }
            print_r(CJSON::encode(array('payment_list'=>$paymentAccountArray, 'people_list'=>$people_list)));

        }
    }

    /*
     * @save the payment account on parse
     */

    public function actionSave()
    {
        if (r()->isPostRequest) {

            $objectId = $_POST['objectId'];
            $accountName = $_POST['accountName'];
            $placeId = $_POST['placeId'];
            if(isset($_POST['name']))
                 $name = $_POST['name'];


            $paymentQuery = new parseQuery('PaymentAccount');
            $paymentQuery->where('objectId', $objectId);
            $paymentAccount = $paymentQuery->find();

            if (!empty($paymentAccount->results)) {
                // update exist account
                $paymentAccount = new parseObject('PaymentAccount');
                $paymentAccount->accountName = $accountName;
                $result = $paymentAccount->update($objectId);

                echo CJSON::encode(array('id'=>$objectId));

            } else {

                // add new payment account
                $newPaymentAccount = new parseObject('PaymentAccount');
                $newPaymentAccount->accountName = $accountName;
                $newPaymentAccount->accountType = 'paypal';
                $newPaymentAccount->name = $name;
                $newPaymentAccountResult = $newPaymentAccount->save();

                // add relation into the people

                $peopleQuery = new parseQuery('People');
                $peopleQuery->where('objectId',$objectId);

                $result = $peopleQuery->find();

                if(!empty($result->results)) {

                    $peopleId = $result->results[0]->objectId;
                    $paymentObjectId = $newPaymentAccountResult->objectId;
                    $people = new parseObject('People');
                    $people->paymentAccount = array(
                        '__op' => 'AddRelation',
                        'objects' => array(
                            $people->dataType('pointer', array('PaymentAccount', $paymentObjectId)),
                        ));
                    $people->update($peopleId);

                    echo CJSON::encode(array('id'=>$paymentObjectId));
                }

            }

        }
    }

    /*
     * delete payment account on parse
     */

    public function actionDelete()
    {
        if (r()->isPostRequest) {
            $objectId = $_POST['objectId'];
            $paymentAccount = new parseObject('PaymentAccount');
            $result = $paymentAccount->delete($objectId);
            echo 1;
        }
    }

    /*
     * save the paymentAccount of the place
    */

    public function actionSavePayPalAccount()
    {

        if (r()->isPostRequest) {
            // update payment acccount
            $placeId = $_POST['placeId'];
            $placePayPalAccountName = $_POST['accountName'];
            $paymentAccount = new parseObject('PaymentAccount');

            // check the relation of the place have payment account or not
            $query = new parseQuery('PaymentAccount');
            $query->whereRelatedTo('paymentAccount', 'Place', $placeId);

            $result = $query->find();

            if (count($result->results) > 0) {
                // place payment account is exist. Rename place payment account
                $paymentAccountObjectId = $result->results[0]->objectId;
                $paymentAccountObject = new parseObject('PaymentAccount');
                $paymentAccountObject->get($paymentAccountObjectId);
                $paymentAccountObject->accountName = $placePayPalAccountName;
                $paymentAccountObject->update($paymentAccountObjectId);

            } else {
                // place payment account is not exist
                $paymentAccount->accountName = $placePayPalAccountName;
                $paymentAccount->accountType = 'paypal';

                $result = $paymentAccount->save();
                $paymentObjectId = $result->objectId;

                $place = new parseObject('Place');
                $place->paymentAccount = array(
                    '__op' => 'AddRelation',
                    'objects' => array(
                        $place->dataType('pointer', array('PaymentAccount', $paymentObjectId)),
                    ));

                $place->update($placeId);

                // update name of place in payment account

                $place = new parseObject('Place');
                $name = $place->get($placeId)->name;

                $paymentAccount = new parseObject('PaymentAccount');

                $paymentAccount->name = $name;
                $paymentAccount->update($paymentObjectId);
            }
        }
    }

    /*
    @delete place PaymentAccount from the place
    */

    public function  actionDeletePlacePaypalAccount()
    {

        if (r()->isPostRequest) {

            $placeId = $_POST['placeId'];
            $parseQuery = new parseQuery('PaymentAccount');

            // account name of the place. Delete it
            if (isset($_POST['accountName'])) {
                $accountName = $_POST['accountName'];


                $parseQuery->whereRelatedTo('paymentAccount', 'Place', $placeId);
                $results = $parseQuery->find();


                // get list of payment account from the relation. Delete the place
                foreach ($results->results as $paymentAccount) {
                    if ($paymentAccount->accountName == $accountName) {
                        $p = new parseObject('PaymentAccount');
                        $p->delete($paymentAccount->objectId);
                    }
                }
            }
        }
    }

    /*
     * get the html template of list tip vote
     */

    public function actionDownloadPDF()
    {
        if (r()->isPostRequest) {
            $html = $_POST['html_string'];
            $html = str_replace("\\", "", $html);
            $html2pdf = new HTML2PDF();
            $html2pdf->writeHTML($html);
            $html2pdf->Output('infographic-tip.pdf');

        }

    }

    /*
     * save the config avtive tip, show tip of this place
     */

    public function actionSaveTipConfig()
    {
        if (r()->isPostRequest) {


            $placeId = $_POST['placeId'];
            $activeTip = $_POST['active_tips'];
            $showTip = $_POST['show_tips'];
            $place = new parseObject('Place');
            $place->get($placeId);

            if ($activeTip)
                $place->activateTips = true;
            else
                $place->activateTips = false;
            if ($showTip)
                $place->showTips = true;
            else
                $place->showTips = false;

            $place->update($placeId);

        }
    }

    // save the currency of the place on parse

    public function actionSaveValueCash() {
        if(r()->isPostRequest) {

            $placeId = $_POST['placeId'];
            $currency = $_POST['valueCash'];

            $place = new parseObject('Place');
            $place->get($placeId);

            $place->defaultCurrency = $currency;

            $place->update($placeId);
        }

    }

}