// Google places module for goole places operations

var _freeSearchUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?';
var _locationSearchUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
//var _locationSearchUrl = 'https://maps.googleapis.com/maps/api/place/radarsearch/json?';



var _placeDetailUrl = 'https://maps.googleapis.com/maps/api/place/details/json?';
var _defaultCountryCode = 'uk';
var _privateKey;

// When we initialize the module we pass the privateKey to use
exports.initialize = function(privateKey) {
  _privateKey = privateKey;
};


exports.freeSearch = function(freeText, languageCode, callbackSuccess, callbackError) {
	if (!languageCode){
		languageCode = _defaultCountryCode;
	}
	// We create the Url for the google place free search
	var freeSearchUrl = _freeSearchUrl + 'key='+_privateKey+'&query='+encodeURIComponent(freeText)+'&sensor=false&language='+languageCode;
	console.log("FREE PLACE SEARCH URL:" + freeSearchUrl);
	Parse.Cloud.httpRequest({
  		url: freeSearchUrl,
		success: callbackSuccess,
		error: callbackError
	});

};

exports.similarPlacesSearch = function(freeText, languageCode, callbackSuccess, callbackError) {
	if (!languageCode){
		languageCode = _defaultCountryCode;
	}
	// We create the Url for the google place free search
	var freeSearchUrl = _freeSearchUrl + 'key='+_privateKey+'&query='+encodeURIComponent(freeText)+'&sensor=false&language='+languageCode;
	console.log("FREE PLACE SEARCH URL:" + freeSearchUrl);
	Parse.Cloud.httpRequest({
  		url: freeSearchUrl,
		success: callbackSuccess,
		error: callbackError
	});

};

exports.locationSearch = function(options, callbackSuccess, callbackError) {
	var languageCode = _defaultCountryCode;
	if (options.countryCode){
		languageCode = options.countryCode;
	}
	// Other options
	var latitude = options.latitude;
	var longitude = options.longitude;
	var radius = options.radius;
	if (!radius) {
		radius = 1000;
	}
	// We create the Url for the google place free search
	var locationSearchUrl = _locationSearchUrl + 'key='+_privateKey+'&sensor=false&language='+languageCode
						+ '&location='+latitude+','+longitude+'&radius='+radius+"&types=restaurant";
	console.log("LOCATION PLACE SEARCH URL:" + locationSearchUrl);
	Parse.Cloud.httpRequest({
  		url: locationSearchUrl,
		success: callbackSuccess,
		error: callbackError
	});

};

exports.placeDetail = function(options, callbackSuccess, callbackError) {
	var languageCode = _defaultCountryCode;
	if (!options.countryCode){
		languageCode = _defaultCountryCode;
	}
	console.log("PlLace Detail for languageCode " + languageCode );

	// Other options
	var googleReference = options.reference;
	console.log("Place Detail for googleReference " + googleReference );
	// We create the Url for the google place free search
	var placeDetailUrl = _placeDetailUrl + 'key='+_privateKey+'&sensor=true&language='+languageCode
						+ '&reference='+googleReference;
	console.log("DETAIL FOR PLACE URL:" + placeDetailUrl);
	Parse.Cloud.httpRequest({
  		url: placeDetailUrl,
		success: callbackSuccess,
		error: callbackError
	});
};

exports.testMethod = function(x, y) {
    return x+y;
};