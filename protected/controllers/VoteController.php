<?php
$path = Yii::getPathOfAlias('common.components.parse');
$extension_path = Yii::getPathOfAlias('common.extensions');
include_once($path . DIRECTORY_SEPARATOR . 'parse.php');
include_once($extension_path . DIRECTORY_SEPARATOR . 'html2pdf' . DIRECTORY_SEPARATOR . 'html2pdf.class.php');
/**
 *
 */
class VoteController extends Controller
{

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
                'actions' => array('index','downloadpdf'),
                'users' => array('@'),
            ),
            array('deny',
                'users' => array('*')
            ),
        );
    }

    /**
     * get list comments
     * @param string $id place id
     */
    public function actionIndex($id = '')
    {
        if ($id != '') {
            //must create place first
            $this->placeId = $id;
        } else {
            user()->setFlash('error', 'You must select or create place first');

            $this->redirect(array('/place'));
        }

        $this->render('index');
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
            $html2pdf->Output('infographic-vote.pdf');

        }

    }
}