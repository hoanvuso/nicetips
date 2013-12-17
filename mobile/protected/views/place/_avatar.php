<div class="box-avatar">
    <?php if (isset($people->peopleAvatar)) : ?>
        <img src="<?php echo WWW_MOBILE_URL . 'images/avatar/' . 'ava_' . $people->peopleAvatar . '@2x' .'.png' ?>" />
    <?php elseif(isset($people->peoplePicture->url)) : ?>
        <img src="<?php echo $people->peoplePicture->url?>" />
    <?php else : ?>
        <img src="<?php echo WWW_MOBILE_URL ?>images/avatar.png" />
    <?php endif; ?>

    <?php echo $place->name ?>
    <h4><?php echo $people->peopleName ?></h4>
    <?php echo $place->formattedAddress ?>
</div>