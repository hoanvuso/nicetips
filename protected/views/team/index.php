<form class="form-step">
    <table cellpadding="0" cellspacing="0" class="table-tips">

        <tr>
            <td class="td-1"><img src="<?php echo FRONT_SITE_URL ?>www/images/logo4.jpg"/></td>
            <td class="td-2" colspan="2">
                <div class="box-pro">
                    <table cellpadding="0" cellspacing="0" class="table-pro" id="view1">
                        <tr>
                            <th><?php echo t('Name') ?></th>
                            <th><?php echo t('Picture') ?></th>
                            <th><?php echo t('Email') ?></th>
                            <th><?php echo t('Department') ?></th>
                            <th class="action-color"><?php echo t('QR print') ?></th>
                            <th class="action-color"><?php echo t('Edit') ?></th>
                            <th class="action-color"><?php echo t('Delete') ?></th>
                        </tr>

                    </table>
                </div>
            </td>
        </tr>
        <tr>

            <table cellpadding="0" cellspacing="0" class="table-tips" id="view2">
                <tr>
                    <td colspan="3">
                        <div class="line-tip"><img src="<?php echo FRONT_SITE_URL ?>www/images/cong.jpg" style="top:-39"
                                                   id="save-people"/></div>
                    </td>
                </tr>
                <tr>
                    <td class="td-1"><img src="<?php echo FRONT_SITE_URL ?>www/images/icon6.jpg"/>
                    </td>
                    <td class="td-2" style="padding-left: 15px; padding-right: 85px;">
                        <input type="text" placeholder="People name" id="lastname"/>
                        <img
                            src="<?php echo FRONT_SITE_URL ?>www/images/star.jpg"/>
                        <span id="lastname-error"><p></p></span>
                    </td>


                    <td class="td-3">
                        <input type="text" placeholder="<?php echo t('Email') ?>" id="email"/>
                        <span id="email-error"><p></p></span>
                    </td>

                </tr>

                <tr>
                    <td colspan="3">
                        <table>
                            <tr>
                                <td class="sp1">
                                    <?php echo t('<p>Upload files <br/>.jpeg, .tif, .bmp, .eps <br/> (max 400x400 - 150 dpi)</p>') ?>
                                </td>
                                <td class="sp2" style="overflow: hidden;width: 250px" >
                                    <img src="<?php echo FRONT_SITE_URL ?>www/images/iamges.jpg" id="people-thumb" style="max-width: 250px;max-height: 250px"/>
                                    <img src="" style="display: none;width: auto;height: auto" id="picture_real"/>
                                    <input type="hidden" id="people-thumb-base64" value="">

                                </td>
                                <td class="sp3">

                                </td>
                                <td class="sp4" style="padding-right: 60px">
                                    <img id="avatar-thumb"
                                         src="<?php echo FRONT_SITE_URL ?>www/images/avatar/ava_01@2x.png"
                                         style="width: 80px"/>
                                    <input type="hidden" value="01" id="avatar-thumb-val">
                                </td>
                                <td class="sp5">

                                    <ul id="department-ui"></ul>
                                    <input type="hidden" placeholder="<?php echo t('Department') ?>" id="department"/>
                                    <span id="department-error"><p></p></span>

                                </td>
                            </tr>
                            <tr>
                                <td class="sp1"><?php echo t('The picture is important and can be added later.') ?></td>
                                <td class="sp2">
                                    <div class="upload_avatar">
                                        <button class="button" type="button">
                                            <?php echo t('Upload') ?> </span>
                                        </button>
                                        <input type="file" class="no-uniform" name="file" id="people-picture">
                                        <span id="image-error"><p></p></span>
                                    </div>
                                </td>
                                <td class="sp3"></td>
                                <td class="sp4" style="padding-right: 60px">
                                    <div class="upload_avatar">
                                        <button class="button" type="button" id="my-ava">
                                            <?php echo t('MyAvatar') ?> </span>
                                        </button>

                                    </div>
                                </td>
                                <td class="sp5">
                                    <button class="button" type="button" id="print-badge" style="width: 290px">
                                        <?php echo t('Print badge') ?> </span>
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

            </table>

        </tr>
    </table>
