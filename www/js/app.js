$(document).ready(function() {
    var faqQuery = new Parse.Query('FAQ');
    var termQuery = new Parse.Query('Term');
    var aboutQuery = new Parse.Query('About');
    faqQuery.equalTo('countryCode', lang);
    faqQuery.find({
        success: function(faqs) {
            faqContent = faqs[0].get('text');
            $('#faq-content p').text(faqContent);
        }
    });

    for (var i = 0; i < $('.breadcummb-items').length; i++) {
        $('.breadcummb-items').eq(i).addClass('inactive');
        $('.breadcummb-bullet-items').eq(i).addClass('inactive');

    }
    switch (controller) {

        case 'place':
            {
                $('.breadcummb-items').eq(0).addClass('active');
                $('.breadcummb-bullet-items').eq(0).addClass('active');
                $('#business-search').focus();
                break;
            }
        case 'team' :
            {
                $('.breadcummb-items').eq(1).addClass('active');
                $('.breadcummb-bullet-items').eq(1).addClass('active');
                break;
            }

        case 'tips':
            {
                $('.breadcummb-items').eq(2).addClass('active');
                $('.breadcummb-bullet-items').eq(2).addClass('active');
                break;

            }
        case 'vote' :
            {
                $('.breadcummb-items').eq(3).addClass('active');
                $('.breadcummb-bullet-items').eq(3).addClass('active');
                break;
            }
    }
});
$(document).on('change', '#place-select', function() {
    var placeId = $('#place-select option:selected').val();
    var redirectUrl;
    switch (controller) {

        case 'place':
            {
                redirectUrl = '/place/index?id=' + placeId;
                break;
            }
        case 'team' :
            {
                redirectUrl = '/team/ index?id=' + placeId;
                break;
            }

        case 'tips':
            {
                redirectUrl = '/tips/index?id=' + placeId;
                break;
            }

        case 'vote' :
            {
                redirectUrl = '/vote/index?id=' + placeId;
                break;
            }
    }

    window.location.href = redirectUrl;
});


/*
 @menu : change the place name
 */

$(document).on('click', '.change-lang', function() {

    $('#lang-dialog').dialog("open");
});

$(document).on('click', '.select-lang-btn', function() {
    $('#lang-form').submit();
});

$(document).on('click', '#faq-link', function() {

    $('#faq-dialog').dialog("open");
});


$(document).on('click', '#term-link', function() {

    $('#term-dialog').dialog("open");
});

$(document).on('click', '#about-link', function() {

    $('#about-dialog').dialog("open");
});

$(document).on('click', '#delete-place', function() {

    if (placeId != '') {
        var cf = confirm('Do you want to delete current place');
        if (cf) {
            var place = new Place();
            var placeView = new PlaceView({model: place});
            placeView.deletePlace(placeId);
        }
    } else {
        alert('No place to delete. Please select one');
    }

});
/*
 @redicrect to the place controller when select create new place
 */
$(document).on('change', '#place-select', function() {
    var select = $(this).find('option:selected').val();
    if (select == 'np') {
        window.location.href = '/place/index?id=np';
    }
});