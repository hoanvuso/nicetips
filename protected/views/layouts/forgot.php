<?php
/*@var $this Controller */
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title><?php echo h($this->pageTitle) ?></title>
    <link rel="stylesheet" type="text/css" href="<?php echo WWW_URL ?>css/bootstrap.css"/>
    <link rel="stylesheet" type="text/css" href="<?php echo WWW_URL ?>css/style.css"/>
    <link rel="stylesheet" type="text/css" href="<?php echo WWW_URL ?>css/custom.css"/>

</head>


<body>


<!--<div class="message-container">
    <div class="content">rwer</div>
</div>
-->
<div class="load" style="width: 80px; height: 80px; padding: 15px; position: absolute; z-index: 5000; display: none">
    <img src="<?php echo WWW_URL ?>/images/loading.gif"/>
</div>


<div class="container">
    <div class="top-bar">
        <div class="step">


            <div class="logo">
                <a href="<?php echo FRONT_SITE_URL ?>">
                    <img src="<?php echo WWW_URL ?>images/logo.png"/>
                </a>
            </div>
            <div class="line"></div>
        </div>
    </div>
    <!--top-bar-->

    <div class="title">
        <h2>NiceTips</h2>
    </div>
    <!--title-->

    <div class="content">
        <?php if (user()->hasFlash('error')) : ?>

            <div class="alert alert-error"><?php echo user()->getFlash('error') ?></div>

        <?php endif; ?>
        <?php if (user()->hasFlash('success')) : ?>

            <div class="alert alert-success"><?php echo user()->getFlash('success') ?></div>

        <?php endif; ?>
        <?php echo $content ?>
        <div class="footer">

            <p><?php echo t('Copyright 2013 - All rights reserved') ?>d</p>
        </div>

    </div>
    <!--content-->

</div>
<!--container-->


<link rel="stylesheet" href="<?php echo FRONT_SITE_URL ?>www/css/dropkick.css">
</body>
</html>