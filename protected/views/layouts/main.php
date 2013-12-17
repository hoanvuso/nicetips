<?php
/* @var $this Controller */
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <title><?php echo h($this->pageTitle) ?></title>
        <link rel="stylesheet" type="text/css" href="<?php echo WWW_URL ?>css/bootstrap.css"/>
        <link rel="stylesheet" type="text/css" href="<?php echo WWW_URL ?>css/style.css"/>
        <link rel="stylesheet" type="text/css" href="<?php echo WWW_URL ?>css/custom.css"/>
        <script type="text/javascript" src="<?php echo WWW_URL ?>js/parse-1.2.12.min.js"></script>
        <script type="text/javascript" src="<?php echo WWW_URL ?>js/underscore.js"></script>
        <script type="text/javascript" src="<?php echo WWW_URL ?>app/config.js"></script>
        <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"></script>

        <script>
            var placeId = "<?php echo $this->placeId ?>";
            var lang = '<?php echo app()->getLanguage() ?>';
            var placeQrCode = '<?php echo CommonHelper::generateQRCode(app()->createAbsoluteUrl('/place/index', array('id' => $this->placeId))) ?>';
            // content of popup
            var termContent = '';
            var faqContent = '';
            var aboutContent = '';
            var defaultUrl = '<?php echo app()->createUrl('/place/index') ?>';
            var controller = '<?php echo app()->controller->id ?>';
            if (controller != 'place' && placeId == 'np') {
                window.location.href = '<?php echo app()->createUrl('/place/index') ?>' + '?id=np';
            }
            // language
        </script>
    </head>
    <body>


        <!--<div class="message-container">
            <div class="content">rwer</div>
        </div>
        -->
        <div class="load">
            <img src="<?php echo WWW_URL ?>/images/loading.gif"/>
        </div>


        <div class="container">
            <div class="top-bar">
                <div class="step">
                    <div class="place-select-container">
                        <img src="<?php echo FRONT_SITE_URL ?>www/images/current-place.png" alt="">
                            <?php if (!empty($this->listPlace)) : ?>
                                <select id="place-select">
                                    <option value="np">Create a new place</option>
                                    <?php foreach ($this->listPlace->results as $item) : ?>

                                        <option value="<?php echo $item->objectId ?>" <?php echo ($item->objectId == $this->placeId) ? ' selected' : ''; ?>>
                                            <?php echo $item->name ?></option>

                                    <?php endforeach; ?>
                                </select>
                            <?php endif; ?>
                    </div>
                    <div class="account">
                        <a href="<?php echo url('/site/logout') ?>" class="logout">LogOut</a>
                        <ul class="list-ac">
                            <li><a href="#" class="active">
                                    <img src="<?php echo WWW_URL ?>images/icon.jpg"/> Account <span class="cong">+</span></a>
                            </li>
                            <li><a href="#"><img src="<?php echo WWW_URL ?>images/icon1.jpg"/> Setting</a>
                                <ul>

                                    <li><a href="#" id="delete-place"><?php echo t('Delete place') ?></a></li>
                                    <li>---</li>
                                    <li><a href="#" class="change-lang"><?php echo t('Change language') ?></a></li>

                                    <li>---</li>
                                    <li><a href="#" id="about-link"><?php echo t('About') ?></a></li>
                                    <li><a href="#" id="faq-link"><?php echo t('FAQ') ?></a></li>
                                    <li><a href="#" id="term-link"><?php echo t('Terms and conditions') ?></a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <!--account-->

                    <div class="logo">
                        <a href="<?php echo FRONT_SITE_URL ?>">
                            <img src="<?php echo WWW_URL ?>images/logo.png"/>
                        </a>
                    </div>
                    <div class="line"></div>

                    <?php $this->widget('application.widgets.WQuickNav') ?>

                </div>
            </div>
            <!--top-bar-->

            <div class="title">
                <h2>NiceTips</h2>

                <?php
                $controllerName = app()->controller->id;
                switch ($controllerName) {
                    case 'place' : {
                            if ($this->placeId == '') {
                                echo t('<p>Welcome to NiceTips at a moment <br/> are no place that you manage, add new place!</p>');
                            }
                            break;
                        }
                    case 'team': {
                            echo t('<p>Please list all the people that work <br/>in your organization/mandatory!</p>');
                            break;
                        }
                    case 'tips' : {
                            echo t('<p>Please complete the infomation <br/> necessary to manage the tips !</p>');
                            break;
                        }

                    case 'vote' : {
                            echo t('<p>Welcome <br/> lorem ..... !</p>');
                            break;
                        }
                }
                ?>

            </div>
            <!--title-->

            <div class="content">
<?php if (user()->hasFlash('error')) : ?>

                    <div class="alert alert-error"><?php echo user()->getFlash('error') ?></div>

                <?php endif; ?>

