<?php
$path = Yii::getPathOfAlias('common.components.parse');
$extension_path = Yii::getPathOfAlias('common.extensions');
include_once($path . DIRECTORY_SEPARATOR . 'parse.php');
include_once($extension_path . DIRECTORY_SEPARATOR . 'html2pdf' . DIRECTORY_SEPARATOR . 'html2pdf.class.php');
class TeamController extends Controller
{

    public $placeId;
    public $placeName;

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
            array('allow',
                'users' => array('*')),
            array('allow', // allow authenticated users to access all actions
                'actions' => array('index', 'save', 'getpeople', 'getpeopleinfo', 'delete', 'edit', 'downloadpdf'),
                'users' => array('@'),
            ),
            array('deny',
                'users' => array('*')
            ),
        );

    }


    public function actionIndex($id = '')
    {

        if ($id != '') {
            $this->placeId = $id;
            if (!empty(app()->session['placeList']->results)) {

                foreach (app()->session['placeList']->results as $place) {
                    if ($place->objectId == $this->placeId) {
                        $this->placeName = $place->name;
                    }
                }
            }


        } else {
            user()->setFlash('error', 'You must select or create place first');
            $this->redirect(array('/place'));
        }

        $this->render('index');
    }


    public function actionSave()
    {
        if (r()->isPostRequest) {
            $people = new People();
            // create new people
            $people->userId = user()->id;

            $people->peopleAvatar = $_POST['avatar'];
            $people->paymentAccount = $_POST['email'];
            $people->peopleEmail = $_POST['email'];
            $people->peopleName = $_POST['peopleName'];
            $people->placeId = $_POST['placeId'];
            if ($_POST['department'])
                $people->department = $_POST['department'];
            else
                $people->department = array();
            $people->peoplePictureBase64 = $_POST['peoplePictureBase64'];
            $people->namePicture = $_POST['namePicture'];

            if (isset($_POST['objectId']))
                $people->objectId = $_POST['objectId']; // use for update
            //call to server
            try {
                $result = $people->save();

                // make QRCODE here
                $result->result->people->qrcode = CommonHelper::generateQRCode($result->result->objectId, 30, 30);
                print_r(json_encode($result->result));
            } catch (Exception $e) {
                return null;
            }
        }

    }

    /*
     * @get people members data from  Parse
     */

    public function actionGetPeople()
    {
        if (r()->isPostRequest) {
            $people = new People();
            $people->userId = user()->id;
            $people->placeId = $_POST['placeId'];

            $results = $people->getPeople();


            if(!empty($results->result)) {
                foreach ($results->result as $object) {
                    $object->people->qrcode = CommonHelper::generateQRCode($people->objectId, 30, 30);
                }
            }
            print_r(CJSON::encode($results));
        }
    }

    /*
   * @get people info data from  Parse (People)
   */

    public function actionGetPeopleInfo()
    {
        if (r()->isPostRequest) {
            $parseQuery = new parseQuery('People');
            $parseQuery->where('objectId', $_POST['peopleId']);
            try {
                $results = $parseQuery->find();
                $results = $results->results;
                print(json_encode($results[0]));

            } catch (Exception $e) {
                return null;
            }
        }
    }


    public function actionDelete()
    {

        if (r()->isPostRequest) {
            $people = new People();

            $people->objectId = $_POST['objectId'];
            $results = $people->deletePeople();

            print($results);
        }
    }


    public function actionEdit()
    {

        if (r()->isPostRequest) {
            $people = new People();

            $people->objectId = $_POST['objectId'];

            if (isset($_POST['avatar']))
                $people->peopleAvatar = $_POST['avatar'];
            if (isset($_POST['email']))
                $people->paymentAccount = $_POST['email'];
            $people->peopleName = $_POST['peopleName'];

            $results = $people->editPeople();

            print_r(json_encode($results->result));

        }

    }

    /*
     * get the html template of list people on the place and convert it to pdf for download
     */

    public function actionDownloadPDF()
    {
        if (r()->isPostRequest) {
            $html = $_POST['html_string'];
            $html = str_replace("\\", "", $html);
            $html2pdf = new HTML2PDF();
            $html2pdf->writeHTML($html);
            $html2pdf->Output('leaflet-team.pdf');

        }
    }

}