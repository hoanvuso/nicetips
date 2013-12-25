<div id="divVote" class="form-step  box-tips">
	<img src="<?php echo WWW_URL ?>images/paypal.jpg" class="img-paypal"/>
	<div class="row-fluid">
        <div class="span12">
            <div class="span3">
            	<div class="hint-text">
            	<?php echo t('Use this PayPal <br/>account if not differently set.')?>
                </div>
                <div>
                	<img src="<?php echo WWW_URL ?>images/logo4.jpg" class="imgtips imgtips-tip" style="left:130px; top:67px"/>
                </div>
            </div>
            <div class="span9">
            	<div class="pull-left">
                	<div class="table-pro row">
                      <img src="<?php echo WWW_URL ?>images/icon2.jpg" class="iconpaypal" /><input type="text" placeholder="<?php echo t('PayPal Account') ?>"
                           value="<?php echo !empty($placePayment) ? $placePayment->accountName : '' ?>" style="float:left;"
                           id="paypal-place-account" />

                    <div class="box-etip">
                        <a href="#" id="save-btn"><img src="<?php echo FRONT_SITE_URL?>www/images/plus.png"></a>
                        <a href="#" id="edit-btn"><i class="action edit"></i></a>
                        <a href="#" id="delete-btn"><i class="action delete"></i></a>
                    </div>
                   </div>

                   <div class="row">
                   		<div class="box-pro" style="overflow: hidden">
                                <table cellpadding="0" cellspacing="0" id='view1' class="table-pro tbale-tips">
                                    <tr>
                                        <th><?php echo t('Name');?></th>
                                        <th ><?php echo t('PayPal Account')?></th>
                                        <th class="action-color"><?php echo t('Account')?></th>
                                        <th class="action-color"><?php echo t('Edit')?></th>
                                        <th class="action-color"><?php echo t('Delete')?></th>
                                    </tr>
                                </table>
                            </div>
                   </div>

                </div>
                <div class="pull-right">
                	<ul class="config-tips table-pro">
                        <li><input type="checkbox" id="active-tips" <?php echo  ($activateTips)?'checked':'' ?> class="save-tip-config" /> <?php echo t('Active tips'); ?></li>
                        <li>
                            <input type="checkbox" <?php echo ($showTips)?'checked':'' ?> id="show-tips" style="width:auto;" class="save-tip-config" /> <?php echo t('Show the tip amount to everyone'); ?>
                            <img id="save-tip-config"
                                src="<?php echo FRONT_SITE_URL ?>www/images/icon10.jpg"/>

                        </li>

                    </ul>

                    <select id="value-cash">
                                            <option value=""><?php echo t('Select value cash')?></option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">Euro</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                    <br />
                      <input id="add-people" type="button" value="Add people" class="button" style="float: left; width: 106px; margin-top: 40px;">

                </div>
            </div>
        </div>
    </div>

     <div class="line-tip"><img src="<?php echo WWW_URL ?>images/tip.jpg" style="top:-39" id="print-infographic-btn"/></div>

    <div class="row-fluid">
        <div class="span12">
            <div class="span3">
            	<img src="<?php echo WWW_URL ?>images/logo2.jpg" class="imgtips imgtips-tip"/>
            </div>
            <div class="span9" style="margin-left:0px;">
            	<?php echo t('LIST OF RECEIVED TIPS')?>

                <div class="box-pro" style="margin-bottom:20px;">

                    <table cellpadding="0" cellspacing="0" class="table-pro" id="tbl-vote" >

                        <tr>
                            <th><?php echo t('Date')?></th>
                            <th><?php echo t('To')?></th>
                            <th><?php echo t('Amount')?></th>
                            <th><?php echo t('From')?></th>
                            <th><?php echo t('Comments')?></th>
                        </tr>

                    </table>
                    <!--<div class="pagination"></div>-->
                </div>
            </div>
        </div>
    </div>


</div>

