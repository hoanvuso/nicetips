<div class="box-team">
    <div class="title-team">
        <?php echo $place->name ?>
        <p><?php echo $place->city ?></p>
    </div>
    <div class="logo-team">
        <?php if (isset($place->logo)) : ?>

            <img src="<?php echo $place->logo ?>"/>

        <?php else : ?>

            <img src="<?php echo WWW_MOBILE_URL ?>images/logo-team.png"/>

        <?php endif; ?>
    </div>



    <?php foreach ($people as $department => $peopleRoles) : ?>

        <h3><?php echo $department ?></h3>

        <?php
        if (!is_array($peopleRoles)) {
            $peopleRoles = array($peopleRoles);
        }
        ?>

        <ul class="listindex place-nea the-taem">
            <?php foreach ($peopleRoles as $peopleRole) : ?>

                <li>
                    <a href="<?php echo url('/place/personal', array(
                        'peopleRoleId' => $peopleRole->objectId
                    )) ?>">
                        <?php if (isset($peopleRole->roleAvatar)) : ?>
                            <img src="<?php echo $peopleRole->roleAvatar ?>"
                                 alt="<?php echo $peopleRole->peopleName ?>"/>

                        <?php else : ?>
                            <?php if ($peopleRole->placeAvatar) : ?>
                                <img
                                    src="<?php echo WWW_MOBILE_URL . 'images/avatar/' . 'ava_' . $peopleRole->placeAvatar . '@2x.png' ?>"
                            <?php else : ?>
                                <img src="<?php echo WWW_MOBILE_URL ?>images/logo4.jpg"
                            <?php endif; ?>
                            alt="<?php echo $peopleRole->peopleName ?>"/>

                        <?php endif; ?>
                        <?php echo $peopleRole->peopleName ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>

    <?php endforeach; ?>
</div>