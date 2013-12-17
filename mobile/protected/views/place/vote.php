<div class="padding">
    <form action="" method="post" id="vote-form">
        <?php
        $this->renderPartial('_avatar', array(
            'people' => $people,
            'place' => $place
        ))
        ?>

        <div class="review">
            <p><?php echo t('Your Vote');?></p>
            <?php $this->widget('CStarRating', array('name' => 'rating', 'maxRating' => 5, 'minRating' => 1)); ?>

            <div id="rating-message" style="display:none"><?php echo t('Please rate') ?></div>
        </div>

        <div class="form-con">
            <p>
                <label><?php echo t('Additional comments')?></label>
                <textarea placeholder="(Optionally write something here)" name="comments"></textarea>
            </p>

            <p>
                <label><?php echo t('User')?></label>
                <input type="text" placeholder="<?php echo t('(Anonymous)') ?>" name="user" />
            </p>

         <!--   <p>
                <label>Your name</label>
                <input type="text" placeholder="(Anonimous)" name="name"/>
            </p>-->

        </div>

        <div class="box-paypal">
            <button type="submit"><img src="<?php echo WWW_MOBILE_URL ?>images/vote.png"/></button>
        </div>

        <input type="hidden" name="placeId" value="<?php echo $place->objectId ?>"/>
        <input type="hidden" name="peopleId" value="<?php echo $people->objectId ?>"/>
        <input type="hidden" name="lat" value="0" id="lat"/>
        <input type="hidden" name="lon" value="0" id="lon"/>
    </form>

</div><!--padding-->
<script>
    backUrl = '<?php echo app()->createUrl('/place/index')?>';
</script>
