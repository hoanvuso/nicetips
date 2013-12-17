<?php
/* @var $this Controller */
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"/>
    <title>Nice tips</title>
    <link rel="stylesheet" type="text/css" href="<?php echo WWW_MOBILE_URL ?>css/bootstrap.min.css"/>
    <link rel="stylesheet" type="text/css" href="<?php echo WWW_MOBILE_URL ?>css/bootstrap-responsive.min.css"/>
    <link rel="stylesheet" type="text/css" href="<?php echo WWW_MOBILE_URL ?>css/style.css"/>
    <script type="text/javascript" src="http://www.parsecdn.com/js/parse-1.2.12.min.js"></script>
    <script type="text/javascript" src="http://underscorejs.org/underscore.js"></script>
    <script>

        Parse.initialize("rSC2OyZyOme5psQ6cpA5eVIh1x9JLhrToiPfMhEU", "9KfiFBe00lwYFAkgxZqJQNQzwudafkvo8aYJT9jq");
        backUrl = '';
    </script>
</head>
<body>

<div class="load" style="width: 20px; height: 20px; padding: 15px; position: absolute; z-index: 5000; display: none">
    <img src="<?php echo WWW_URL ?>/images/loading.gif"/>
</div>
<div class="header">
    <div class="navbar">
        <div class="cus-nav">
            <div class="navbar-inner">
                <div class="container">
                    <?php if (app()->controller->id != 'site') : ?>
                        <button type="button" class="btn btn-back"
                                style="float: left;height: 30px; font-weight: bold; margin-left: 7px">
                            <a href="" id="btn-back-url"><?php echo t('Back') ?></a>
                        </button>
                    <?php else: ?>
                        <?php  if(app()->controller->action->id!='index'):?>
                        <button type="button" class="btn btn-back"
                                style="float: left;height: 30px; font-weight: bold; margin-left: 7px">
                            <a href="" id="btn-back-url"><?php echo t('Back') ?></a>
                        </button>
                            <?php endif;?>
                    <?php endif;?>
                    <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <h3><?php echo $this->pageTitle ?></h3>

                    <div class="nav-collapse collapse">
                        <ul class="listindex">
                            <li><a href="<?php echo url('/site/lang') ?>"><i class="icon icon-1"></i><?php echo t('Select a language') ?></a></li>
                            <li><a href="<?php echo app()->createUrl('/site/johnnice')?>"><i class="icon icon-3"></i><?php echo t('John Dylan Nice Philosophy') ?></a></li>
                            <li><a href="<?php echo url('/place') ?>"><i class="icon icon-4"></i><?php echo t('Search a Place') ?></a>
                                <ul>
                                    <?php if (app()->controller->id == 'place'): ?>
                                        <?php
                                        $action = app()->controller->action->id;
                                        switch ($action) {

                                            case 'index' :
                                            {
                                                echo '<li><a href="#"><i class="icon icon-5"></i>'.t('Place details').'</a></li>';
                                                break;
                                            }
                                            case 'personal' :
                                            {
                                                echo '<li><a href="#"><i class="icon icon-7"></i>'.t('Person detail').'</a></li>';
                                                break;
                                            }

                                            case 'view' :
                                            {
                                                echo ' <li><a href="#"><i class="icon icon-6"></i>'.t('List people').'</a></li>';
                                                break;
                                            }
                                        }

                                        ?>

                                    <?php endif; ?>
                                </ul>
                            </li>
                            <li><a href="<?php echo app()->createUrl('/site/faq') ?>"><i class="icon icon-8"></i><?php echo t('FAQ') ?></a>
                            </li>
                            <li><a href="<?php echo app()->createUrl('/site/faq') ?>"><i class="icon icon-9"></i><?php echo t('Terms and Conditions') ?></a></li>
                            <?php /*<li><a href="index.php"><i class="icon icon-10"></i>Logout</a></li> */ ?>
                        </ul>
                    </div>
                    <!--/.nav-collapse -->
                </div>
            </div>
        </div>
    </div>
</div>

<div class="container">
    <div class="content">
        <?php echo $content ?>
    </div>
</div>
<!-- /container -->
<script type="text/javascript" src="<?php echo WWW_MOBILE_URL ?>js/bootstrap.min.js"></script>
<script type="text/javascript" src="<?php echo WWW_MOBILE_URL ?>js/bootstrap-transition.js"></script>
<script type="text/javascript" src="<?php echo WWW_MOBILE_URL ?>js/bootstrap-collapse.js"></script>
<script type="text/javascript" src="<?php echo WWW_MOBILE_URL ?>js/custom.js"></script>
<script>

    $(document).ready(function () {
        $('#btn-back-url').attr('href', backUrl);
    });

    var faqQuery = new Parse.Query('FAQ');
    var termQuery = new Parse.Query('Term');
    var aboutQuery = new Parse.Query('About');
    faqQuery.equalTo('countryCode', 'en');
    faqQuery.find({
        success: function (faqs) {
            faqContent = faqs[0].get('text');
            $('#faq-content p').text(faqContent);
        }
    })

</script>
</body>
</html>