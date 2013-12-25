<div class="search">
    <input type="text" placeholder="Search" id="keywords"/>
    <button><img src="<?php echo WWW_MOBILE_URL ?>images/search.png" id="search" /></button>
</div>
<div class="intro-logo"><img src="<?php echo WWW_MOBILE_URL ?>images/logo.png" alt=""></div>
<div class="loading"><?php echo t('Loading...')?></div>
<ul class="listindex place-nea" id="listPlace"></ul>

<script>
    function searchPlaces(position, distance){
        if(distance == null){
            distance = 10;
        }

        $('.loading').show();
        var userLocation;
        var coords = {latitude:1,longitude:-1};
        if(position.coords) {
            coords.latitude = position.coords.latitude;
            coords.longitude = position.coords.longitude;
        }

        userLocation = new Parse.GeoPoint({latitude: coords.latitude, longitude: coords.longitude});

        var query = new Parse.Query('Place');
        if($('#keywords').val() != ''){
            query.startsWith("name", $('#keywords').val());
        }
        query.descending("name");
        query.withinKilometers('location', userLocation, distance);

        query.limit(100);
        query.find({
            // get all places in system
            success: function(places) {
                $('#listPlace').html('');

                if(places.length == 0){
                    var html = '<li><?php echo t('There are no place found!') ?></li>';
                    $('#listPlace').append(html);
                }else{
                    //add to list
                    _.each(places, function(place){
                        var html = '<li><a href="<?php echo url('/place/view') ?>?id='+place.id+'">'+place.get('name')+' - <span>'+place.get('formattedAddress')+'</span></a></li>';
                        $('#listPlace').append(html);
                    })
                }
                $('.loading').hide();
            },
            error: function() {

            }
        });
    }

    $(document).ready(function(){
        $('#search').click(function() {
            if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(searchPlaces);
            } else {
                searchPlaces({coords : {latitude: 1, longitude : -1}}, 99999);
            }
        });
        $('#search').trigger('click');
    });

    backUrl = '<?php echo app()->createUrl('/site/index')?>'

</script>