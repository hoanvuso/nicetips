var express = require('express');
var moment = require('moment');
var _ = require('underscore');

// This is a function that help save a people in parse
Parse.Cloud.define("addPeople", function (request, response) {
    // We read the parameters
    var placeId = request.params.placeId;
    var countryCode = request.params.userCountryCode;
    var peopleName = request.params.peopleName;
    var peopleAvatar = request.params.peopleAvatar;
    var voteValue = request.params.voteValue;
    var userId = request.params.userId;

    // objectId when people created. use for delete or edit people
    var createdPeopleObjectId;

    //payment infor
    var paymentAccount = request.params.paymentAccount;
    var paymentType = request.params.paymentType;

    // We check for mandatory parameters
    if (placeId == null) {
        response.error("placeId is mandatory!");
        return;
    }
    if (peopleName == null) {
        response.error("peopleName is mandatory!");
        return;
    }
    if (userId == null) {
        response.error('userId is mandotory');
        return;
    }
    if (paymentType == null) {
        paymentType = 'paypal';
    }

    //find user
    var userQuery = new Parse.Query('User');
    var creator = null;

    userQuery.equalTo('objectId', userId);
    //is owner exists?
    userQuery.find({
        success: function (users) {
            // Here we should have the place
            if (users.length == 0) {
                response.error("ERRORE: User id not present!");
                return;
            } else {
                creator = users[0];
            }
        },
        error: function () {
            response.error("ERRORE: User id not present!");
            return;
        }
    });

    // We check if the place is present and we get the reference to him
    var query = new Parse.Query("Place");
    //query.equalTo("placeId", placeId);
    query.equalTo("objectId", placeId);   // use object id instead
    query.find({
        success: function (places) {
            // Here we should have the place
            if (places.length == 0) {
                // There's not place with the given Id
                console.log("PLACE NOT FOUND ");
                response.error({
                    id: 123,
                    message: "Place not found"
                });
            } else {
                var selectedPlace = places[0];

                // we have to search if there is already a Role for this place
                // with the given name
                var roleQuery = new Parse.Query("PeopleRole");
                roleQuery.equalTo("placeId", placeId);
                roleQuery.find({
                    success: function (roleResults) {
                        // Here we have all the roles for the given place. We have to check if
                        // there are a role with the same name
                        var foundRole = false;
                        for (var i = 0; i < roleResults.length; i++) {
                            if (roleResults[i].get("peopleName").toLowerCase() == peopleName.toLowerCase()) {
                                foundRole = true;
                                break;
                            }
                        }
                        if (!foundRole) {
                            //NO ROLES YET. WE GO AHEAD"

                            //add new payment account to this account
                            var newPayment = new Parse.Object('PaymentAccount');
                            newPayment.set('accountType', paymentType);
                            newPayment.set('name', peopleName);
                            newPayment.set('accountName', paymentAccount);

                            newPayment.save({
                                success: function (newPaymentAgain) {

                                    // In this case there's no people with the same name so we have
                                    /// to create the new People entity
                                    var newPeople = new Parse.Object("People");
                                    newPeople.set("peopleName", peopleName);
                                    newPeople.set("peopleAvatar", peopleAvatar);
                                    newPeople.set("confirmed", false);
                                    //add payment to this account
                                    newPeople.set('paymentAccount', newPaymentAgain);

                                    newPeople.save({
                                        success: function (newPeopleAgain) {
                                            // We have the new people we have to create the new role
                                            createdPeopleObjectId = newPeopleAgain.id;
                                            var newRole = new Parse.Object("PeopleRole");
                                            newRole.set("creator", creator);
                                            newRole.set("peopleId", newPeopleAgain.id);
                                            newRole.set("people", newPeopleAgain);
                                            newRole.set("placeId", placeId);
                                            newRole.set("place", selectedPlace);
                                            newRole.set("peopleName", peopleName);
                                            newRole.set("roleAvatar", peopleAvatar);
                                            newRole.save({
                                                success: function (newRoleAgain) {
                                                    // Here we have the new role so we have to create the new Vote
                                                    var newVote = new Parse.Object("Vote");
                                                    newVote.set("user", creator);
                                                    newVote.set("people", newPeopleAgain);
                                                    newVote.set("peopleId", newPeopleAgain.id);
                                                    newVote.set("place", selectedPlace);
                                                    newVote.set("placeId", placeId);
                                                    newVote.set("creator", creator);
                                                    newVote.set("value", voteValue);
                                                    newVote.save({
                                                        success: function (newVoteAgain) {
                                                            //response.success({code: 200, vote: newVote});
                                                            response.success({code: 200, peopleObjectId: createdPeopleObjectId})
                                                        },
                                                        error: function (newVoteError) {
                                                            response.error({
                                                                id: 203,
                                                                message: "Unable to create new vote"
                                                            });
                                                        }
                                                    });
                                                },
                                                error: function (newRoleError) {
                                                    response.error({
                                                        id: 202,
                                                        message: "Unable to create new role"
                                                    });
                                                }
                                            });
                                        },
                                        error: function (newPeopleError) {
                                            response.error({
                                                id: 201,
                                                message: "Unable to create new people"
                                            });
                                        }
                                    });
                                },
                                error: function () {
                                }
                            });

                        } else {
                            console.log("A SIMILAR ROLE IS PRESENT");
                            // In this case we don't return an error but we return a field that contains the
                            // roles already present
                            var roles = new Array();
                            for (var i = 0; i < roleResults.length; i++) {
                                var role = new Object();
                                role.peopleName = roleResults[i].get("peopleName");
                                role.peopleAvatar = roleResults[i].get("peopleAvatar");
                                roles.push(role);
                            }
                            response.success({code: 201, existingRoles: roles});
                        }
                    },
                    error: function (roleError) {
                        response.error("Error accessing roles! " + roleError.message);
                    }
                });
            }
        },
        error: function () {
            response.error("ERRORE: Place with id " + placeId + " not present!");
        }
    });
});


