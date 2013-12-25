// We include google places module
var googlePlaces = require('cloud/google_places.js');
googlePlaces.initialize('AIzaSyAjFHT51yR30a9iDjwFc0sy0N3QHefssBo');

require('cloud/nicetips.js');

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {

  response.success("Hello world! " + googlePlaces.testMethod(3,4));
});


// This is a function that accesses a GooglePlace service to get the response from it
Parse.Cloud.define("freeSearch", function(request, response) {
    // We read parameter from the request
    var freeText = request.params.freeText;
    var countryCode = request.params.countryCode;
    // Define callback function for success
    var successFunction =  function(httpResponse) {
        // We parse the text as a JSON object
        var jsonResult = JSON.parse(httpResponse.text);
        // For each item in results we get the id and search for the same in local places
        var results = jsonResult.results;
        for (var i = 0; i < results.length; i++){
            // We get the current place. We search for the place if present into the
            // local DB
            console.log("CHECKING PLACE WITH ID :" + results[i].id);
        }
        // We have to decorate the JSON with local information (ref or people)
        response.success(jsonResult);
    }
    // Define callback function for error
    var errorFunction =  function(httpResponse) {
        response.success(httpResponse.text);
    }
    // We read the input parameters
    googlePlaces.freeSearch(freeText, countryCode,successFunction, errorFunction);

});

// This is a function that accesses a GooglePlace service to get the response from it
Parse.Cloud.define("similarPlacesSearch", function(request, response) {
    // We read parameter from the request
    var freeText = request.params.freeText;
    var countryCode = request.params.countryCode;
    // Define callback function for success
    var successFunction =  function(httpResponse) {
        // We parse the text as a JSON object
        var jsonResult = JSON.parse(httpResponse.text);
        // We have to decorate the JSON with local information (ref or people)
        response.success(jsonResult);
    }
    // Define callback function for error
    var errorFunction =  function(httpResponse) {
        response.success(httpResponse.text);
    }
    // We read the input parameters
    googlePlaces.freeSearch(freeText, countryCode,successFunction, errorFunction);

});

// This is a function that accesses a GooglePlace service to get the response from it
// Be careful with the parameter
//
// - enhanced
//
// If it's true it means that we have to add the preferred places to the response
//
Parse.Cloud.define("locationSearch", function(request, response) {
    // Define callback function for success
    var successFunction =  function(httpResponse) {
        // We parse the text as a JSON object
        var jsonResult = JSON.parse(httpResponse.text);
        if (request.params.enhanced == "true"){
            // For each item in results we get the id and search for the same in local places
            // We fetch the article who are preferred for the user and save them into a
            // prefs property
            var currentUser = Parse.User.current();
            if (!currentUser){
                // User not logged. We skip
                response.error("User not present!");
            }
            var prefsRelation = currentUser.relation("bestPlaces");
            // We query the prefsRelation
            console.log("PBEST PLACE RELATION IS " + prefsRelation);
            var relationQuery = prefsRelation.query();
            relationQuery.find({
                success: function (bestPlaces){
                    console.log("MANAGE BESTPLACES " + bestPlaces);
                    var prefsArray = new Array();
                    for (var i = 0; i < bestPlaces.length; i++){
                        var prefItem = new Object();
                        prefItem.id = bestPlaces[i].get("placeId");
                        prefItem.name = bestPlaces[i].get("name");
                        prefItem.placeType = bestPlaces[i].get("placeType");
                        prefItem.googleReference = bestPlaces[i].get("googleReference");
                        prefItem.formatted_address = bestPlaces[i].get("formattedAddress");
                        // Creating Geometry location
                        prefItem.geometry = new Object();
                        prefItem.geometry.location = new Object();
                        prefItem.geometry.location.lat = bestPlaces[i].get("location").latitude;
                        prefItem.geometry.location.lng = bestPlaces[i].get("location").longitude;
                        // We get the current place. We search for the place if present into the
                        // local DB
                        prefsArray.push(prefItem);
                    }
                    jsonResult.preferred = prefsArray;
                    console.log("DECORATING WITH USER PREFS ARRAY = " + prefsArray);
                    // We return the item
                    response.success(jsonResult);
                },
                error: function(bestPlacesError){
                    console.log("ERRORS IN QUERY" + bestPlacesError);
                    response.error(bestPlacesError);
                }
            });
        } else {
                console.log("NO USER PREFS INSERTED!!");
            // We return the response as it is
            response.success(jsonResult);
        }
    }
    // Define callback function for error
    var errorFunction =  function(httpResponse) {
        response.error(httpResponse.text);
    }
    // We read the input parameters
    googlePlaces.locationSearch(request.params,successFunction, errorFunction);

});


