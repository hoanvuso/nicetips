$(document).ready(function(){
    $('#vote-form').submit(function(){
        if(!$('input[name=rating]').val()){
            $('#rating-message').show();
            return false;
        }else{
            if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function(position){
                    $('#lat').val(position.coords.latitude);
                    $('#lon').val(position.coords.longitude);
                });
            }else{
            }

            return true;
        }
        return false;
    });
});

