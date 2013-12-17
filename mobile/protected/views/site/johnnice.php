<?php
/**
 * Created by PhpStorm.
 * User: david
 * Date: 10/29/13
 * Time: 5:33 PM
 */
?>

<div class="padding">
    <div class="john-nice">
        <?php for ($i = 1; $i <= 35; $i++) : ?>
            <?php if ($i < 10) : ?>
                <a href="#"><img src="<?php echo FRONT_SITE_URL . 'www/images/avatar1/ava_0' . $i . '@2x.png'?>"/></a>
            <?php else : ?>
                <a href="#"><img src="<?php echo FRONT_SITE_URL . 'www/images/avatar1/ava_' . $i . '@2x.png'?>"/></a>
            <?php endif; ?>
        <?php endfor; ?>
    </div>


    <ul class="listindex list-john">
        <li><a href="<?php echo app()->createUrl('/site/johnnicedetail')?>"><img src="<?php echo FRONT_SITE_URL?>www/images/jonh.png"/><?php echo t('Love the others') ?></a></li>
        <li><a href="<?php echo app()->createUrl('/site/johnnicedetail')?>"><img src="<?php echo FRONT_SITE_URL?>www/images/jonh1.png"/><?php echo t('Smile do you would like') ?></a></li>
        <li><a href="<?php echo app()->createUrl('/site/johnnicedetail')?>"><img src="<?php echo FRONT_SITE_URL?>www/images/jonh2.png"/><?php echo t('Think for the world') ?></a></li>
    </ul>
    <script>
        backUrl = '<?php echo app()->createUrl('/site/index')?>';
    </script>