// This is a function that help save a comment and rating on parse
Parse.Cloud.define("addVote", function (request, response) {
    // We read the parameters
    var peopleId = request.params.peopleId;
    var placeId = request.params.placeId;
    var comment = request.params.comment;
    var amount = request.params.amount;
    var rating = request.params.rating;
    var currency = request.params.currency;

    //owner ID ?
    var userId = request.params.user;

    //get location (placeRoleLocation)
    var voteLocation = new Parse.GeoPoint({
        latitude: parseFloat(request.params.lat),
        longitude: parseFloat(request.params.lon)
    });

    //check place id
    if (placeId == null) {
        response.error('Place not present');
        return;
    }

    var placeQuery = new Parse.Query('Place');
    selectedPlace = null;

    //we will find place id was exists?
    placeQuery.equalTo("objectId", placeId);
    placeQuery.find({
        success: function (places) {
            if (places.length == 0) {
                // There's not place with the given Id
                console.log("PLACE NOT FOUND ");
                response.error({
                    id: 123,
                    message: "Place not found"
                });
                return;
            } else {
                selectedPlace = places[0];


                //find the people id
                // We check if the place is present and we get the reference to him
                var peopleRoleQuery = new Parse.Query("PeopleRole");
                var peopleRole = null;

                peopleRoleQuery.equalTo("peopleId", peopleId);
                peopleRoleQuery.find({
                    success: function (peopleRoles) {
                        if (peopleRoles.length == 0) {
                            response.error('People not present');
                            return;
                        } else {
                            peopleRole = peopleRoles[0];

                            //add new vote
                            var newVote = new Parse.Object("Vote");
                            newVote.set("creator", peopleRole.get('creator'));
                            newVote.set('people', peopleRole.get('people'));
                            newVote.set('peopleId', peopleId);
                            newVote.set('place', selectedPlace);
                            newVote.set('placeId', placeId);
                            newVote.set('comment', comment);
                            newVote.set('amount', parseInt(amount));
                            newVote.set('currency', currency);
                            //newVote.set('peopleRoleLocation', voteLocation);
                            //star
                            newVote.set('value', parseInt(rating));

                            newVote.save({
                                success: function (newVoteAgain) {
                                    /*var q = Parse.Query('_User');
                                     q.get(userId, {
                                     success: function (user) {
                                     var relation = newVoteAgain.relation("user");
                                     relation.add(user);
                                     newVoteAgain.save(null, {
                                     success: function (finalVote) {
                                     response.success({
                                     code: 200,
                                     vote: finalVote
                                     });
                                     },
                                     error: function () {
                                     console.log('can not save the vote')
                                     }
                                     })

                                     }, error: function () {
                                     console.log('can not get user')
                                     }
                                     })

                                     */
                                    response.success();
                                },
                                error: function (item, error) {
                                    response.error({
                                        message: error.message
                                    });
                                }
                            });
                        }
                    },
                    error: function () {
                        response.error('Place ' + placeId + ' not present');
                        return;
                    }
                });
            }
        },
        error: function () {
            response.error('Place ' + placeId + ' not present');
            return;
        }
    });
});

