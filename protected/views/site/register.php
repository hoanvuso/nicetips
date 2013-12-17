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
    .m1 { top: 256px; }

    .m2 { top: 293px;}

    .m3 { top: 330px;}
</style>

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
        <h3><?php echo t('Register NiceTips')?></h3>
        <div class="content" style=" padding-top: 12px;
    padding-bottom: 22px;">
        <p><?php echo t('Welcome to Nice Tips!!!')?><br />
            <?php echo t('Ipsum Inserire testo Lorem Ipsum Inserire testo Lorem Ipsum Inserire testo Lorem Ipsum') ?></p>
        <p>
            <?php

            echo $form->textField($model, 'email', array(
                'placeholder' => t('Email'),
                'required'=>'required'
            ))
            ?>

        </p>
        <?php echo $form->error($model, 'email',array('class'=>'error-message-base m1')) ?>
        <p>
            <?php
            echo $form->textField($model, 'username', array(
                'placeholder' => t('Username'),
                'required'=>'required'
            ))
            ?>
            <?php echo $form->error($model, 'username',array('class'=>'error-message-base m2')) ?>
        </p>


        <p>
            <?php
            echo $form->passwordField($model, 'password', array(
                'placeholder' => t('Password')
            ))
            ?>
           <?php echo $form->error($model, 'passwword',array('class'=>'error-message-base m3')) ?>
        </p>
        <p class="font-small"><?php echo t('Cliccando su Register, accetti tutti i Termini e confermi di aver letto e accettato la normativa sulla Privacy.')?></p>
        </div>
    </div>
    <div class="but-bottom">
        <a class="hover-btn" href="<?php echo url('/site/login') ?>"><?php echo t('Cancel')?></a>
        <input type="submit" value="<?php echo t('Register') ?>" class="register-btn" />
    </div>
<?php $this->endWidget(); ?>
<script>
    $(document).ready(function() {

        h = $(window).height();
        h_header = 0;
        h_pop = 480;
        h_top = (parseInt(h) - parseInt(h_pop)) / 2;
        $('.intro').attr('style', 'top:' + h_top + 'px;');
        $('.img-intro').attr('style', 'height:' + h + 'px;');
    });

</script>