<?php
// dialog show the review of leaflet
$this->beginWidget('zii.widgets.jui.CJuiDialog', array(
    'id' => 'tips-infographic-dialog',
    // additional javascript options for the dialog plugin
    'options' => array(
        'title' => t('Print your Infographic'),
        'autoOpen' => false,
        // 'modal' => true,
        'width' => '872',
        'height' => '700',
        'draggable' => false,
        'resizable'=>'false',
        'show' => array(
            'effect' => 'fade',
            'duration' => 350,
        ),
        'hide' => array(
            'effect' => 'fade',
            'duration' => 350,
        )),


    'htmlOptions' => array(
        'style' => 'z-index:1000,overflow:hidden',

    )

));
?>


<form action="<?php echo app()->createUrl('/tips/downloadpdf') ?>" method="POST" id="download-pdf-form" target="_blank"
      name="download-pdf-form">
    <div style="height:520px;overflow: auto">
        <div id="print-infographic" style="text-align:center;padding:20px; overflow:hidden;"></div>
    </div>
    <div style="padding:10px 20px; background:#fae5f2;">
        <input type="button" class="btn" id="download-btn" value="<?php echo t('Download PDF') ?>">
        <input type="hidden" id="html_string" name="html_string" value="">
    </div>
</form>

<?php
$this->endWidget();
?>


<?php

// dialog show the people of the place for add
$this->beginWidget('zii.widgets.jui.CJuiDialog', array(
    'id' => 'tips-add-people-dialog',
    // additional javascript options for the dialog plugin
    'options' => array(
        'title' => t('Add new people payment'),
        'autoOpen' => false,
        // 'modal' => true,
        'width' => '700',
        'height' => '600',
        'draggable' => false,
        'resizable'=>'false',
        'show' => array(
            'effect' => 'fade',
            'duration' => 350,
        ),
        'hide' => array(
            'effect' => 'fade',
            'duration' => 350,
        )),

    'htmlOptions' => array(
        'style' => 'z-index:1000,overflow:hidden',

    )

));
?>
<div class="box-pro" style="overflow: hidden">
    <table cellpadding="0" cellspacing="0" id='view-people-add' class="table-pro">
        <tr>
            <th><?php echo t('Name');?></th>
            <th><?php echo t('Email')?></th>
            <th class="action-color"><?php echo t('Add')?></th>
        </tr>
    </table>
</div>
<?php
$this->endWidget();
?>


<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/helper/util.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/place.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/views/place/place.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/tip.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/collections/tip.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/views/tips/tip.js"></script>
<script>
    var placeId = '<?php echo $this->placeId ?>';
    var indexUrl = '<?php echo $this->createUrl('/tips') ?>';
    var getPeopleAccountUrl = '<?php echo $this->createUrl('/tips/getpeopleaccount') ?>';
    var saveUrl = '<?php echo $this->createUrl('/tips/save')?>';
    var deleteUrl = '<?php echo app()->createUrl("/tips/delete")?>';
    var savePlacePaypalAccount = '<?php echo app()->createUrl("/tips/savepaypalaccount")?>';
    var deletePlacePaypalAccountUrl = '<?php echo app()->createUrl("/tips/deleteplacepaypalaccount")?>';
    var wwwUrl = '<?php echo FRONT_SITE_URL?>'
    var saveTipConfigUrl = '<?php echo app()->createUrl("/tips/savetipconfig")?>';
    var saveValueCashUrl = '<?php echo app()->createUrl("/tips/savevaluecash")?>';
</script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/helper/util.js"></script>

<script lang="javascript">
    var tipsView = new TipsView({model : new TipCollection});
    tipsView.getPeopleList();
    // select the cash value
    var valueCash = '<?php echo ($valueCash!='')?$valueCash:""?>';
    if(valueCash!='') {
        _.each($('#value-cash').find('option'),function(item){
            if($(item).val()==valueCash) {
                $(item).attr('selected','selected');
            }
        })
    }
    /**
     * show the add people dialog
     */

    $(document).on('click','#add-people',function(){
        $('#tips-add-people-dialog').dialog('open');
    });


</script>