/**
 * save a place
 * @param {type} response
 * @param {type} place if null we will create one (insert)
 * @param {type} creator
 * @param {type} defaultCurrency
 * @param {type} formattedAddress
 * @param {type} location
 * @param {type} name
 * @param {type} logo
 * @param {type} placeType
 * @returns {undefined}
 */
function _savePlace(response, place, creator, defaultCurrency, formattedAddress, location, name, logo, placeType, city, zip, country, category) {
    if (place == null) {
        place = new Parse.Object("Place");
    }
    console.log(location);
    //set values
    place.set('defaultCurrency', defaultCurrency);
    place.set('name', name);
    place.set('owner', creator);
    place.set('formattedAddress', formattedAddress);
    place.set('defaultCurrency', defaultCurrency);
    place.set('location', new Parse.GeoPoint({latitude: parseFloat(location[0]), longitude: parseFloat(location[1])}));
    place.set('zip', zip);
    place.set('city', city);
    place.set('country', country);
    place.set('category', category)
    place.set('logo', logo);
    place.set('placeType', placeType);
    //update of insert
    place.save(null, {
        success: function (newPlaceAgain) {
            response.success({code: 200, place: newPlaceAgain});

        },
        error: function (error) {
            response.error({
                message: error.message
            });

            return;
        }
    });
}

// This is a function that help save a new place or create one
Parse.Cloud.define("savePlace", function (request, response) {
    var userId = request.params.userId;
    var placeId = request.params.placeId;
    var defaultCurrency = request.params.defaultCurrency;
    var formattedAddress = request.params.formattedAddress;
    var location = request.params.location;
    var name = request.params.name;
    var logo = request.params.logo;
    var placeType = request.params.placeType; //category
    var country = request.params.country;
    var zip = request.params.zip;
    var city = request.params.city;
    var category = request.params.category;


    // We check for mandatory parameters or set default value
    //default currency
    if (defaultCurrency == null) {
        defaultCurrency = 'EUR';
    }

    if (userId == null) {
        response.error("userId is mandatory!");
        return;
    } else {
        //check user id
        var userQuery = new Parse.Query('User');
        userQuery.equalTo('objectId', userId);
        //is owner exists?
        userQuery.find({
            success: function (users) {
                var creator = null;

                // Here we should have the place
                if (users.length == 0) {
                    response.error("ERRORE: User id not present!");
                    return;
                } else {
                    creator = users[0];
                }

                //check place
                selectedPlace = null;
                if (placeId != null) {
                    var searchPlace = Parse.Object.extend("Place");
                    var query = new Parse.Query(searchPlace);
                    query.equalTo("objectId", placeId);
                    query.first({
                        success: function (object) {
                            selectedPlace = object;

                            _savePlace(response, selectedPlace, creator, defaultCurrency, formattedAddress, location, name, logo, placeType, city, zip, country, category);
                        },
                        error: function (error) {
                            response.error("ERRORE: Place Id not present!");
                            return;
                        }
                    });
                } else {
                    _savePlace(response, null, creator, defaultCurrency, formattedAddress, location, name, logo, placeType, city, zip, country, category);
                }

            },
            error: function () {
                response.error("ERRORE: User id not present!");
                return;
            }
        });
    }
});

/*
 @get people have placeId of userId. in PeopleRole
 */

Parse.Cloud.define("getPeople", function (request, response) {
    var placeId = request.params.placeId;
    var userId = request.params.userId;
    var User = new Parse.Object.extend('User');
    var user = new User;
    user.id = userId;
    var query = new Parse.Query('PeopleRole');
    query.equalTo('placeId', placeId);
    query.equalTo('creator', user);
    query.include('people');
    query.find({
        success: function (peopleRoles) {
            // continue search in People to get array of people

            var tmp = new Array();
            var results = new Array();
            for (var i = 0; i < peopleRoles.length; i++) {
                var id = peopleRoles[i].get('people').id;
                if (!_inArray(id, tmp)) {
                    tmp.push(id);
                    var t = peopleRoles[i].get('people');
                    var roles = _getPeopleRoles(id, peopleRoles);


                    var p = {  peopleName: t.get('peopleName'), department: roles, peopleRoleId: peopleRoles[i].id,
                        peopleEmail: t.get('peopleEmail'), peopleAvatar: t.get('peopleAvatar'), objectId: t.id};

                    results.push(p);
                }
            }
            response.success(results);
        },
        error: function () {
            response.error("ERRORE: User or place is not present");
            return;
        }
    })

});


