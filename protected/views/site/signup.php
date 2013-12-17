<?php


?>

<?php
    echo CHtml::beginForm(app()->createUrl('/site/signup'))

?>

<div class="row">
    <?php echo CHtml::label('Email','email') ?>
    <?php echo CHtml::textField('email'); ?>
</div>
<div class="row">
    <?php echo CHtml::label('Surname','surname') ?>
    <?php echo CHtml::textField('surname'); ?>
</div>
<div class="row">
    <?php echo CHtml::label('Lastname','lastname') ?>
    <?php echo CHtml::textField('lastname'); ?>
</div>
<div class="row">
    <?php echo CHtml::label('Password','password') ?>
    <?php echo CHtml::passwordField('password'); ?>
</div>


<input type="button" value="Cancel">
<input type="submit" value="Register">

<?php
    echo CHtml::endForm();
?>