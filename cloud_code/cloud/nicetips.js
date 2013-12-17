var express = require('express');
var moment = require('moment');
var _ = require('underscore');


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
 *
 * @param {type} response
 * @param {type} place
 * @param {type} creator
 * @param {type} defaultCurrency
 * @param {type} formattedAddress
 * @param {type} location
 * @param {type} name
 * @param {type} logo
 * @param {type} placeType
 * @param {type} city
 * @param {type} zip
 * @param {type} country
 * @param {type} category
 * @param string placeId
 * @param string googleReference
 * @returns {undefined}
 */
function _savePlace(response, place, creator, defaultCurrency, formattedAddress, location, name, logo, placeType, city, zip, country, category, placeId, googleReference) {
    if (place == null) {
        place = new Parse.Object("Place");
    }

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
    place.set('category', category);
    place.set('logo', logo);
    place.set('placeType', placeType);
    place.set('placeId', placeId);
    place.set('googleReference', googleReference);

    //update of insert
    place.save(null, {
        success: function (newPlaceAgain) {
            // modify the place geo point in people Role also
            var query = new Parse.Query('PeopleRole');
            var placePointer = new Parse.Object('Place');
            placePointer.set('objectId',newPlaceAgain.id);
            query.equalTo('place', placePointer);
            query.find({
                success: function (peopleRoles) {
                    if (peopleRoles.length > 0) {
                        var _updatePeopleRoleGeoPoint = function (peopleRoles) {
                            var j = 0;
                            var promise = new Parse.Promise();
                            _.each(peopleRoles, function (item) {
                                item.set('placeRoleLocation', newPlaceAgain.get('location'));
                                item.save(
                                    {
                                        success: function () {
                                            if (j == peopleRoles.length - 1) {
                                                promise.resolve();
                                            }
                                            j++;
                                        }
                                    });

                            });
                            return promise;
                        };
                        Parse.Promise.when([_updatePeopleRoleGeoPoint(peopleRoles)]).then(function () {
                            response.success({code: 200, place: newPlaceAgain});
                        });

                    } else {
                        response.success({code: 200, place: newPlaceAgain});
                    }

                }
            })
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
    var objectId = request.params.objectId;
    var placeId = request.params.placeId;
    var googleReference = request.params.googleReference;
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
                //if place has already exists, we will overwrite it
                //otherwise, create a new place
                selectedPlace = null;
                if (objectId != null) {
                    var searchPlace = Parse.Object.extend("Place");
                    var query = new Parse.Query(searchPlace);
                    query.equalTo("objectId", objectId);
                    query.first({
                        success: function (object) {
                            selectedPlace = object;

                            _savePlace(response, selectedPlace, creator, defaultCurrency,
                                        formattedAddress, location, name, logo, placeType,
                                        city, zip, country, category, placeId, googleReference);
                        },
                        error: function (error) {
                            response.error("ERRORE: Place Id not present!");
                            return;
                        }
                    });
                } else {
                    _savePlace(response, null, creator, defaultCurrency, formattedAddress,
                            location, name, logo, placeType, city, zip, country, category,
                            placeId, googleReference);
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
    var placePointer = new Parse.Object('Place');
    placePointer.set('objectId',placeId);
    query.equalTo('place', placePointer);
    query.equalTo('creator', user);
    query.include('people');

    query.find({
        success: function (peopleRoles) {

            // continue search in People to get array of people
            results = new Array();
            // is the lenth of peopleRole contain real people
            roleLength = peopleRoles.length;
            if (peopleRoles.length > 0) {
                var getPeopleRoles = function () {
                    var promise = new Parse.Promise();
                    _.each(peopleRoles, function (peopleRole) {
                        if (peopleRole.get('people') != null) {
                            Parse.Promise.when([_getPeopleRoleDepartments(peopleRole)]).then(function (departments) {
                                var p = {
                                    people: peopleRole.get('people'),
                                    departments: departments,
                                    peopleRoleId: peopleRole.id
                                };

                                results.push(p);

                                if (results.length == roleLength) {
                                    promise.resolve(results);
                                }
                            });
                        } else {
                            roleLength--;
                        }

                    });
                    return promise;
                };
                Parse.Promise.when([getPeopleRoles()]).then(function (results) {
                    response.success(results);
                })
            } else {

                // no role found
                response.success(results);

            }
        },
        error: function () {
            response.error("ERRORE: User or place is not present");
            return;
        }
    })

});

/*
 delete people
 */

Parse.Cloud.define("deletePeople", function (request, response) {
    var objectId = request.params.objectId;
    var query = new Parse.Query('People');
    query.get(objectId, {
        success: function (people) {
            var j = 0;
            // find payment account
            var relation = people.relation('paymentAccount');
            relation.query().find().then(function (paymentAccounts) {
                    var length = paymentAccounts.length;
                    for (var i = 0; i < length; i++) {
                        paymentAccounts[i].destroy({
                            success: function () {
                                if (j == length - 1) {
                                    console.log('delete all paymentAccount successfully')

                                }
                                j++;
                            }
                        })
                    }


                }
            );
            // may be delete all vote of this user out of system
            people.destroy({
                success: function (people) {
                    response.success();
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

Parse.Cloud.afterDelete("People", function (request, response) {
    var query = new Parse.Query("PeopleRole");

    query.equalTo("people", request.object);
    query.first({
        success: function (peopleRole) {
            // delete the people role department first */

            _deleteAllDepartments(peopleRole).then(function () {
                peopleRole.destroy({
                    success: function () {
                        response.success();
                    }
                })
            });

        },
        error: function (error) {
            console.error(error.message);
        }

    })
});


Parse.Cloud.define('deletePlace', function (request, response) {
    var placeId = request.params.placeId;
    var query = new Parse.Query('Place');
    query.get(placeId, {
        success: function (place) {
            place.destroy({
                success: function () {
                    response.success({id: 200, message: 'delete successfully'});
                },
                error: function () {
                    console.log('error delete place');
                }
            })
        },
        error: function () {
            console.log('error can not find place');
        }

    })

});
/*
 @handler after delete place delete people role also
 */

Parse.Cloud.afterDelete('Place', function (request) {
    var query = new Parse.Query("PeopleRole");

    query.equalTo("place", request.object);
    query.find({
        success: function (peopleRoles) {
            var deletePeopleRoles = function () {
                var length = peopleRoles.length;
                var promise = Parse.Promise.as();
                _.each(peopleRoles, function (deleteItem) {
                    // For each item, extend the promise with a function to delete it.
                    promise = promise.then(function () {
                        // Return a promise that will be resolved when the delete is finished.
                        return deleteItem.destroy();
                    });
                });
                return promise;
            }
            Parse.Promise.when([deletePeopleRoles()]).then(function () {

            });

        },

        error: function (error) {
            console.error(error.message);
        }

    })
})


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
    var peoplePictureBase64 = request.params.peoplePictureBase64;
    var namePicture = request.params.namePicture;
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
                            var placePointer = new Parse.Object('Place');
                            placePointer.set('objectId',placeId);
                            roleQuery.equalTo("place", placePointer);
                            var sampleRole;
                            // have place here


                            roleQuery.find({
                                success: function (roleResults) {
                                    // Here we have all the roles for the given place. We have to check if
                                    // there are a role with the same name
                                    var foundRole = false;

                                    if (objectId != '') {  // objectId is people ID exist meaning update peoplerole
                                        for (var i = 0; i < roleResults.length; i++) {
                                            if (roleResults[i].get('people') != null) {
                                                if (roleResults[i].get('people').id == objectId) {
                                                    sampleRole = roleResults[i];
                                                    foundRole = true;
                                                    break;
                                                }
                                            }
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
                                                newPeople.set("peopleEmail", peopleEmail);
                                                newPeople.set("confirmed", false);
                                                newPeople.set("lowercasePeopleName", peopleName.toLowerCase());

                                                var relation = newPeople.relation('paymentAccount');
                                                relation.add(newPaymentAgain);

                                                //@TODO : make the function if is shorter
                                                if (peoplePictureBase64) {
                                                    var peoplePicture = new Parse.File(Math.round(Math.random() * 1000), {base64: peoplePictureBase64});
                                                    peoplePicture.save().then(function () {
                                                        newPeople.set("peoplePicture", peoplePicture);
                                                        newPeople.save(null, {
                                                            success: function (newPeopleAgain) {
                                                                // We have the new people we have to create the new role
                                                                createdPeopleObjectId = newPeopleAgain.id;
                                                                Parse.Promise.when(_createPeopleRoleDepartments(peopleRoles)).then(function (peopleRoleDepartments) {
                                                                    // create new people Role
                                                                    var peopleRole = new Parse.Object('PeopleRole');

                                                                    peopleRole.set("creator", creator);
                                                                    peopleRole.set("peopleId", newPeople.id);
                                                                    peopleRole.set("people", newPeople);
                                                                    peopleRole.set("placeId", selectedPlace.id);
                                                                    peopleRole.set("place", selectedPlace);
                                                                    peopleRole.set("peopleName", newPeople.get('peopleName'));
                                                                    peopleRole.set("lowercasePeopleName", newPeople.get('peopleName').toLowerCase());
                                                                    peopleRole.set("placeName", selectedPlace.get('name'));
                                                                    peopleRole.set("placeRoleLocation", selectedPlace.get('location'));
                                                                    peopleRole.set("placeAvatar", newPeopleAgain.get('peopleAvatar'));


                                                                    peopleRole.save({
                                                                        success: function (peopleRoleAgain) {
                                                                            if (peopleRoleDepartments.length > 0) {
                                                                                var relation = peopleRoleAgain.relation('department');
                                                                                relation.add(peopleRoleDepartments);

                                                                                peopleRoleAgain.save({
                                                                                    success: function () {
                                                                                        response.success({people: newPeopleAgain, departments: peopleRoleDepartments, df_peopleRole: peopleRoleAgain.id});
                                                                                    }
                                                                                })
                                                                            } else {
                                                                                // no department inserted
                                                                                response.success({people: newPeopleAgain, departments: [], df_peopleRole: peopleRoleAgain.id});
                                                                            }
                                                                        }
                                                                    });
                                                                });
                                                            },
                                                            error: function (newPeopleError) {
                                                                response.error({
                                                                    id: 201,
                                                                    message: "Unable to create new people",
                                                                    content: newPeopleError
                                                                });
                                                            }
                                                        });
                                                    });

                                                } else {

                                                    newPeople.save(null, {
                                                        success: function (newPeopleAgain) {
                                                            // We have the new people we have to create the new role
                                                            createdPeopleObjectId = newPeopleAgain.id;
                                                            Parse.Promise.when(_createPeopleRoleDepartments(peopleRoles)).then(function (peopleRoleDepartments) {
                                                                // create new people Role
                                                                var peopleRole = new Parse.Object('PeopleRole');

                                                                peopleRole.set("creator", creator);
                                                                peopleRole.set("peopleId", newPeople.id);
                                                                peopleRole.set("people", newPeople);
                                                                peopleRole.set("placeId", selectedPlace.id);
                                                                peopleRole.set("place", selectedPlace);
                                                                peopleRole.set("peopleName", newPeople.get('peopleName'));
                                                                peopleRole.set("lowercasePeopleName", newPeople.get('peopleName').toLowerCase());
                                                                peopleRole.set("placeName", selectedPlace.get('name'));
                                                                peopleRole.set("placeRoleLocation", selectedPlace.get('location'));
                                                                peopleRole.set("placeAvatar", newPeopleAgain.get('peopleAvatar'));

                                                                peopleRole.save({
                                                                    success: function (peopleRoleAgain) {
                                                                        if (peopleRoleDepartments.length > 0) {
                                                                            var relation = peopleRoleAgain.relation('department');
                                                                            relation.add(peopleRoleDepartments);

                                                                            peopleRoleAgain.save({
                                                                                success: function () {
                                                                                    response.success({people: newPeopleAgain, departments: peopleRoleDepartments, df_peopleRole: peopleRoleAgain.id});
                                                                                }
                                                                            })
                                                                        } else {
                                                                            // no department inserted
                                                                            response.success({people: newPeopleAgain, departments: [], df_peopleRole: peopleRoleAgain.id});
                                                                        }
                                                                    }
                                                                });
                                                            });
                                                        },
                                                        error: function (newPeopleError) {
                                                            response.error({
                                                                id: 201,
                                                                message: "Unable to create new people",
                                                                content: newPeopleError
                                                            });
                                                        }
                                                    });
                                                }

                                            },
                                            error: function () {
                                            }
                                        });

                                        // peopleRole of this people is exist meaning that people is exist on People too
                                        // we need update or do something

                                    } else {
                                        console.log("A SIMILAR ROLE IS PRESENT");   // edit mode
                                        // if the new update have departments
                                        // if (peopleRoles.length > 0) {
                                        var samplePeople = sampleRole.get('people');

                                        // modify people information
                                        samplePeople.set("peopleName", peopleName);
                                        samplePeople.set("lowercasePeopleName", peopleName.toLowerCase());
                                        if (peoplePictureBase64 != '') {
                                            var peoplePicture = new Parse.File(Math.round(Math.random() * 1000), {base64: peoplePictureBase64});
                                            samplePeople.set("peoplePicture", peoplePicture);
                                        }

                                        samplePeople.set("peopleEmail", peopleEmail);
                                        samplePeople.set("peopleAvatar", peopleAvatar);
                                        // modify payment account name

                                        var relation = samplePeople.relation('paymentAccount');
                                        relation.query().find({
                                            success: function (paymentAccounts) {
                                                var promise = Parse.Promise.as();
                                                _.each(paymentAccounts, function (item) {
                                                    promise = promise.then(function () {
                                                        item.set({name: peopleName});
                                                        return item.save();
                                                    });
                                                });
                                                return promise;
                                            }
                                        }).then(function () {

                                                // save people info
                                                samplePeople.save({
                                                    success: function (samplePeopleAgain) {
                                                        // modify people role information
                                                        sampleRole.set('peopleName', samplePeopleAgain.get('peopleName'));
                                                        sampleRole.set("lowercasePeopleName", samplePeopleAgain.get('peopleName').toLowerCase());
                                                        sampleRole.set("placeAvatar", samplePeopleAgain.get('peopleAvatar'));
                                                        sampleRole.set("placeName", selectedPlace.get('name'));
                                                        sampleRole.set("placeRoleLocation", selectedPlace.get('location'));
                                                        sampleRole.save({
                                                            success: function (sampleRoleAgain) {
                                                                // modify department information
                                                                // delete all department and renew
                                                                Parse.Promise.when([_deleteAllDepartments(sampleRoleAgain)]).then(function () {
                                                                    // save new department response.success({
                                                                    if (peopleRoles.length > 0) {
                                                                        Parse.Promise.when([ _createPeopleRoleDepartments(peopleRoles)]).then(function (departments) {
                                                                            // reset into the role relation
                                                                            var relation = sampleRoleAgain.relation('department');
                                                                            relation.add(departments);
                                                                            sampleRoleAgain.save({
                                                                                success: function (sampleRoleAgainAgain) {
                                                                                    // create return response
                                                                                    response.success({
                                                                                        people: sampleRoleAgainAgain.get('people'),
                                                                                        departments: departments,
                                                                                        peopleRoleId: sampleRoleAgainAgain.id
                                                                                    })
                                                                                }
                                                                            })
                                                                        })
                                                                    } else {
                                                                        response.success({
                                                                            people: sampleRoleAgain.get('people'),
                                                                            departments: [],
                                                                            peopleRoleId: sampleRoleAgain.id
                                                                        })

                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            });

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
            return i;
        }
    }
    return -1;
}


//get people role department of people role list
// return the array of the peopleRoleDepartment


function _getPeopleRoleDepartments(peopleRole) {
    var promise = new Parse.Promise();
    var relation = peopleRole.relation('department');
    relation.query().find({
        success: function (departments) {
            promise.resolve(departments);
        },
        error: function () {
            // resolve the result for error case. It will be filtered after
            promise.resolve([]);
        }

    });
    return promise;
}

// create new role departments list for new people role

function _createPeopleRoleDepartments(peopleRoles) {
    var promise = new Parse.Promise();
    var peopleRoleDepartments = new Array();
    if (peopleRoles.length > 0) {
        for (var i = 0; i < peopleRoles.length; i++) {
            var newRoleDepartment = new Parse.Object('PeopleRoleDepartment');
            newRoleDepartment.set('name', peopleRoles[i]);
            newRoleDepartment.set('description', '');
            newRoleDepartment.set('seasonalLabour', false);
            newRoleDepartment.set('isWorking', true);

            newRoleDepartment.save({
                success: function (newRoleDepartmentAgain) {
                    peopleRoleDepartments.push(newRoleDepartmentAgain);
                    if (peopleRoles.length == peopleRoleDepartments.length) {
                        // return array of people role departments
                        promise.resolve(peopleRoleDepartments);
                    }

                }
            })
        }
    } else {
        promise.resolve([]);
    }
    return promise;
}

// delete all departments of this people role

function _deleteAllDepartments(peopleRole) {
    // get deleted departments for delete
    var relation = peopleRole.relation('department');
    return relation.query().find({
        success: function (departments) {
            var promise = Parse.Promise.as();
            if (departments.length > 0) {

                _.each(departments, function (deleteItem) {
                    // For each item, extend the promise with a function to delete it.
                    promise = promise.then(function () {
                        // Return a promise that will be resolved when the delete is finished.
                        return deleteItem.destroy();
                    });

                })
            }
            return promise;
        }
    });
}