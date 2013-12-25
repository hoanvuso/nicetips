var PlaceView = Parse.View.extend({

    el: '#place-form',
    //tagName: 'table',

    _errors: {},

    dynamicMap: '#dialog_2',
    placeSearch: '#place-search',
    address: '#addesss',
    city: '#city',
    zip: '#zip',
    categories: '#categories',
    country: '#country',
    autocomplete: null,

    events: {
        'change #logo': 'loadThumbLogo',
        'click #google-map-btn': 'renderMap',
        'click #btn-submit': function () {
            this.collectForm();
            this.savePlace();
        },
        'click #print-leaflet': function () {
            if (placeId != '') {
                this.printLeaflet();
            }
        },
        'click #download-btn': 'leafletSubmit'
    },
    initialize: function () {
        var view = this;
        // init autocomplete here
        var defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(-33.8902, 151.1759),
            new google.maps.LatLng(-33.8474, 151.2631));

        var input = document.getElementById('business-search');
        var options = {
            bounds: defaultBounds,
            types: ['establishment']
        };
        this.autocomplete = new google.maps.places.Autocomplete(input);
        // init auto complete
        this.initGoogleMap(view);

        // use jQuery for download event
        $(document).on('click', '#download-btn', function () {
            view.leafletSubmit();
        });
        // use jQuery for copy location from google map to main location
        $(document).on('click', '#save-lat-lng', function () {
            view.copyLocation();
        });
    },

    /*
     this function use to init google map,addlistener to autocomplete textfield
     */
    initGoogleMap: function (view) {
        //
        var business_search_name = '';

        google.maps.event.addListener(this.autocomplete, 'place_changed', function () {
            var place = view.autocomplete.getPlace();
            // fill up the text value
            var address = place.name;

            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();
            var googleReference = place.reference;
            var placeId = place.id;

            var streetNumber = '';
            var route = '';

            $('#googleReference').val(googleReference);
            $('#placeId').val(placeId);
            $('#placeType').val(place.types[0]);

            //get city and state
            var city = place.address_components[0].long_name;
            for (var i = 0; i < place.address_components.length; i++) {
                for (var j = 0; j < place.address_components[i].types.length; j++) {

                    if (place.address_components[i].types[j] == "locality" || place.address_components[i].types[j] == "sublocality") {
                        business_search_name = place.address_components[i].long_name;
                        $('#business-search').val(business_search_name);
                    }
                    if (place.address_components[i].types[j] == "postal_code") {
                        zip_code = place.address_components[i].long_name;
                        $('#zip').val(zip_code);
                    }
                    if (place.address_components[i].types[j] == "administrative_area_level_2") {
                        city = place.address_components[i].long_name;
                        $('#city').val(city);
                    }
                    if (place.address_components[i].types[j] == "street_address") {
                        streetNumber = place.address_components[i].long_name;
                    }
                    //* if (place.address_components[i].types[j] == "route"){
                    route = place.address_components[i].long_name;
                }//*
                if (place.address_components[i].types[j] == "country") {
                    route = place.address_components[i].short_name;
                    //get and set country

                    var countryName = utils.getCountryNameFromIso(route);
                    if (countryName != null) {
                        //set the dropdown

                        $('#country').find("option").each(function () {
                            if ($(this).text() == countryName) {
                                $(this).prop("selected", "selected");
                                return;
                            }
                        });
                    }
                }
            }


            //combine address
            if (streetNumber != '' && route != '') {
                $('#address').val(streetNumber + ', ' + route);
            } else {
                $('#address').val(place.formatted_address);
            }

            //set lat lon
            $(view.placeSearch).val(lat + ',' + lng);

        });
    },

    /*
     @display the Google map on in modal
     */

    displayDynamicMap: function () {
        $(this.dynamicMap).dialog('open');
    },

    /**
     * render google map when user click on the right marker
     */
    renderMap: function () {
        var el = this;
        //we will show a dialog
        //then render map depends on lat lon
        //if lat lon was blank, we will set default is -33.8688, 151.2195
        this.displayDynamicMap();

        var defaultLatlon = new google.maps.LatLng(0, 0);
        //get the lat long
        var latlonStr = this.$('#place-search').val();
        if (latlonStr != '') {
            var latlonArr = latlonStr.split(',');
            if (latlonArr[0] != null && latlonArr[1] != null) {
                defaultLatlon = new google.maps.LatLng(parseFloat(latlonArr[0]), parseFloat(latlonArr[1]));

                //set this location to text field
                $('#lat-lng').val(parseFloat(latlonArr[0]) + ',' + parseFloat(latlonArr[1]));
            }
        }

        //set address on the text search field
        var addressArr = [];
        addressArr.push(el.$('#address').val());
        addressArr.push(el.$('#city').val());
        addressArr.push(el.$('#zip').val());
        addressArr.push(el.$('#country').val());
        $('#search-text').val(addressArr.join(', '));


        //render the map with lat lon above
        var mapOptions = {
            center: defaultLatlon,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById('google-dynamic-map'), mapOptions);

        //we also add marker to this map
        //marker can drag
        //when dragging marker, the latlon will be updated automatically
        var marker = new google.maps.Marker({
            position: defaultLatlon,
            map: map,
            draggable: true
        });
        //set drag event on this marker
        google.maps.event.addListener(marker, 'drag', function () {
            var lat = marker.position.lat();
            var lng = marker.position.lng();
            var coordinate = lat + ',' + lng;

            //update latlon to text field
            $('#lat-lng').val(coordinate);
        });


        //set place search event on the text search field
        //this event using google map autocomplete
        var input = document.getElementById('search-text');
        var autocomplete = new google.maps.places.Autocomplete(input);

        autocomplete.bindTo('bounds', map);

        var infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(autocomplete, 'place_changed', function () {

            // listening maker
            infowindow.close();
            marker.setVisible(false);
            input.className = '';
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                // Inform the user that the place was not found and return.
                input.className = 'notfound';
                return;
            }
            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(18);
            }
            marker.setIcon(/** @type {google.maps.Icon} */({
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));


            marker.setPosition(place.geometry.location);
            // set to lat lng textbox

            var lat = place.geometry.location.lb;
            var lng = place.geometry.location.mb;
            $('#lat-lng').val(lat + ',' + lng);
            marker.setVisible(true);

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }

            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
            infowindow.open(map, marker);
        });

        // order css or auto complete
        $($('.pac-container')[0]).css('z-index', 2000);
        $($('.pac-container')[1]).css('z-index', 4000);
    },