Parse.Cloud.define("deletePeople", function (request, response) {
    var objectId = request.params.objectId;

    var query = new Parse.Query('People');
    query.include('paymentAccount');
    query.get(objectId, {
        success: function (people) {
            people.destroy({
                success: function (people) {
                    // delete in Peolerole
                    response.success();
                    // may be delete all vote of this user out of system


                },
                error: function (object, error) {
                    // The object was not retrieved successfully.
                    // error is a Parse.Error with an error code and description.
                }
            })
        }
    })

});

/*
 @event handler when people is deleted in parse. delete payment account too
 */

Parse.Cloud.afterDelete("People", function (request) {
    var query = new Parse.Query("PeopleRole");

    query.equalTo("people", request.object);
    query.find({
        success: function (peopleRoles) {
            var promiseArray = new Array();
            var promise = new Parse.Promise();


            var deleteRoles = function () {
                var j = 0;
                for (i = 0; i < peopleRoles.length; i++) {
                    peopleRoles[i].destroy({
                        success: function () {
                            j++;
                            if (j == peopleRoles.length - 1)
                                promise.resolve();
                        }
                    })
                }
                return promise;
            }
            promiseArray.push(deleteRoles());

            Parse.Promise.when(promiseArray).then(function (sd) {

                    var query2 = new Parse.Query("PaymentAccount");
                    var paymentAccount = request.object.get('paymentAccount');

                    query2.equalTo("objectId", paymentAccount.id);
                    query2.find({
                        success: function (paymentAccount) {
                            console.log(paymentAccount);
                            paymentAccount[0].destroy({
                                success: function () {

                                },
                                error: function (error) {
                                    console.error(error.message);
                                }
                            })
                        }
                    });
                }, function () {
                    console.log('error');
                }

            );
        },
        error: function (error) {
            console.error(error.message);
        }

    })
});

/*
 @edit people information
 *//*


 Parse.Cloud.define("editPeople", function (request, response) {
 var objectId = request.params.objectId;

 var peopleName = request.params.peopleName;
 var peopleAvatar = request.params.peopleAvatar;
 //  var voteValue = request.params.voteValue;


 var query = new Parse.Query('People');
 query.get(objectId, {
 success: function (people) {
 people.set('peopleName', peopleName);
 people.set('peopleAvatar', peopleAvatar);
 people.save(null, {
 success: function (peopleAgain) {
 response.success(peopleAgain);
 },
 error: function (error) {
 response.error(error.message);
 }
 })
 }
 })

 });
 */


/*
 @filter the current places list depend on range (km). return the places on that range
 */

Parse.Cloud.define("filterPlaceOnDistance", function (request, response) {
    var my_location = request.params.my_location;
    var distance = request.params.distance;

    var userLocation = new Parse.GeoPoint({latitude: my_location[0], longitude: my_location[1]});

    var query = new Parse.Query('Place');
    query.withinKilometers('location', userLocation, distance);
    query.find({
        // get all places in system
        success: function (places) {
            response.success(places);
        },
        error: function () {

        }
    })

});


Parse.Cloud.beforeSave("Place", function (request, response) {
    if (request.object.get("name")) {
        request.object.set("name", request.object.get("name").toLowerCase());
    }

    if (request.object.get("formattedAddress")) {
        request.object.set("formattedAddress", request.object.get("formattedAddress").toLowerCase());
    }
    response.success();
});


/*
 @save people on parse if people have objectId -> update people
 peopele don't have objectId -> create new people
 */

