<?php
/*@var $this SiteController*/
?>

<ul class="listindex langage">
    <li><input type="hidden" value="en"><a href="<?php echo app()->createUrl('/site/lang',array('lang'=>'en')) ?>">English</a></li>
    <li><input type="hidden" value="fr"><a href="<?php echo app()->createUrl('/site/lang',array('lang'=>'fr')) ?>">French</a></li>
    <li><input type="hidden" value="de"><a href="<?php echo app()->createUrl('/site/lang',array('lang'=>'de')) ?>">German</a></li>
    <li><input type="hidden" value="it"><a href="<?php echo app()->createUrl('/site/lang',array('lang'=>'it')) ?>">Italian</a></li>
    <li><input type="hidden" value="sp"><a href="<?php echo app()->createUrl('/site/lang',array('lang'=>'sp')) ?>">Spanish</a></li>
</ul>

<script>
    var lang = '<?php echo $this->lang ?>';
    // select language from session
    $(document).ready(function () {
        // reset the radio button to
        $('.langage li').removeClass('active');
        _.each($('.langage li'), function (item) {
            if ($(item).find('input').val() == lang) {
                $(item).find('a').addClass('active');
                return;
            }

        })
    });

    backUrl = '<?php echo app()->createUrl('/site/index')?>';

</script>