// get method for add data to model

    getAddress: function () {
        return  $('#address').val();
    },

    getCity: function () {
        return $('#city').val();
    },

    getCountry: function () {
        return $('#country option:selected').val();
    },

    getZip: function () {
        return $('#zip').val();
    },

    getName: function () {
        return $('#business-search').val();
    },

    getCategory: function () {
        return $('#cat option:selected').val();
    },

    getPlaceId : function(){
        return $('#placeId').val();
    },
    getGoogleReference : function(){
        return $('#googleReference').val();
    },
    getPlaceType : function(){
        return $('#placeType').val();
    },
    /*
     @return location in array(lat, lng)
     */

    getLocation: function () {
        var loc = $('#place-search').val();
        var pos = loc.search(',');
        var lat = loc.substr(0, pos);
        var lng = loc.substr(pos + 1, loc.length);

        return [lat, lng];
    },

    /*
     @copy location when user select from the Google map to main view
     */

    copyLocation: function () {
        if ($('#lat-lng').val() != '') {
            $('#place-search').val($('#lat-lng').val());
        }
    },

    /*
     @call model to save a place to parse
     */

    savePlace: function () {
        // save the picture first
        var view = this;
        if (this.checkValid()) {
            utils.showLoading();
            var fileUpload = $('#logo')[0];

            var canvas = $('<canvas>');
            var ctx;
            var image = new Image();

            if (fileUpload.files.length == 0) {
                // not upload
                var imageURL, image64, imageParseFile;
                if ($('#logo-thumb').attr('src') == defaultImage) {
                    // use default image
                    image.onload = function () {
                        canvas.attr('width','95');
                        canvas.attr('height','95');
                        ctx = canvas[0].getContext('2d');
                        ctx.drawImage(image, 0, 0);
                        imageURL = canvas[0].toDataURL();
                        // the position of the ','
                        position = imageURL.search(',');
                        image64 = imageURL.substring(position + 1);
                        imageParseFile = new Parse.File(Math.round(Math.random() * 1000), {base64: image64});

                        imageParseFile.save({
                            success: function (imageParseFileAgain) {
                                var url = imageParseFileAgain.url();
                                view.model.set({logo: url});
                                // call to add new place
                                view.model.save().done(function (resp) {
                                    // hide loading message
                                    utils.hideLoading();
                                    view.clearInputs();
                                    view.hideErrorMessages();
                                    window.location.href = indexUrl + '?id=' + resp.result.place.objectId;
                                });
                            }
                        })

                    }
                    image.src = defaultImage;
                } else {
                    // not upload image
                    var url = $('#logo-thumb').attr('src');

                    view.model.set({logo: url});
                    // call to add new place
                    view.model.save().done(function (resp) {
                        // hide loading message
                        utils.hideLoading();
                        view.clearInputs();
                        view.hideErrorMessages();
                        window.location.href = indexUrl + '?id=' + resp.result.place.objectId;
                    });
                }
            } else {

                image.onload = function() {
                    //set default value for canvas
                    canvas.attr('width', 250);
                    canvas.attr('height', 250);
                    if(image.width < 250) {
                        canvas.attr('width', image.width);
                    }
                    if(image.height < 250) {
                        canvas.attr('height', image.height);
                    }

                    ctx = canvas[0].getContext('2d');
                    ctx.drawImage(image, 0, 0);
                    var imageURL = canvas[0].toDataURL();
                    // the position of the ','
                    var position = imageURL.search(',');
                    var image64 = imageURL.substring(position + 1);
                    var imageParseFile = new Parse.File(Math.round(Math.random() * 1000), {base64: image64});

                    imageParseFile.save({
                        success: function (imageParseFileAgain) {
                            var url = imageParseFileAgain.url();
                            view.model.set({logo: url});
                            // call to add new place
                            view.model.save().done(function (resp) {
                                // hide loading message
                                utils.hideLoading();
                                view.clearInputs();
                                view.hideErrorMessages();
                                window.location.href = indexUrl + '?id=' + resp.result.place.objectId;
                            });
                        }
                    })

                }
                image.src = $('#logo-thumb').attr('src');
            }
        } else {
            this.showErrorMessages();
        }
    },

    /*
     * call the model to delete place
     */
    deletePlace: function (placeId) {
        utils.showLoading();
        this.model.delete(placeId).done(function () {
            utils.hideLoading();
            window.location.href = indexPlaceUrl;
        }, function () {
            utils.hideLoading();
        });
    },
    /*
     * @collect form information to setting model
     */
    collectForm: function () {

        this.model.set({
            name: this.getName(),
            country: this.getCountry(),
            address: this.getAddress(),
            zip: this.getZip(),
            location: this.getLocation(),
            city: this.getCity(),
            placeId: this.getPlaceId(),
            category: this.getCategory(),
            googleReference : this.getGoogleReference(),
            placeType : this.getPlaceType(),
            objId : this.model.id
        });
    },

    loadThumbLogo: function () {

        this.hideErrorMessages();
        var input = $('#logo')[0];
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {

                // set real picture for valid the image height, width
                if ($('#logo-thumb-real').attr('src') != '') {
                    $('#logo-thumb-real').css('width', '');
                    $('#logo-thumb-real').css('height', '');
                }

                $('#logo-thumb-real').attr('src', e.target.result);
                $('#logo-thumb').attr('src', e.target.result);

                // add error after user click Upload
                if (input.files.length > 0) {
                    var width = parseInt($('#logo-thumb-real').css('width').substr(0, $('#logo-thumb-real').css('width').search('p')));
                    var height = parseInt($('#logo-thumb-real').css('height').substr(0, $('#logo-thumb-real').css('height').search('p')));
                    if (width * height > 160000 || (input.files[0].size / 1024) > 500) {
                        $('#logo-error p').text('Image is too large. Please select smaller one');
                    }
                    switch (input.files[0].type) {
                        case 'image/png':
                        case 'image/jpeg':
                        case 'image/jpg':
                        {
                            break;
                        }
                        default :
                        {
                            $('#logo-error p').text('Image type is invalid');
                        }
                    }

                }

            };

            reader.readAsDataURL(input.files[0]);
        }
    },

    /*
     @update the Drop down list
     */
    updateDropDownList: function (item) {

        var opt_str = '<option value="' + item.objectId + '">' + item.name + '</option>';
        $('#place-select').append(opt_str);
    },

    /*
     @clear all input after user save the place,
     */

    clearInputs: function () {
        $('#business-search').val('');
        $('#address').val('');
        $('#city').val('');
        $('#zip').val('');
        $('#place-search').val('');
        $('#ava-thumb').attr('src', defaultImage);
    },

    /*
     display the error messages when user input wrong type
     */

    showErrorMessages: function () {

        if (this._errors.business_search) {
            $('#business-search-error p').text('Business search can not be blank');
        }
        if (this._errors.address) {
            $('#address-error p').text('Address can not be blank');
        }
        if (this._errors.city) {
            $('#city-error p').text('City can not be blank');
        }

        /* if (this._errors.zip) {
         $('#zip-error p').text('Zip  can not be blank');
         }*/

        if (this._errors.image_size) {
            $('#logo-error p').text('Image is too large. Please select smaller one');
        }

        if (this._errors.image_type) {
            $('#logo-error p').text('Image type is invalid.');
        }


        /* if (this._errors.place_search) {
         $('#place-search-error').text('Coordinate can not be blank');
         }*/
    },

    /*
     hide the error messages on view when user input wrong type
     */

    hideErrorMessages: function () {
        $('#business-search-error p').text('');
        $('#address-error').text('');
        $('#city-error').text('');
        //$('#zip-error').text('');
        /*$('#place-search-error').text('');*/
        $('#logo-error p').text('');
    },

    /*
     @submit the leaflet form to convert to pdf download
     */

    leafletSubmit: function () {
        var html = $('#leaflet-info').html();
        $('#html_string').val(html);
        $('#download-pdf-form').submit();

    },

    /*
     @print the leaflet of current place
     */

    printLeaflet: function () {
        $('#leaflet-dialog').dialog('open');
        this.showPlaceInformation();

    },

    /*
     @check the input value
     @return true or false
     */
    checkValid: function () {
        this._errors = {};
        // the bussiness-search name is not empty
        if ($('#business-search').val() == '') {
            this._errors.business_search = true;
        }
        // the addresss is not empty
        if ($('#address').val() == '') {
            this._errors.address = true;
        }

        // the city  is not empty
        if ($('#city').val() == '') {
            this._errors.city = true;
        }

        // check the image size
        var input;
        input = $('#logo')[0];

        if (input.files.length > 0) {
            var width = parseInt($('#logo-thumb-real').css('width').substr(0, $('#logo-thumb-real').css('width').search('p')));
            var height = parseInt($('#logo-thumb-real').css('height').substr(0, $('#logo-thumb-real').css('height').search('p')));
            if (width * height > 160000 || (input.files[0].size / 1024) > 500) {
                this._errors.image_size = true;
            }

            this._errors.image_type = true;
            switch (input.files[0].type) {
                case 'image/png':
                case 'image/jpeg':
                case 'image/jpg':
                    delete this._errors.image_type;

            }
        }

        return Object.keys(this._errors).length == 0;

    },

    /*
     @show the place information for leaflet review
     */

    showPlaceInformation: function () {


        var model = this.model;
        var avatar;
        if (model.get('avatar') != '')
            avatar = model.get('avatar');
        else
            avatar = defaultImage;

        // create content of leaflet
        var html_placeName = '<div id="leaflet_placename" style="text-align: center"><h2>' + placeName + '</h2></div>';
        var html_qrCode = '<div id="leaflet_qrcode"><img  style="float:left;margin-left:300px;height: 200px" src="' + qrCodeUrl + '"></div>';
        var html_leaflet = '';
        var html_header =
            '<div id="leaflet_place">' +
                '<table cellpadding="0" cellspacing="0" style="width:100%; border: 1px solid #ff0087; margin-bottom: 25px">';
        var html_footer = '</table></div>';
        var html_content =
                '<tr>' +
                    '<td style="width: 250px; text-align: center; padding: 7px;font-weight: bold">Avatar : </td>' +
                    '<td style="width: 440px; text-align: center;padding: 7px">' +
                    '<img alt="no-logo" width="80px" height="80px" src="' + avatar + '"></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="width: 250px; text-align: center;padding: 7px;font-weight: bold">Address : </td>' +
                    '<td style="width: 440px; text-align: center;padding: 7px">' + model.get('address') + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="width: 250px; text-align: center;padding: 7px;font-weight: bold">City : </td>' +
                    '<td style="width: 440px; text-align: center;padding: 7px">' + model.get('city') + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="width: 250px; text-align: center;padding: 7px;font-weight: bold">Zip : </td>' +
                    '<td style="width: 440px; text-align: center;padding: 7px">' + model.get('zip') + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="width: 250px; text-align: center;padding: 7px;font-weight: bold">Country : </td>' +
                    '<td style="width: 440px; text-align: center;padding: 7px">' + model.get('country') + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td style="width: 250px; text-align: center;padding: 7px;font-weight: bold";>Location : </td>' +
                    '<td style="width: 440px; text-align: center;padding: 7px;">' + model.get('location') + '</td>' +
                    '</tr>'
            ;

        html_leaflet = html_header + html_content + html_footer;
        // append to html dom
        $('#leaflet-info').html('');
        $('#leaflet-info').append(html_placeName);
        $('#leaflet-info').append(html_qrCode);
        $('#leaflet-info').append(html_leaflet);
    }
});