Parse.Cloud.define("savePeople", function (request, response) {


    var placeId = request.params.placeId;
    var countryCode = request.params.userCountryCode;
    var peopleName = request.params.peopleName;
    var peopleAvatar = request.params.peopleAvatar;
    var voteValue = request.params.voteValue;
    var userId = request.params.userId;
    var peopleRoles = request.params.department;
    var peopleEmail = request.params.peopleEmail;
    var objectId = '';
    if (request.params.objectId != '') {
        objectId = request.params.objectId;
    }

    // objectId when people created. use for delete or edit people
    var createdPeopleObjectId;

    //payment infor
    var paymentAccount = request.params.paymentAccount;
    var paymentType = request.params.paymentType;

    // We check for mandatory parameters
    if (placeId == null) {
        response.error("placeId is mandatory!");
        return;
    }
    if (peopleName == null) {
        response.error("peopleName is mandatory!");
        return;
    }
    if (userId == null) {
        response.error('userId is mandotory');
        return;
    }
    if (paymentType == null) {
        paymentType = 'paypal';
    }

    //find user
    var userQuery = new Parse.Query('User');
    var creator = null;

    userQuery.equalTo('objectId', userId);
    //is owner exists?
    userQuery.find({
        success: function (users) {
            // Here we should have the place
            if (users.length == 0) {
                response.error("ERRORE: User id not present!");
                return;
            } else {
                creator = users[0];

                // We check if the place is present and we get the reference to him
                var query = new Parse.Query("Place");
                //query.equalTo("placeId", placeId);
                query.equalTo("objectId", placeId);   // use object id instead
                query.find({
                    success: function (places) {
                        // Here we should have the place
                        if (places.length == 0) {
                            // There's not place with the given Id
                            console.log("PLACE NOT FOUND ");
                            response.error({
                                id: 123,
                                message: "Place not found"
                            });
                        } else {
                            var selectedPlace = places[0];

                            // we have to search if there is already a Role for this place
                            // with the given name
                            var roleQuery = new Parse.Query("PeopleRole");
                            roleQuery.include('people');
                            roleQuery.equalTo("placeId", placeId);
                            var samplePeople;
                            // have place here


                            roleQuery.find({
                                success: function (roleResults) {
                                    // Here we have all the roles for the given place. We have to check if
                                    // there are a role with the same name
                                    var foundRole = false;

                                    if (objectId != '') {  // objectId is people ID exist meaning update peoplerole
                                        for (var i = 0; i < roleResults.length; i++) {
                                            if (roleResults[i].get('people').id == objectId) {
                                                samplePeople = roleResults[i].get('people');
                                                foundRole = true;
                                                break;
                                            }
                                        }
                                    }

                                    if (!foundRole) {
                                        //NO ROLES YET. WE GO AHEAD" - create new mode

                                        //add new payment account to this account
                                        var newPayment = new Parse.Object('PaymentAccount');
                                        newPayment.set('accountType', paymentType);
                                        newPayment.set('name', peopleName);
                                        newPayment.set('accountName', paymentAccount);

                                        newPayment.save({

                                            success: function (newPaymentAgain) {

                                                // In this case there's no people with the same name so we have
                                                /// to create the new People entity
                                                var newPeople = new Parse.Object("People");
                                                newPeople.set("peopleName", peopleName);
                                                newPeople.set("peopleAvatar", peopleAvatar);
                                                newPeople.set("peopleEmail", peopleEmail);
                                                newPeople.set("confirmed", false);
                                                //add payment to this account
                                                newPeople.set('paymentAccount', newPaymentAgain);

                                                newPeople.save({
                                                    success: function (newPeopleAgain) {
                                                        // We have the new people we have to create the new role
                                                        createdPeopleObjectId = newPeopleAgain.id;
                                                        var createNewPeopleRole = function () {

                                                            var promise = new Parse.Promise();
                                                            var j = 0;
                                                            // creating role is depent on people roles
                                                            // if have more than 1 role create a record for each role
                                                            if (peopleRoles.length > 0) {
                                                                for (var i = 0; i < peopleRoles.length; i++) {

                                                                    var newRole = new Parse.Object("PeopleRole");
                                                                    newRole.set("creator", creator);
                                                                    newRole.set("peopleId", newPeopleAgain.id);
                                                                    newRole.set("people", newPeopleAgain);
                                                                    newRole.set("placeId", placeId);
                                                                    newRole.set("place", selectedPlace);
                                                                    newRole.set("peopleName", peopleName);
                                                                    newRole.set("roleAvatar", peopleAvatar);
                                                                    newRole.set("department", peopleRoles[i]);
                                                                    newRole.save({
                                                                        success: function (newRoleAgain) {
                                                                            // no need to create vote here
                                                                            j++;
                                                                            if (j == peopleRoles.length) {
                                                                                promise.resolve();
                                                                            }
                                                                        },
                                                                        error: function (newRoleError) {
                                                                            response.error({
                                                                                id: 202,
                                                                                message: "Unable to create new role"
                                                                            });
                                                                        }
                                                                    });


                                                                }
                                                            } else {
                                                                // otherwise we only create a new record
                                                                var newRole = new Parse.Object('PeopleRole');
                                                                newRole.set("creator", creator);
                                                                newRole.set("peopleId", newPeopleAgain.id);
                                                                newRole.set("people", newPeopleAgain);
                                                                newRole.set("placeId", placeId);
                                                                newRole.set("place", selectedPlace);
                                                                newRole.set("peopleName", peopleName);
                                                                newRole.set("roleAvatar", peopleAvatar);
                                                                newRole.save({
                                                                    success: function (newRoleAgain) {
                                                                        // no need to create vote here
                                                                        promise.resolve();
                                                                    },
                                                                    error: function (newRoleError) {
                                                                        response.error({
                                                                            id: 202,
                                                                            message: "Unable to create new role"
                                                                        });
                                                                    }
                                                                });

                                                            }
                                                            return promise;
                                                        }

                                                        Parse.Promise.when(createNewPeopleRole()).then(function () {
                                                            response.success(newPeopleAgain);
                                                        });
                                                    },
                                                    error: function (newPeopleError) {
                                                        response.error({
                                                            id: 201,
                                                            message: "Unable to create new people"
                                                        });
                                                    }
                                                });
                                            },
                                            error: function () {
                                                console.log('error');
                                            }
                                        });

                                        // peopleRole of this people is exist meaning that people is exist on People too
                                        // we need update or do something

                                    } else {
                                        console.log("A SIMILAR ROLE IS PRESENT");   // edit mode
                                        // In this case we don't return an error but we return a field that contains the
                                        // roles already present

                                        var deletedList = new Array();    // list use to delete role object
                                        var newList = new Array();        // list use to create new role object
                                        var oldList = new Array();        // list use to modify object
                                        var promiseArray = new Array();

                                        samplePeople.set("peopleName", peopleName);
                                        if (peopleAvatar != '')
                                            samplePeople.set("peopleAvatar", peopleAvatar);
                                        samplePeople.set("peopleEmail", peopleEmail);
                                        samplePeople.save({

                                            success: function (people) {

//                                                var query = new Parse.Query('PeopleRole');

                                                for (var i = 0; i < peopleRoles.length; i++) {
                                                    if (_inArrayDepartment(peopleRoles[i], roleResults)) {
                                                        oldList.push(peopleRoles[i]);
                                                        roleResults.splice(i, 1);
                                                    }
                                                }

                                                for (var i = 0; i < roleResults.length; i++) {
                                                    if (!_inArray(roleResults[i].get('department'), peopleRoles)) {
                                                        deletedList.push(roleResults[i]);
                                                    }
                                                }

                                                for (var i = 0; i < peopleRoles.length; i++) {
                                                    if (_inArray(peopleRoles[i], oldList)) {
                                                        peopleRoles.splice(i, 1)
                                                    }
                                                }

                                                newList = peopleRoles;   // a new list contain some department so we need to create peopleRole Objec

                                                // handle promise here
                                                console.log('3 list here');
                                                console.log(newList);   // department name
                                                console.log(oldList);   // department name
                                                console.log(deletedList);


                                                var createNewPeopleRole = function () {

                                                    var promise = new Parse.Promise();
                                                    var j = 0;
                                                    for (var i = 0; i < newList.length; i++) {

                                                        var newRole = new Parse.Object("PeopleRole");

                                                        newRole.set("creator", creator);
                                                        newRole.set("peopleId", people.id);
                                                        newRole.set("people", people);
                                                        newRole.set("placeId", placeId);
                                                        newRole.set("place", selectedPlace);
                                                        newRole.set("peopleName", peopleName);
                                                        newRole.set("roleAvatar", peopleAvatar);
                                                        newRole.set('department', newList[i]);
                                                        newRole.save({
                                                            success: function () {
                                                                j++;
                                                                if (j == newList.length - 1) {
                                                                    promise.resolve();
                                                                }
                                                            }
                                                        });

                                                    }

                                                    return promise;
                                                };

                                                // oldlist is people object role old. deparment may be unique

                                                var modifyPeopleRole = function () {
                                                    var promise = new Parse.Promise();
                                                    var j = 0;
                                                    for (var i = 0; i < oldList.length; i++) {

                                                        var oldPeople = new Parse.Query('People');
                                                        oldPeople.equalTo('department', oldList[i]);
                                                        oldPeople.first({
                                                            success: function (oldPeopleAgain) {
                                                                oldPeopleAgain.set("creator", creator);
                                                                oldPeopleAgain.set("peopleId", people.id);
                                                                oldPeopleAgain.set("people", people);
                                                                oldPeopleAgain.set("placeId", placeId);
                                                                oldPeopleAgain.set("place", selectedPlace);
                                                                oldPeopleAgain.set("peopleName", peopleName);
                                                                oldPeopleAgain.set("roleAvatar", peopleAvatar);
                                                                oldPeopleAgain.save(null, {
                                                                    success: function () {
                                                                        j++;
                                                                        if (j == oldList.length - 1) {
                                                                            promise.resolve();
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        });

                                                    }
                                                    return promise;
                                                };

                                                var deletePeopleRole = function () {
                                                    var promise = new Parse.Promise();
                                                    var j = 0;
                                                    for (var i = 0; i < deletedList.length; i++) {
                                                        deletedList[i].destroy({
                                                            success: function () {
                                                                j++;
                                                                if (j == deletedList.length - 1) {
                                                                    promise.resolve();
                                                                }
                                                            }
                                                        })
                                                    }
                                                    return promise;
                                                };


                                                promiseArray.push(createNewPeopleRole());
                                                promiseArray.push(modifyPeopleRole());
                                                promiseArray.push(deletePeopleRole());


                                                Parse.Promise.when(promiseArray).then(function () {
                                                    // success
                                                    response.success(people);
                                                });
                                                response.success(people);
                                            }
                                        })


                                    }
                                },
                                error: function (roleError) {
                                    response.error("Error accessing roles! " + roleError.message);
                                }
                            });
                        }
                    },
                    error: function () {
                        response.error("ERRORE: Place with id " + placeId + " not present!");
                    }
                });
            }

        },
        error: function () {
            response.error("ERRORE: User id not present!");
            return;
        }
    });

});

/*
 @function check item is in array or not
 */

function _inArray(item, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == item) {
            return true;
        }
    }
    return false;
}

/*
 @function check item is in array or not
 */

function _inArrayDepartment(item, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].get('department') == item) {
            return true;
        }
    }
    return false;
}


