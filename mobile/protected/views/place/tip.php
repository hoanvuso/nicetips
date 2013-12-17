<div class="padding">

    <?php if ($paymentAccount != ''): ?>
        <form action="" id="payment-form" method="post">
            <?php
            $this->renderPartial('_avatar', array(
                'people' => $people,
                'place' => $place
            ))
            ?>

            <div class="pay-price row-fluid">
                <div
                    class="left-pay"><?php echo t('A small tip can make the difference at the end of the month!') ?></div>
                <div class="right-pay">
                    <?php echo t('Amount') ?> (<?php
                    switch ($place->defaultCurrency) {
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
                    ?>)
                    <div class="clear"></div>
                    <div class="price"><input type="text" name="amount" id="amount"/></div>
                </div>
            </div>

            <div class="form-con">
                <p>
                    <label><?php echo t('Additional comments') ?></label>
                    <textarea placeholder="(Optionally write something here)" name="comments"></textarea>
                </p>

                <p>
                    <label><?php echo t('Your name') ?></label>
                    <input type="text" placeholder="<?php echo t('(Anonymous)') ?>" name="name"/>
                </p>
            </div>


            <div class="box-paypal">
                <button type="submit"><img src="<?php echo WWW_MOBILE_URL ?>images/paypal.png"/></button>
                <p><?php echo t('It\'s safe, we will never store information about your Paypal account!') ?></p>
            </div>
            <input type="hidden" name="placeId" value="<?php echo $place->objectId ?>"/>
            <input type="hidden" name="peopleId" value="<?php echo $people->objectId ?>"/>
            <input type="hidden" name="lat" value="0" id="lat"/>
            <input type="hidden" name="lon" value="0" id="lon"/>
        </form>
    <?php else: ?>
        <span><?php echo t('Payment Account was not found.') ?></span>
    <?php endif; ?>

</div><!--padding-->

<script>
    /*
     event on keypress on amount
     */

    $(document).on('keydown', '#amount', function (event) {
        if (event.keyCode == 8 || event.keyCode == 46) {
        } else {
            if (event.keyCode < 48 || event.keyCode > 57) {
                this.blur();
            }
        }
    });
    /*
     event on amount lost focus
     */

    $(document).on('blur', '#amount', function () {
        var currentAmount = $(this).val();
        var length = currentAmount.length;
        var str = currentAmount.substr(length - 3, length);
        if (str != ',00') {
            if ($(this).val() != '' && parseFloat($(this).val()) > 0) {
                var amount = $(this).val() + ',00';
                $(this).val(amount);
            }
        }
    });

    $(document).on('click', '#amount', function () {
        var currentAmount = $(this).val();
        var length = currentAmount.length;
        var str = currentAmount.substr(length - 3, length);
        if (str == ',00') {
            $(this).val(currentAmount.substr(0, length - 3));
        }
    });

    backUrl = '<?php echo app()->createUrl('/place/personal')?>?peopleRoleId=<?php echo($peopleRoleId) ?>';

</script>