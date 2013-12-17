<?php
/**
 * @author Tuong Tran <tuong.tran@outlook.com>
 */

$path = Yii::getPathOfAlias('common.components.parse');
$extension_path = Yii::getPathOfAlias('common.extensions');
include_once($path . DIRECTORY_SEPARATOR . 'parse.php');
include_once($extension_path . DIRECTORY_SEPARATOR . 'html2pdf' . DIRECTORY_SEPARATOR . 'html2pdf.class.php');
class PlaceController extends Controller
{

    /**
     * filter for access control
     * @return array
     */
    public $placeId;
    public $listPlace;

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
                'actions' => array('qr'),
                'users' => array('*')),
            array('allow', // allow authenticated users to access all actions
                'actions' => array('index', 'save', 'getplacelist', 'delete', 'downloadpdf'),
                'users' => array('@'),
            ),
            array('deny',
                'users' => array('*')
            ),
        );
    }

    /**
     * index action
     * @param string $id if of place
     */
    public function actionIndex($id = '')
    {
        $placeInfo = '';

        if (app()->session['localisedPlace']) {
            foreach (app()->session['localisedPlace'] as $result) {
                $cat[$result->objectId] = $result->label;
            }
        }

        if ($id != '') {
            // user select a place from place list
            $this->placeId = $id;
            // on update
            $places = $this->listPlace->results;
            foreach ($places as $place) {
                if ($place->objectId == $id) {
                    $placeInfo = $place;
                }
            }
            if ($id == 'np') {
                $this->render('index', array('category' => $cat, 'placeInfo' => $placeInfo));
                app()->end();
            }
        } else {
            // recheck the listPlace. select default
            if (count($this->listPlace->results) > 0) {
                //select first place
                $placeInfo = $this->listPlace->results[0];

                if($placeInfo){
                    $this->placeId = $placeInfo->objectId;
                }else{
                    $this->placeId = 'nd';
                }

                //dump($placeInfo); die();
                $this->redirect(app()->createUrl('/place/index', array('id' => $this->placeId)), array('category' => $cat, 'placeInfo' => $placeInfo));
            }
        }

        $this->render('index', array('category' => $cat, 'placeInfo' => $placeInfo));
    }

    /**
     * qr code
     */
    public function actionQr($id)
    {
        //read stream from
        echo '<img src="' . CommonHelper::generateQRCode(app()->createAbsoluteUrl('/place/qr', array('id' => $id))) . '" />';
        app()->end();
    }

    /*
     *@getplacelist
     */

    public function actionGetPlaceList()
    {
        $results = Place::findAll(user()->id);
        $results = $results->results;

        $list = array();
        foreach ($results as $result) {
            $list[$result->objectId] = $result->name;
        }
        print_r($list);

    }

    /**
     * save place on parse
     */
    public function actionSave()
    {
        if (r()->isPostRequest) {
            $place = new Place();
            $place->objectId = $_POST['objId'];
            $place->placeId = $_POST['placeId'];
            $place->address = $_POST['address'];
            $place->city = $_POST['city'];
            $place->zip = $_POST['zip'];
            $place->country = $_POST['country'];
            $place->name = $_POST['name'];
            $place->placeType = $_POST['placeType'];
            if (isset($_POST['logo'])) $place->logo = $_POST['logo'];
            $place->location = $_POST['location'];
            $place->category = $_POST['category'];
            $place->googleReference = $_POST['googleReference'];

            //call to server
            $result = $place->save();
            echo CJSON::encode($result);
            app()->end();
        }else{
            app()->end();
        }
    }

    /*
     * @delete current place and reload the place list
     */

    public function actionDelete()
    {
        if (r()->isPostRequest) {
            $place = new Place();
            $place->placeId = $_POST['placeId'];
            $result = $place->delete();
            if (isset($result->result)) {
                if ($result->result->id == 200) {
                    // reload place list in session
                    app()->session['placeList'] = Place::findAll(user()->id);
                    $this->listPlace = app()->session['placeList'];

                }
            }
        }
    }

    /*
     * get the html template of leaflet ofe place and convert it to pdf for download
     */

    public function actionDownloadPDF()
    {
        if (r()->isPostRequest) {
            $html = $_POST['html_string'];
            $html = str_replace("\\", "", $html);
            $html2pdf = new HTML2PDF();
            $html2pdf->writeHTML($html);
            $html2pdf->Output('leaflet-place.pdf');

        }

    }

}