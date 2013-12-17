<?php
/*@var $this WQickNav*/
/*@var $currentController string*/
?>
<ul class="tab-step">
    <li><a href="<?php echo url('/place/index', array('id' => $this->controller->placeId)) ?>" class="<?php echo $currentController == 'place' ? 'place-ac' : 'place' ?>"></a></li>
    <li><a href="<?php echo url('/team/index', array('id' => $this->controller->placeId)) ?>" class="<?php echo $currentController == 'team' ? 'myteam-ac' : 'myteam' ?>"></a></li>
    <li><a href="<?php echo url('/tips/index', array('id' => $this->controller->placeId)) ?>" class="<?php echo $currentController == 'tips' ? 'tips-ac' : 'tips' ?>"></a></li>
    <li><a href="<?php echo url('/vote/index', array('id' => $this->controller->placeId)) ?>" class="<?php echo $currentController == 'vote' ? 'vote-ac' : 'vote' ?>"></a></li>
</ul>