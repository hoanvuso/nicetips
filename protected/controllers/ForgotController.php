<?php
$path = Yii::getPathOfAlias('common.components.parse');
include_once($path . DIRECTORY_SEPARATOR . 'parse.php');

/**
 * the forgot password controller
 * @author Tuong Tran <tuong.tran@outlook.com>
 */
class ForgotController extends Controller
{

    /**
     * Declares class-based actions.
     */
    public function actions()
    {
        return array(
            // captcha action renders the CAPTCHA image displayed on the contact page
            'captcha' => array(
                'class' => 'CCaptchaAction',
                'backColor' => 0xFFFFFF,
            )
        );
    }

    /*
     * recovery user password on parse
     * user need to type valid email and capcha to get email from parse
     */


    public function actionIndex()
    {
        $this->layout = '//layouts/forgot';

        $email = '';
        if (r()->isPostRequest) {
            $email = $_POST['email'];
            //  $captcha = app()->getController()->createAction("captcha");

            //  $code = $captcha->verifyCode;

            //check email
            if ($_POST['email'] != '') {

                $email = $_POST['email'];
                // check the email from parse is correct
                $query = new parseQuery('_User');
                $query->where('email', $email);
                $result = $query->find();

                if (count($result->results) == 0) {
                    //no user exists
                    user()->setFlash('error', 'Invalid email!');
                } else {
                    // the email is valid and we send the email reset password for him
                    $user = new parseUser();
                    $user->requestPasswordReset($email);

                    user()->setFlash('success', 'An email has sent to your email');

                    $this->refresh();

                }
            } else {
                user()->setFlash('error', 'Username or Email is required');
            }

        }
        $this->render('index', array(
            'email' => $email
        ));
    }


}