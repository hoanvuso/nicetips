<div id="divVote">
    <table cellpadding="0" cellspacing="0" class="table-tips">
        <tr>
            <td class="td-1" style="padding-bottom:10px;">&nbsp;</td>
            <td colspan="2" style="padding-bottom:10px;">
                <?php echo t('LIST OF POSITIVE FEEDBACKS RECEIVED')?>
            </td>
        </tr>
        <tr>
            <td class="td-1" >&nbsp;</td>
            <td class="td-2" colspan="2">
                <div class="box-pro">
                    <table cellpadding="0" cellspacing="0" class="table-pro" id="tbl-vote">
                        <tr>
                            <th><?php echo t('Date')?> </th>
                            <th><?php echo t('To')?></th>
                            <th><?php echo t('From')?> </th>
                            <th><?php echo t('Comments')?></th>
                        </tr>
                    </table>
                    <div class="loading"><?php echo t('Loading...')?></div>
                    <div class="pagination"></div>
                </div>
            </td>
        </tr>


        <tr>
            <td colspan="3">
                <div class="line-tip">
                    <img src="<?php echo WWW_URL ?>images/tip.jpg" style="top:-39" id="print-vote-infographic-btn"/>
                </div>
            </td>
        </tr>
        <tr>
            <td class="td-1">&nbsp;</td>
            <td colspan="2" class="td-2" >
                <img src="<?php echo WWW_URL ?>images/logo3.jpg" style="margin-left:120px;"/>
            </td>
        </tr>
    </table>
</div>



<?php
// dialog show the review of leaflet
$this->beginWidget('zii.widgets.jui.CJuiDialog', array(
    'id' => 'vote-infographic-dialog',
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

<form action="<?php echo app()->createUrl('/vote/downloadpdf') ?>" method="POST" id="download-pdf-form" target="_blank"
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

<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/tip.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/collections/tip.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/views/vote/vote.js"></script>

<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/helper/util.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/place.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/views/place/place.js"></script>