/*
 @get people role from people role list
 */

function _getPeopleRoles(peopleId, peopleRolesList) {
    var roles = new Array();
    for (var i = 0; i < peopleRolesList.length; i++) {
        if (peopleId == peopleRolesList[i].get('people').id) {
            roles.push(peopleRolesList[i].get('department'));
        }
    }
    return roles;
}

/*
 @get people account from a place
 */

Parse.Cloud.define("getPeopleAccount", function (request, response) {
    var placeId = request.params.placeId;
    var placeSelected;
    var query = new Parse.Query('Place');
    query.include('paymentAccount');  // payment account of place
    query.get(placeId, {
        success: function (place) {
            placeSelected = place;
            var query = new Parse.Query('PeopleRole');
            query.include('people');
            query.equalTo('place', place);

            query.find().then(function (peopleRoles) {
                var array = new Array();

                for (var i = 0; i < peopleRoles.length; i++) {
                    //find payment account
                    //find people
                    var paymentPointer = peopleRoles[i].get('people').get('paymentAccount');

                    //get payment account
                    if (paymentPointer) {
                        var paymentAccount = new Parse.Query('PaymentAccount');
                        paymentAccount.get(paymentPointer.id, {
                            success: function (repeatPaymentAccount) {
                                array.push(repeatPaymentAccount);

                                if (array.length == peopleRoles.length) {
                                    response.success(array);
                                }
                            },
                            error: function () {
                                if (array.length > 0) {
                                    response.success(array);
                                } else {
                                    // response error here
                                }

                            }
                        });
                    }
                }


            }, function () {
                // error case not find any people role. find the payment account depent on place id

                var placePaymentAccountPointer = placeSelected.get('paymentAccount');
                if (placePaymentAccountPointer) {
                    var query = new Parse.Query('PaymentAccount');
                    query.get(placePaymentAccountPointer.id, {
                        success: function (paymentAccountAgain) {
                            response.success(paymentAccountAgain);
                        },
                        error: function () {
                            response.error(null);
                        }
                    });
                }
            });

        },

        error: function () {
            console.log('error');
        }

    })


});