// This is a function that accesses a GooglePlace service to get the detail of a place
Parse.Cloud.define("getPlaceDetail", function(request, response) {
    // Define callback function for success
    var successFunction =  function(httpResponse) {
        // We parse the text as a JSON object
        var jsonResult = JSON.parse(httpResponse.text);
        // We have to decorate the JSON with local information (ref or people)
        response.success(jsonResult);
    }
    // Define callback function for error
    var errorFunction =  function(httpResponse) {
        response.success(httpResponse.text);
    }
    // We read the input parameters
    googlePlaces.placeDetail(request.params,successFunction, errorFunction);

});


// This service is invoked when the user select a place from GooglePlace. In that case we
// have to check if the place is already into the DB and insert it if not. After that we
// have to add the preferred in the relation with the user.
// The parameters into the options object are these:
//
//  - placeId
//  - reference
//  - languageCode
//  - placeType
//
Parse.Cloud.define("addAsPreferredForUser", function(request, response) {
    // We check if the place is already into our DB.
    var placeId = request.params.placeId;
    var googleReference = request.params.reference;
    var placeType = request.params.placeType;
    var query = new Parse.Query("Place");
    query.equalTo("placeId", placeId);
    query.find({
        success: function(results) {
            console.log("GETTING DETAIL RESULTS :" + results)
            // If the place is not present we have to insert it into the DB. We invoke
            // the detail for the place to get the main informations
            if (results.length == 0){
                console.log("PLACE WITH ID :" + placeId + " NOT PRESENT!!! ");
                var detailSuccessFunction =  function(httpResponse) {
                    // We parse the text as a JSON object
                    var jsonResult = JSON.parse(httpResponse.text);
                    // Now we have the information about the new place to insert. We execute
                    // an insert
                    var newPlace = new Parse.Object("Place");
                    newPlace.set("name", jsonResult.result.name);
                    newPlace.set("placeId", placeId);
                    newPlace.set("googleReference", googleReference);
                    newPlace.set("placeType", placeType);
                    newPlace.set("formattedAddress", jsonResult.result.formatted_address);
                    // We create the object of type
                    var latitude = jsonResult.result.geometry.location.lat;
                    var longitude = jsonResult.result.geometry.location.lng;
                    var placeLocation = new Parse.GeoPoint(latitude, longitude);
                    newPlace.set("location", placeLocation);
                    // We have to decorate the JSON with local information (ref or people)
                    // We save the place
                    newPlace.save({
                        success: function(newPlaceAgain) {
                            // We have the new entity so we get the objectId to create the relation for the
                            // user preferred
                            var currentUser = Parse.User.current();
                            // We create the relation between the user and the place
                            var prefRelation = currentUser.relation("bestPlaces");
                            prefRelation.add(newPlaceAgain);
                            currentUser.save({
                                success: function(saveObject){
                                    console.log("SUCCESS!!!");
                                },
                                error: function(errorObject){
                                    console.log("ERRORRRRR!!!");
                                }
                            });
                            response.success(newPlaceAgain);
                        },
                        error: function (error){
                            response.success("ERROR INSERTING NEWPLACE " + error.message);
                        }
                    });
                }
                // Define callback function for error
                var detailErrorFunction =  function(httpResponse) {
                    response.success(httpResponse.text);
                }
                googlePlaces.placeDetail(request.params, detailSuccessFunction, detailErrorFunction);
            } else {
                // The current place
                var newPlace = results[0];
                // The Place is already present so we just need to manage the relation with the user
                var currentUser = Parse.User.current();
                // We create the relation between the user and the place
                var prefRelation = currentUser.relation("bestPlaces");
                prefRelation.add(newPlace);
                currentUser.save();
                response.success(newPlace);
            }
        },
        error: function(object, error) {
            // error is an instance of Parse.Error.
            response.success("ERROR :" + error.message);
        }
    });
});

