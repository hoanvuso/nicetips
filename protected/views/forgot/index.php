<?php
$this->breadcrumbs = array(
    t('Forgot password')
);
?>
<h3>Recovery password</h3>
<form method="post" class="form-horizontal">
    <div class="control-group">
        <label class="control-label"><?php echo t('Email') ?></label>
        <div class="controls">
            <input type="text" required="" name="email" value="<?php echo $email ?>" />
        </div>
    </div>
    <?php /*if (extension_loaded('gd')): */?><!--
        <div class="control-group">
            <label class="control-label">Verify Code</label>
            <div class="controls">
                <?php /*$this->widget('CCaptcha'); */?>
                <br/>
                <input type="text" name="captcha" required="" />

                <p class="help-block">Please enter the letters as they are shown in the image above.
                    <br/>Letters are not case-sensitive.</p>
            </div>
        </div>
    --><?php /*endif; */?>
    <div class="form-actions">
        <input type="submit" class="btn btn-primary" value="<?php echo t('Submit') ?>" />
    </div>
</form>