<?php echo $content ?>


                <div class="tad-bot">
                <?php
                $this->widget('zii.widgets.CBreadcrumbs', array(
                    'links' => array(
                        t('Place') => array('/place/index', 'id' => $this->placeId),
                        t('Team') => array('/team/index', 'id' => $this->placeId),
                        t('Tips') => array('/tips/index', 'id' => $this->placeId),
                        t('Vote') => array('/vote/index', 'id' => $this->placeId),
                    ),
                    'separator' => ' >',
                    'homeLink' => false,
                    'activeLinkTemplate' => '<a href="{url}" class="breadcummb-items">{label}</a>',
                ));
                ?>
                </div>

                <div class="footer">
                    <div class="nut-sli">
                    <?php
                    $this->widget('zii.widgets.CBreadcrumbs', array(
                        'links' => array(
                            '' => array('/place/index', 'id' => $this->placeId),
                            ' ' => array('/team/index', 'id' => $this->placeId),
                            '  ' => array('/tips/index', 'id' => $this->placeId),
                            '   ' => array('/vote/index', 'id' => $this->placeId),
                        ),
                        'separator' => ' ',
                        'homeLink' => false,
                        'activeLinkTemplate' => '<a href="{url}" class="breadcummb-bullet-items">{label}</a>',
                    ));
                    ?>
                    </div>
                    <p><?php echo t('Copyright 2013 - All rights reserved') ?>d</p>
                </div>

            </div>
            <!--content-->

        </div>
        <!--container-->

<?php
$this->beginWidget('zii.widgets.jui.CJuiDialog', array(
    'id' => 'lang-dialog',
    // additional javascript options for the dialog plugin
    'options' => array(
        'title' => 'Select your language',
        'autoOpen' => false,
        'width' => '350',
        'height' => '100',
        'show' => array(
            'effect' => 'fade',
            'duration' => 700,
        ),
        'hide' => array(
            'effect' => 'fade',
            'duration' => 400,
        )
    ),
    'htmlOptions' => array(
        'style' => 'z-index:1000',
    )
));
?>
        <?php echo CHtml::beginForm(app()->createUrl('/site/selectlang'), 'post', array('id' => 'lang-form')); ?>
        <div>
        <?php echo CHtml::dropDownList('lang', '', array('en' => 'English', 'it' => 'Italia', 'de' => 'Deustch')) ?>
        <?php echo CHtml::submitButton('Select', array('class' => 'btn select-lang-btn')) ?>
        </div>
        <?php echo CHtml::endForm() ?>


            <?php
            $this->endWidget('zii.widgets.jui.CJuiDialog');
            ?>

        <?php
        $this->beginWidget('zii.widgets.jui.CJuiDialog', array(
            'id' => 'about-dialog',
            // additional javascript options for the dialog plugin
            'options' => array(
                'title' => 'About',
                'autoOpen' => false,
                'modal' => false,
                'width' => '350',
                'height' => '100',
                'draggable' => false,
                'show' => array(
                    'effect' => 'fade',
                    'duration' => 700,
                ),
                'hide' => array(
                    'effect' => 'fade',
                    'duration' => 400,
                )
            ),
            'htmlOptions' => array(
                'style' => 'z-index:1000',
            )
        ));
        ?>

        <div id="about-content">
            <p>Content of about here</p>
        </div>

        <?php
        $this->endWidget('zii.widgets.jui.CJuiDialog');
        ?>

        <?php
        $this->beginWidget('zii.widgets.jui.CJuiDialog', array(
            'id' => 'faq-dialog',
            // additional javascript options for the dialog plugin
            'options' => array(
                'title' => 'FAQ',
                'autoOpen' => false,
                'modal' => false,
                'width' => '350',
                'height' => '100',
                'show' => array(
                    'effect' => 'fade',
                    'duration' => 700,
                ),
                'hide' => array(
                    'effect' => 'fade',
                    'duration' => 400,
                )
            ),
            'htmlOptions' => array(
                'style' => 'z-index:1000',
            )
        ));
        ?>
        <div id="faq-content">
            <p>Content of faq here</p>
        </div>

        <?php $this->endWidget('zii.widgets.jui.CJuiDialog'); ?>

        <?php
        $this->beginWidget('zii.widgets.jui.CJuiDialog', array(
            'id' => 'term-dialog',
            // additional javascript options for the dialog plugin
            'options' => array(
                'title' => 'Term',
                'autoOpen' => false,
                'modal' => false,
                'width' => '350',
                'height' => '100',
                'show' => array(
                    'effect' => 'fade',
                    'duration' => 700,
                ),
                'hide' => array(
                    'effect' => 'fade',
                    'duration' => 400,
                )
            ),
            'htmlOptions' => array(
                'style' => 'z-index:1000',
            )
        ));
        ?>

        <div id="term-content">
            <p>Content of term here</p>
        </div>


        <?php $this->endWidget('zii.widgets.jui.CJuiDialog'); ?>
        <script>
            $(document).ready(function() {

                h = $(window).height();
                h_header = 0;
                h_pop = 480;
                h_top = (parseInt(h) - parseInt(h_pop)) / 2;
                $('.intro').attr('style', 'top:' + h_top + 'px;');
                $('.img-intro').attr('style', 'height:' + h + 'px;');

            });
        </script>
        <script type="text/javascript">
            deletePlaceUrl = '<?php echo app()->createUrl('/place/delete') ?>';   // URL FOR delete place
            indexPlaceUrl = '<?php echo app()->createUrl('/place/index') ?>';
        </script>
        <script src="<?php echo bu() ?>/www/js/app.js"></script>
    </body>
</html>