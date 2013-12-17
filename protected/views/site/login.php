<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/js/fade-plugin.js"></script>
<style>
    .error-message-base {
        position: absolute;
        background-color: white;
        border: 1px solid;
        padding: 3px;
        border-radius: 3px;
        color: red;
        font-size: 0.8em;
        left: 273px;
        width: 52%;
    }
    .m11 { top: 244px; }
    .m22 { top: 282px; }
</style>

<script>
    (function($) {
        function init() {
            $(".effectContainer").fadeTransition({pauseTime: 2000,
                transitionTime: 1500,
                ignore: "#introslide",
                delayStart: 2000,
                pauseOnMouseOver: true,
                createNavButtons: true});
        }

        $(document).ready(init);

    })(jQuery);
</script>

<?php
/* @var $this SiteCOntroller */
$form = $this->beginWidget('CActiveForm', array(
    'id' => 'user-form',
    'enableAjaxValidation' => false,
    'enableClientValidation' => true,
    'htmlOptions' => array(
        'class' => 'form-sign'
    )
));
?>
<div class="text-intro">
    <h3><?php echo t('Login NiceTips')?></h3>
    <p><?php echo t('Welcome to Nice Tips!!!')?><br />
        <?php echo t('Ipsum Inserire testo Lorem Ipsum Inserire testo Lorem Ipsum Inserire testo Lorem Ipsum')?></p>
    <p>
        <?php
        echo $form->textField($model, 'username', array(
            'placeholder' => t('IDnicetips')
        ))
        ?>
    </p>
    <?php echo $form->error($model, 'username',array('class'=>'error-message-base m11')) ?>
    <p>
        <?php
        echo $form->passwordField($model, 'password', array(
            'placeholder' => t('Password')
        ))
        ?>

    </p>
    <?php echo $form->error($model, 'password',array('class'=>'error-message-base m22')) ?>
    <?php echo $form->error($model,'identity',array('class'=>'error-message-base m22')); ?>
    <p class="font-small"><a href="<?php echo app()->createUrl('/forgot/index')?>"><?php echo t('Forgot password?')?></a></p>
</div>
<div class="but-bottom">
    <a class="hover-btn" href="<?php echo url('/site/register') ?>"><?php echo t('Register')?></a>
    <input type="submit" value="Login"  class="login-btn"/>
</div>
<?php $this->endWidget(); ?>




<script>
    $(document).ready(function() {
        h = $(window).height();

        $('.effectContainer').find('img').css('height',h);

        h_header = 0;
        h_pop = 392;
        h_pop1 = 391;
        h_top = (parseInt(h) - parseInt(h_pop)) / 2;
        h_top1 = (parseInt(h) - parseInt(h_pop1)) / 2;

        $('.login-box').attr('style', 'top:' + h_top + 'px;');
        $('.img-intro').attr('style', 'height:' + h + 'px;');
        $('.intro-login').attr('style', 'top:' + h_top1 + 'px;');

    })

</script>
