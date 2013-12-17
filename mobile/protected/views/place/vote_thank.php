<div class="padding">

    <div class="title">
        <h2><?php echo t('Thank you!')?></h2>
        <p><?php echo t('Your positive, valuable, nice vote has been register by "{peopleName}" that wishes you all best!',array('{peopleName}'=>$people->peopleName))?></p>
    </div>
    <div class="intro-logo"><img src="<?php echo WWW_MOBILE_URL ?>images/logo3.jpg" alt=""></div>
</div>
<script>
    backUrl = '<?php echo app()->createUrl('/place/index')?>';
</script>
