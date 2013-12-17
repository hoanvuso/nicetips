<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo h($this->pageTitle) ?></title>
        <link rel="stylesheet" type="text/css" href="<?php echo WWW_URL ?>css/bootstrap.css" />
        <link rel="stylesheet" type="text/css" href="<?php echo WWW_URL ?>css/style.css" />
    </head>

    <body>

        <img src="<?php echo WWW_URL ?>images/bg-intro.jpg" class="img-intro" alt=""/>
        <div class="intro">
            <div class="intro-logo">
                <img src="<?php echo WWW_URL ?>images/logo.png" alt=""/>
            </div>
            <?php echo $content ?>
        </div>
    </body>
</html>