// This is a function that register a new people
Parse.Cloud.define("addNewPeople", function(request, response) {
    // We read the parameters
    var placeId = request.params.placeId;
    var countryCode = request.params.userCountryCode;
    var peopleName = request.params.peopleName;
    var peopleAvatarName = request.params.peopleAvatarName;
    var voteValue = request.params.voteValue;
    // We check for mandatory parameters
    if (placeId == null) {
        response.error("placeId is mandatory!");
        return;
    }
    if (peopleName == null) {
        response.error("peopleName is mandatory!");
        return;
    }
    
    // We check if the place is present and we get the reference to him
    var query = new Parse.Query("Place");
    query.equalTo("placeId", placeId);
    query.find({
        success: function(places) {
            // Here we should have the place
            if (places.length == 0) {
                // There's not place with the given Id
                console.log("PLACE NOT FOUND ");
                response.error({
                    id:123,
                    message:"Place not found"
                });
            } else {
                var selectedPlace = places[0];
                console.log("PLACE FOUND " + selectedPlace.get("name"));
                // we have to search if there is already a Role for this place
                // with the given name
                var roleQuery = new Parse.Query("PeopleRole");
                roleQuery.equalTo("placeId", placeId);
                roleQuery.find({
                    success: function(roleResults) {
                        // Here we have all the roles for the given place. We have to check if
                        // there are a role with the same name
                        var foundRole = false;
                        for (var i = 0; i < roleResults.length; i++) {
                            if (roleResults[i].get("peopleName").toLowerCase() == peopleName.toLowerCase()) {
                                foundRole = true;
                                break;
                            }
                        }
                        if (!foundRole){
                            console.log("NO ROLES YET. WE GO AHEAD");
                            // In this case there's no people with the same name so we have
                            /// to create the new People entity
                            var newPeople = new Parse.Object("People");
                            newPeople.set("peopleName", peopleName);
                            newPeople.set("peopleAvatar", peopleAvatarName);
                            newPeople.set("confirmed", false);
                            newPeople.save({
                                success: function(newPeopleAgain) {
                                    // We have the new people we have to create the new role
                                    var newRole = new Parse.Object("PeopleRole");
                                    newRole.set("creator", Parse.User.current());
                                    newRole.set("peopleId", newPeopleAgain.id);
                                    newRole.set("people", newPeopleAgain);
                                    newRole.set("placeId", placeId);
                                    newRole.set("place", selectedPlace);
                                    newRole.set("peopleName", peopleName);
                                    newRole.set("roleAvatar", peopleAvatarName);
                                    newRole.save({
                                        success: function(newRoleAgain) {
                                            // Here we have the new role so we have to create the new Vote
                                            var newVote = new Parse.Object("Vote");
                                            newVote.set("user", Parse.User.current());
                                            newVote.set("people", newPeopleAgain);
                                            newVote.set("peopleId", newPeopleAgain.id);
                                            newVote.set("place", selectedPlace);
                                            newVote.set("placeId", placeId);
                                            newVote.set("creator", Parse.User.current());
                                            newVote.set("value", voteValue);
                                            newVote.save({
                                                success: function(newVoteAgain) {
                                                    response.success({code: 200, vote:newVote});
                                                },
                                                error: function(newVoteError){
                                                    response.error({
                                                        id:203,
                                                        message:"Unable to create new vote"
                                                    });
                                                }
                                            });
                                        },
                                        error: function(newRoleError){
                                            response.error({
                                                id:202,
                                                message:"Unable to create new role"
                                            });
                                        }
                                    });
                                },
                                error: function(newPeopleError) {
                                    response.error({
                                        id:201,
                                        message:"Unable to create new people"
                                    });
                                }
                            });
                        } else {
                            console.log("A SIMILAR ROLE IS PRESENT");
                            // In this case we don't return an error but we return a field that contains the
                            // roles already present
                            var roles = new Array();
                            for (var i = 0; i < roleResults.length; i++){
                                var role = new Object();
                                role.peopleName = roleResults[i].get("peopleName");
                                role.peopleAvatar = roleResults[i].get("peopleAvatar");
                                roles.push(role);
                            }
                            response.success({code: 201, existingRoles:roles});
                        }
                    },
                    error: function(roleError) {
                        response.error("Error accessing roles! " + roleError.message);
                    }
                });
            }
        },
        error: function() {
            response.error("ERRORE: Place with id " + placeId + " not present!");
        }
    });
});
