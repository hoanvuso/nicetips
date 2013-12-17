
<div class="padding">

    <form name="_xclick" action="https://www.sandbox.paypal.com/us/cgi-bin/webscr" method="post">
    <div class="title">
        <h2><?php echo t('Thank you!')?></h2>
        <p><?php echo t('Thanks for your intention to leave a tip via Paypal. You will not be redirected to your Paypal Account.') ?></p>
    </div>


        <input type="hidden" name="cmd" value="_xclick">
        <input type="hidden" name="business" value="<?php echo $paymentAccount ?>">
        <input type="hidden" name="currency_code" value="<?php echo $currency ?>">
        <input type="hidden" name="item_name" value="Nice Tips">
        <input type="hidden" name="amount" value="<?php echo substr($amount,0,strlen($amount)-3); ?>">

    <div class="box-paypal">
        <button type="submit"><img src="<?php echo WWW_MOBILE_URL ?>images/paypal.png"></button>

    </div>
        </form>
</div>
<script>
    backUrl = '<?php echo app()->createUrl('/place/index')?>';
</script>