</form>
<style>
    .ui-dialog .ui-dialog-content {
        overflow: hidden;
    }
</style>

<?php
// dialog show the review of leaflet
$this->beginWidget('zii.widgets.jui.CJuiDialog', array(
    'id' => 'badge-dialog',
    // additional javascript options for the dialog plugin
    'options' => array(
        'title' => t('Print your badge'),
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

<form action="<?php echo app()->createUrl('/team/downloadpdf') ?>" method="POST" id="download-pdf-form" target="_blank"
      name="download-pdf-form">
    <div style="padding:10px 20px; background:#fae5f2;">
        <input type="radio" name="rad" value="list" id="list-opt" checked> <?php echo t('Print all people') ?><br>
        <input type="radio" name="rad" value="department"
               id="department-opt"> <?php echo t('Print people each department') ?><br>
    </div>

    <!--- default print with all people on list --->
    <div style="height:520px;overflow: auto">
        <div id="print-people-list" style="text-align:center;padding:20px; overflow:hidden;"></div>
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
// dialog show the review of leaflet
$this->beginWidget('zii.widgets.jui.CJuiDialog', array(
    'id' => 'avatar-list-dialog',
    // additional javascript options for the dialog plugin
    'options' => array(
        'title' => t('Select your avatar'),
        'autoOpen' => false,
        // 'modal' => true,
        'width' => '700',
        'height' => '500',
        'draggable' => false,
        'show' => array(
            'effect' => 'fade',
            'duration' => 700,
        ),
        'hide' => array(
            'effect' => 'fade',
            'duration' => 400,
        )),


    'htmlOptions' => array(
        'style' => 'z-index:1000,overflow:hidden',

    )

));
?>
<select id="avatar-list" style="height: 600px"></select>
<?php
$this->endWidget();
?>

<link rel="stylesheet" href="<?php echo FRONT_SITE_URL ?>www/css/image-picker.css">
<link rel="stylesheet" href="<?php echo FRONT_SITE_URL ?>www/css/jquery.taghandler.css">
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/place.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/views/place/place.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/employee.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/models/collections/employee.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/views/team/currentemployee.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/views/team/listemployee.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/app/helper/util.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/js/jquery.taghandler.min.js"></script>
<script type="text/javascript" src="<?php echo FRONT_SITE_URL ?>www/js/image-picker.js"></script>

<script>

    var saveUrl = '<?php echo app()->createUrl('/team/save')?>';
    var wwwUrl = '<?php echo FRONT_SITE_URL . 'www'?>';
    var peopleInfoUrl = '<?php echo app()->createUrl('/team/getpeopleinfo')?>';
    var editUrl = '<?php echo app()->createUrl('/team/edit')?>';
    var deteteUrl = '<?php echo app()->createUrl('/team/delete')?>';
    var getPeopleUrl = '<?php echo app()->createUrl('/team/getpeople')?>';
    var peopleViewUrl = '<?php echo app()->createAbsoluteUrl('/mobile/place/personal')?>';
    var downloadPDFUrl = '<?php echo app()->createUrl('/team/downloadpdf')?>';
    var placeName = '<?php echo !empty($this->placeName)?$this->placeName:''?>';
    var placeQrCode = '<?php echo CommonHelper::generateQRCode($this->placeId,200,200)?>';
    var defaultPeopleImage = '<?php echo FRONT_SITE_URL?>' + 'www/images/iamges.jpg';
    var defaultAvatarThumb = '<?php echo FRONT_SITE_URL?>' + 'www/images/avatar/ava_01@2x.png';

    // create new list view
    var listEmployeeView = new ListEmployeeView({model: new EmployeeColection});
 //   listEmployeeView.url.peopleViewUrl = peopleViewUrl;
    // get data for this view depend on placeId and userId
    listEmployeeView.getPeopleList();

    // create new current item view
    var currentEmployeeView = new CurrentEmployeeView({model: new Employee});


</script>