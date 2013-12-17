<div class="padding">
    <?php $this->renderPartial('_avatar', array(
        'people' => $people,
        'place' => $place
    )) ?>

    <div class="feed-pal">
        <li>
            <a href="<?php echo url('/place/vote', array('peopleRoleId' => $peopleRole->objectId)) ?>">
                <img src="<?php echo WWW_MOBILE_URL ?>images/peronal.png"/>
            </a>

            <p><?php echo t('Leave a feedback') ?></p>
        </li>


        <?php if ($place->activateTips) : ?>
            <li style="float:right;">


                <a href="<?php echo url('/place/tip', array('peopleRoleId' => $peopleRole->objectId)) ?>">
                    <img src="<?php echo WWW_MOBILE_URL ?>images/peronal1.png"/>
                </a>

                <p><?php echo t('Leave a tip with PayPal') ?></p>
            </li>
        <?php else: ?>
            <li style="float:right;">

                <img src="<?php echo WWW_MOBILE_URL ?>images/peronal1.png"/>

                <p><?php echo t('Not available') ?></p>
            </li>
        <?php endif; ?>
    </div>

    <div class="feedback-list">
        <h3><?php echo t('Feedback list') ?></h3>

        <div class="list-per">
            <?php if (empty($votes)) : echo t('There are no feedback.') ?>
            <?php else : ?>
                <ul>
                    <?php foreach ($votes as $vote) : ?>
                        <li>
                            <div class="left-per">
                                <?php if (isset($vote->value)) : ?>
                                    <div class="review">
                                        <?php for ($i = 1; $i <= $vote->value && $i <= 5; $i++) : ?>
                                            <img src="<?php echo WWW_MOBILE_URL ?>images/sao.png"/>
                                        <?php endfor; ?>
                                    </div>
                                <?php endif; ?>
                                <?php echo date('d/m/Y', strtotime($vote->createdAt)) ?>
                                <span><?php echo t('from') ?></span> <?php echo t('Anonimous') ?>
                            </div>
                            <div class="price">
                                <?php if (isset($vote->amount) && $vote->amount > 0 && $place->showTips) {
                                    $amount = number_format($vote->amount, 2);
                                    //
                                    $amountExplode = explode('.', $amount);
                                    echo '<span>' . $amountExplode[0] . '</span>,' . $amountExplode[1] . ' ' ?>
                                    <?php
                                    switch ($vote->currency) {
                                        case 'EUR':
                                        {
                                            echo '€';
                                            break;
                                        }
                                        case 'GBP':
                                        {
                                            echo '£';
                                            break;
                                        }
                                        default:
                                            {
                                            echo '$';
                                            }
                                    }

                                }
                                ?>
                            </div>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endif ?>
        </div>
    </div>

</div><!--box-per-->


<script>
    backUrl = '<?php echo app()->createUrl('/place/view')?>?id=<?php echo $place->objectId?>'
</script>