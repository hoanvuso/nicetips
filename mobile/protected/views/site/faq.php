<?php
/**
 * Created by PhpStorm.
 * User: david
 * Date: 10/16/13
 * Time: 3:13 PM
 */
?>

<div id="faq">
    <div class="intro-logo"><img src="<?php echo WWW_MOBILE_URL ?>images/logo.png" alt=""></div>
    <div class="title">
        <h2>FAQ</h2>
    </div>

    <div id="faq-content">
        <ul class="listindex faq ">
            <li><a href="<?php echo app()->createUrl('/site/faqdetail')?>"><img src="<?php echo FRONT_SITE_URL?>www/images/jonh.png" /><?php echo t('HOW shoud I...') ?></a></li>
            <li><a href="<?php echo app()->createUrl('/site/faqdetail')?>"><img src="<?php echo FRONT_SITE_URL?>www/images/jonh1.png" /><?php echo t('WHEN I leave a feedback...') ?></a></li>
            <li><a href="<?php echo app()->createUrl('/site/faqdetail')?>"><img src="<?php echo FRONT_SITE_URL?>www/images/jonh2.png" /><?php echo t('WHAT happens after the people...') ?></a></li>
        </ul>
    </div>

</div>
<script>
    backUrl = '<?php echo app()->createUrl('/site/index')?>';
</script>
