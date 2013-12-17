require('cloud/app.js');
require('cloud/nicetips.js');
var _ = require('underscore.js');


// We include google places module
var googlePlaces = require('cloud/google_places.js');
googlePlaces.initialize('AIzaSyAjFHT51yR30a9iDjwFc0sy0N3QHefssBo');


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
		var resultArray = new Array();
		for (var i = 0; i < jsonResult.results.length; i++) {
			var placeItem = jsonResult.results[i];
			var placeName = placeItem.name;
			var placeResult = new Object();
			placeResult.name = placeName;
			placeResult.formatted_address = placeItem.formatted_address;
			if (placeItem.types.length > 0) {
				placeResult.placeType = placeItem.types[0];
			} else {
				placeItem.placeType = "restaurant";
			}
			placeResult.geometry = new Object();
			placeResult.geometry.location = new Object();
			placeResult.geometry.location.lat = placeItem.geometry.location.lat;
			placeResult.geometry.location.lng = placeItem.geometry.location.lng;
			placeResult.reference = placeItem.reference;
			placeResult.id = placeItem.id
			// Put the value into the array
			resultArray.push(placeResult);
		}
		// We have to decorate the JSON with local information (ref or people)
		response.success(resultArray);
	}
	// Define callback function for error
	var errorFunction =  function(httpResponse) {
		response.success(httpResponse.text);
	}
	// We read the input parameters
	googlePlaces.freeSearch(freeText, countryCode,successFunction, errorFunction);
});


/*
This is the free search by location
*/
Parse.Cloud.define("freeLocationSearch", function(request, response) {
	// Create a promise to mantain with other operations
	var requestPromise = Parse.Promise.as();
	requestPromise.then(function(){
		// We create the Promise to return 
		var successful = new Parse.Promise();
		// we use google search to esecute the query
		googlePlaces.locationSearch(request.params,
			function(httpResponse) {
				// In case of success we have the result of the query
				var jsonResult = JSON.parse(httpResponse.text);
				var resultArray = new Array();
				for (var i = 0; i < jsonResult.results.length; i++) {
					var placeItem = jsonResult.results[i];
					var placeName = placeItem.name;
					var placeResult = new Object();
					placeResult.name = placeName;
					placeResult.formatted_address = placeItem.formatted_address;
					if (placeResult.formatted_address == null) {
						placeResult.formatted_address = placeItem.vicinity;
					}
					if (placeItem.types.length > 0) {
						placeResult.placeType = placeItem.types[0];
					} else {
						placeItem.placeType = "restaurant";
					}
					placeResult.geometry = new Object();
					placeResult.geometry.location = new Object();
					placeResult.geometry.location.lat = placeItem.geometry.location.lat;
					placeResult.geometry.location.lng = placeItem.geometry.location.lng;
					placeResult.reference = placeItem.reference;
					placeResult.id = placeItem.id
					// Put the value into the array
					resultArray.push(placeResult);
				}
				// We have to decorate the JSON with local information (ref or people)
				response.success(resultArray); 
			},
			function(detailError){
				// We manage the error
				successful.reject(jsonResult);					return successful;			
			});
		return Parse.Promise.when(successful).then(function(placeDetailJson){
			response.success(placeDetailJson);
		}, function(detailErrorAgain){
			response.error(detailErrorAgain);
		});			
	});
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
		// We get the results
		var resultArray = jsonResult.results;
		// Here we have the bestPlaces for the current user. 
		for (var i = 0; i < resultArray.length; i++) {
			var placeItem = resultArray[i];
			var typesArray = placeItem.types;
			if (typesArray.length > 0) {
				placeItem.placeType = typesArray[0];
			}
		}
		// We have to decorate the JSON with local information (ref or people)
		response.success(resultArray); 
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
	// Create a promise to mantain with other operations
	var requestPromise = Parse.Promise.as();
	requestPromise.then(function(){
		// We create the Promise to return 
		var successful = new Parse.Promise();
		// we use google search to esecute the query
		googlePlaces.locationSearch(request.params,
			function(httpResponse) {
				// In case of success we have the result of the query
				var jsonResult = JSON.parse(httpResponse.text);
				// Now we have to add the list of preferred places to add to the jsonResult
				var currentUser = Parse.User.current();
				var prefsRelation = currentUser.relation("bestPlaces");
				var relationQuery = prefsRelation.query();
				relationQuery.find().then(function (bestPlaces) {
					// Here we have the preferred places for the current user
					console.log("MANAGE BESTPLACES " + bestPlaces.length);
					var prefsArray = new Array();
					for (var i = 0; i < bestPlaces.length; i++) {
						var prefItem = new Object();
						prefItem.id = bestPlaces[i].get("placeId");
						prefItem.name = bestPlaces[i].get("name");
						var types = new Array();
						types.push(bestPlaces[i].get("types"));
						prefItem.types = types;
						prefItem.reference = bestPlaces[i].get("googleReference");
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
					if (prefsArray.length > 0) {
						jsonResult.preferred = prefsArray;
					}
					// Now we have to manage the decoration with roles
					if (request.params.enhanced == "true") {
						// We create an associative array that has the placeId as a key
						// and the place data as value. The preferred place has the precedence
						// on the Google one
						var placeItems = new Array();
						// In this case we have to manage roles for the places
						// We create an array of all the placeId for both preferred and not places
						var placeIdArray = new Array();
						for (var i = 0; i < prefsArray.length; i++) {
							placeIdArray.push(prefsArray[i].id);
							placeItems[prefsArray[i].id] = prefsArray[i];
							console.log("PLACE PREFERITO CON ID " + prefsArray[i].id);
						}
						var newResults = new Array();
						for (var i = 0; i < jsonResult.results.length; i++) {
							// We check if the place is already present. If not we add to the
							// new Result. 
							var fromServerPlaceId = jsonResult.results[i].id;
							console.log("PLACE DA SERVER CON ID " + fromServerPlaceId);
							console.log("   KEY " + placeItems[fromServerPlaceId]);
							if (placeItems[fromServerPlaceId] == null) {
								console.log("   NON PRESENTE. LO AGGIUNGIAMO");
								// Place not present so we add it to the results
								newResults.push(jsonResult.results[i]);
								// Save reference and id
								placeIdArray.push(fromServerPlaceId);
								placeItems[fromServerPlaceId] = jsonResult.results[i];
							}
						}
						if (placeIdArray.length > 0) {
							jsonResult.results = newResults;
							// Now we have a set of ids and we found the roles for them
							var inQuery = new Parse.Query("PeopleRole");
							inQuery.containedIn("placeId", placeIdArray);
							inQuery.find().then(function (existingRoles) {
								// Here we have the list of the roles for the given places
								for (var i = 0; i < existingRoles.length; i++) { 
									// We check if is present the property 
									var roleItemPlaceId = existingRoles[i].get("placeId");
									var placeObj = placeItems[roleItemPlaceId];
									if (placeObj.prefsRoles == null) {
										placeObj.prefsRoles = new Array();
									}
									// We add the item to the prefRoles
									var roleItem = new Object();									roleItem.placeId = roleItemPlaceId;
									roleItem.peopleAvatar = existingRoles[i].get("roleAvatar");
									roleItem.peopleName = existingRoles[i].get("peopleName");
									placeObj.prefsRoles.push(roleItem);
								}
								successful.resolve(jsonResult);
								console.log("optLocationSearch() SUCCESS" + jsonResult);
								return successful;
							});
						} else {
							// In this case there is nothing to do so we return the result
							successful.resolve(jsonResult);							console.log("optLocationSearch() SUCCESS" + jsonResult);
							return successful;
						}
					} else {
						// We return the jsonResult with preferred if any
						successful.resolve(jsonResult);						console.log("optLocationSearch() SUCCESS" + jsonResult);
						return successful;
					}
				});	
			},
			function(detailError){
				// We manage the error
				successful.reject(jsonResult);					return successful;			
			});
		return Parse.Promise.when(successful).then(function(placeDetailJson){
			response.success(placeDetailJson);
		}, function(detailErrorAgain){
			response.error(detailErrorAgain);
		});			
	});
});



/*
	This function get the registered places nearby the user. The first are the preferred one
	and then the other places
*/
Parse.Cloud.define("getPlaces", function(request, response) {
	// We get the preferred places for the user
	var currentUser = Parse.User.current();
	// We initialise the array for all the result
	var resultArray = new Array();
	var resultMap = {};
	// We create the relation between the user and the place
	var prefsRelation = currentUser.relation("bestPlaces");
	var relationQuery = prefsRelation.query();
	relationQuery.find().then(function (bestPlaces) {
		if (bestPlaces.length == 0) {
			var successful = new Parse.Promise();
			successful.resolve(resultArray);
			return successful;
		}
		var promise = Parse.Promise.as();		
		// Here we have the bestPlaces for the current user. 
		_.each(bestPlaces, function(placeItem) {
			var placeName = placeItem.get("name");
			console.log("getPlaces() PLACE ITEM IS  " + placeName);
			var placeResult = new Object();
			resultArray.push(placeResult);
			resultMap[placeName] = placeResult;
			placeResult.name = placeName;
			placeResult.formatted_address = placeItem.get("formattedAddress");
			placeResult.placeType = placeItem.get("placeType");			
			placeResult.geometry = new Object();
			placeResult.geometry.location = new Object();
			placeResult.geometry.location.lat = placeItem.get("location").latitude;
			placeResult.geometry.location.lng = placeItem.get("location").longitude;			
			placeResult.reference = placeItem.get("googleReference");
			placeResult.city = placeItem.get("city");
			placeResult.country = placeItem.get("country");
			placeResult.zip = placeItem.get("zip");
			placeResult.streetNumber = placeItem.get("streetNumber");
			placeResult.streetName = placeItem.get("streetName");
			placeResult.phoneNumber = placeItem.get("phoneNumber");
			placeResult.webPage = placeItem.get("webPage");
			placeResult.id = placeItem.id
			console.log("getPlaces() PLACE IS " + placeName);
			promise = promise.then(function(){
				placeResult.prefsRoles = new Array();
				var roleContainer = placeResult.prefsRoles;
				var rolesRelations = placeItem.relation("roles");
				var rolesQuery = rolesRelations.query();
				return rolesQuery.find().then(function(placeRoles){
					console.log("getPlaces() ESISTONO RUOLI " + placeRoles);
					if (placeRoles.length == 0) {
						return Parse.Promise.as(resultArray);
					}
					var rolePromise = Parse.Promise.as();
					_.each(placeRoles, function(role) {
						rolePromise = rolePromise.then(function(){
							var roleObj = new Object();
							roleObj.id = role.id;
							roleObj.peopleName = role.get("peopleName");
							console.log("getPlaces() ESISTE RUOLO " + roleObj.peopleName + " FOR " + placeResult.name);							
							roleObj.roleAvatar = role.get("roleAvatar");							
							roleObj.placeName = role.get("placeName");
							roleObj.placeAddress = placeItem.get("formattedAddress");
							roleObj.placeId = role.get("placeId");
							roleObj.geometry = new Object();
							roleObj.geometry.location = new Object();
							roleObj.geometry.location.lat = placeItem.get("location").latitude;							
							roleObj.geometry.location.lng = placeItem.get("location").longitude;
							roleContainer.push(roleObj);
							var successful = new Parse.Promise();
							successful.resolve(resultArray);
							return successful;
						});	
					});
					return rolePromise;
				});	
			});
		});
		return promise;
	}).then(function(decoratedArray){
		response.success(decoratedArray);
	},function(detailErrorAgain){
		response.error(detailErrorAgain);
	});
});



// This is a function that accesses a GooglePlace service to get the detail of a place
Parse.Cloud.define("getPlaceDetail", function(request, response) {
	// We read parameters from the request
	var googleReference = request.params.reference;
	var countryCode = request.params.countryCode;
	console.log("getPlaceDetail() called for ref:" + googleReference + " and country:" + countryCode);
	var requestPromise = Parse.Promise.as();
	requestPromise.then(function (){
		var successful = new Parse.Promise();
		console.log("getPlaceDetail() AGAIN googleReference:" + googleReference + " and country:" + countryCode);
		googlePlaces.simplePlaceDetail(countryCode, googleReference, 
			function(httpResponse) {
				var jsonResult = JSON.parse(httpResponse.text);
				// We create the information we need for the detail
				var placeDetailData = new Object();
				console.log("getPlaceDetail() SUCCESS" + jsonResult);
				successful.resolve(jsonResult);					return successful;				
			}, function(detailError){
				// We manage the error
				successful.reject(jsonResult);					return successful;
			});	
			return Parse.Promise.when(successful).then(function(placeDetailJson){
				response.success(placeDetailJson);
			}, function(detailErrorAgain){
				response.error(detailErrorAgain);
			});
	});	
});


// This service is invoked when the user select a place from GooglePlace. In that case we
// have to check if the place is already into the DB and insert it if not. After that we
// have to add the preferred in the relation with the user.
// The parameters into the options object are these:
//
//	- placeId
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
			console.log("GETTING DETAIL RESULTS :" + results);
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
					newPlace.set("owner", Parse.User.current());
					newPlace.set("name", jsonResult.result.name);
					newPlace.set("placeId", placeId);
					newPlace.set("googleReference", googleReference);
					newPlace.set("placeType", placeType);
					newPlace.set("formattedAddress", jsonResult.result.formatted_address);
					// We add the phoneNumber if any
					newPlace.set("phoneNumber", jsonResult.result.international_phone_number);
					// We add the webpage if any
					newPlace.set("webPage", jsonResult.result.website);
					// We put the information about city and country if any
					var addressInfos = jsonResult.result.address_components;
					for (var j = 0; j < addressInfos.length; j++) {
						var addressItem = addressInfos[j];
						// We check the types
						var addressTypes = addressItem.types;
						for (var k = 0; k < addressTypes.length; k++) {
							var addType = addressTypes[k];
							if (addType == "street_number") {
								if (addressItem.short_name != null) {
									newPlace.set("streetNumber", addressItem.short_name);
								} else if (addressItem.short_name != null) {
									newPlace.set("streetNumber", addressItem.long_name);
								}
								continue;
							} else if (addType == "route") {
								if (addressItem.short_name != null) {
									newPlace.set("streetName", addressItem.short_name);
								} else if (addressItem.short_name != null) {
									newPlace.set("streetName", addressItem.long_name);
								}
								continue;
							} else if (addType == "locality") {
								if (addressItem.short_name != null) {
									newPlace.set("city", addressItem.short_name);
								} else if (addressItem.short_name != null) {
									newPlace.set("city", addressItem.long_name);								
								}
								continue;
							} else if (addType == "country") {
								if (addressItem.short_name != null) {									
									newPlace.set("country", addressItem.short_name);
								} else if (addressItem.short_name != null) {									
									newPlace.set("country", addressItem.long_name);								
								}
								continue;									
							} else if (addType == "postal_code") {
								if (addressItem.short_name != null) {									
									newPlace.set("zip", addressItem.short_name);
								} else if (addressItem.short_name != null) {									
									newPlace.set("zip", addressItem.long_name);								
								}
							}
						}
					}
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
			response.success("ERROR :" + error);			
		}
	});	
});

// This is a function that register a new people
Parse.Cloud.define("addNewPeople", function(request, response) {
	// We read the parameters 
	var placeId = request.params.placeId;
	var countryCode = request.params.userCountryCode;
	var peopleName = request.params.peopleName;
	var googleReference = request.params.reference;
	var peopleAvatarName = request.params.peopleAvatar;
	var placeType = request.params.placeType;	
	var voteValue = request.params.voteValue;	
	// This param is useful to force the insert of the role also if doubled
	var forced = request.params.forced;
	// We check for mandatory parameters
	if (placeId == null) {
		response.error("placeId is mandatory!");
		return;
	}
	if (peopleName == null) {
		response.error("peopleName is mandatory!");
		return;
	}		
	// We search for the place to add the role to
	console.log("CREATING ROLE FOR PLACE WITH ID: " + placeId);
	console.log("CREATING ROLE FOR PLACE WITH REFERENCE: " + googleReference);
	var query = new Parse.Query("Place");
	query.equalTo("objectId", placeId);
	query.find().then(function(places){
		var place = places[0];
		console.log("QUERY RESULT: " + place);
		// Here we should have the list of places for the given id (it should be just 1)
		if (!place) {
			console.log("NO EXISTING PLACE WITH ID: " + placeId);
			// Here we have to insert the Place and go ahead
			return createPromiseForDetail(countryCode, googleReference).then(function (result){
				// Into result we have the details of the place to insert to we have to insert them into DB
				console.log("WE CREATED PLACE ISTANCE FROM GOOGLE: " + result);
				// we have to save it. 
				var successful = new Parse.Promise();
				successful.resolve(result);
				return successful;	
			}).then(function (newCreatedPlace) {
				console.log("WE CREATED PLACE ISTANCE FROM GOOGLE  22: " + newCreatedPlace);
				return newCreatedPlace.save().then(function (persistedPlace) {
					console.log("WE PESISTED NEW PLACE: " + persistedPlace);
					// Create the association with the current user
					var currentUser = Parse.User.current();					
					// We create the relation between the user and the place
					console.log("CURRENT USER " + currentUser);
					var prefRelation = currentUser.relation("bestPlaces");
					console.log("CURRENT RELATION " + prefRelation);
					prefRelation.add(newCreatedPlace);
					console.log("CREATING RELATIONW WITH USER " + currentUser);
					return currentUser.save().then(function (updateUser) {
						console.log("RETURNING PLACE AGAIN");
						// We have to return the place
						var successful = new Parse.Promise();
						successful.resolve(newCreatedPlace);
						return successful;
					});
				});
			});			
		} else {
			// In this case we have to insert the new place and then go on
			console.log("YES!!! PLACE EXISTING WITH ID: " + placeId + " WITH NAME " + place.get("name"));
			var successful = new Parse.Promise();
			successful.resolve(place);
			return successful;
		}
	}).then(function (placeForRole){
		console.log("MANAGING PLACE FOR ROLE!!! ");
		// Here we have the place that we have to decorate ###
		var roleQuery = new Parse.Query("PeopleRole");
		var newPlaceId = placeForRole.id;
		roleQuery.equalTo("objectId", newPlaceId);
		return roleQuery.find().then(function (roleResults) {
			// In this case we don't return an error but we return a field that contains the
			// roles already present
			var conflictingRoles = new Array();
			for (var i = 0; i < roleResults.length; i++){
				if (roleResults[i].get("peopleName").toLowerCase() == peopleName.toLowerCase()) {
					var itemRole = new Object();
					itemRole.peopleName = roleResults[i].get("peopleName");
					itemRole.peopleAvatar = roleResults[i].get("roleAvatar");
					conflictingRoles.push(itemRole);
				}
			}
			// Now we have to check if to insert the new role or not using the force param
			if (forced || conflictingRoles.length == 0){
				// In this case there's no people with the same name so we have
				// to create the new People entity
				var newPeople = new Parse.Object("People");
				newPeople.set("peopleName", peopleName);
				newPeople.set("peopleAvatar", peopleAvatarName);
				newPeople.set("confirmed", false);
				newPeople.set("lowercasePeopleName", peopleName.toLowerCase());
				return newPeople.save().then(function (newPeopleAgain){
					// Here we have saved the newPeople because we have to force him
					// We have the new people we have to create the new role
					var newRole = new Parse.Object("PeopleRole");
					newRole.set("creator", Parse.User.current());
					newRole.set("peopleId", newPeopleAgain.id);
					newRole.set("people", newPeopleAgain);
					newRole.set("placeId", newPlaceId);
					newRole.set("place", placeForRole);
					newRole.set("placeRoleLocation", placeForRole.get("location"));
					newRole.set("placeName", placeForRole.get("name"));
					newRole.set("peopleName", peopleName);
					newRole.set("lowercasePeopleName", peopleName.toLowerCase());
					newRole.set("roleAvatar", peopleAvatarName);
					return newRole.save().then(function (newRoleAgain){
						// Here we have the new role so we have to create the new Vote
						var newVote = new Parse.Object("Vote");
						newVote.set("user", Parse.User.current());
						newVote.set("peopleId", newPeopleAgain.id);
						newVote.set("placeId", newPlaceId);
						newVote.set("roleId", newRoleAgain.id);
						console.log("NEW VOTE HAS ROLEID " + newRoleAgain.id);
						newVote.set("creator", Parse.User.current());
						newVote.set("value", voteValue);
						newVote.set("placeRoleLocation", placeForRole.get("location"));						
						return newVote.save().then(function(newVoteAgain) {
							// Here we add the new created role to the roles for the current
							// places
							var rolePlaceRelation = placeForRole.relation("roles");
							rolePlaceRelation.add(newRoleAgain);
							return placeForRole.save();
						});
					});				
				});
			} else {
				console.log("A SIMILAR ROLE IS PRESENT. WE RETURN ERROR");
				var conflictPromise = new Parse.Promise();
				conflictPromise.resolve({code: 201, existingRoles:conflictingRoles});
				return conflictPromise;
			}
		});
	}).then(function (placeToDecorate) {
		console.log("LAST VALUE" + placeToDecorate);
		return response.success(placeToDecorate);
		/*
		var successful = new Parse.Promise();
		successful.resolve(placeToDecorate);
		return successful;			
		*/
	}, function(error){
			response.error(error);
	});
});


// This is a function that creates a Promise that returns the information related
// to the detail of a Google Place. This returns a Promise for the Place with the
// details got from Google place
function createPromiseForDetail(countryCode, googleRererence) {
	var requestPromise = Parse.Promise.as();
	return requestPromise.then(function (){
		var successful = new Parse.Promise();
		googlePlaces.simplePlaceDetail(countryCode, googleRererence, 
			function(httpResponse){
				var jsonResult = JSON.parse(httpResponse.text);
				var newPlace = new Parse.Object("Place");
				newPlace.set("owner", Parse.User.current());
				newPlace.set("name", jsonResult.result.name);				newPlace.set("placeId", jsonResult.result.id);
				newPlace.set("googleReference", jsonResult.result.reference);
				var typesArray = jsonResult.result.types;
				if (typesArray.length > 0) {
					newPlace.set("placeType", typesArray[0]);
				}
				newPlace.set("formattedAddress", jsonResult.result.formatted_address);
				// We add the phoneNumber if any
				newPlace.set("phoneNumber", jsonResult.result.international_phone_number);
				// We add the webpage if any
				newPlace.set("webPage", jsonResult.result.website);
				// We create the object of type
				var latitude = jsonResult.result.geometry.location.lat;
				var longitude = jsonResult.result.geometry.location.lng;				var placeLocation = new Parse.GeoPoint(latitude, longitude);
				newPlace.set("location", placeLocation);
				// We put the information about city and country if any
				var addressInfos = jsonResult.result.address_components;
				for (var j = 0; j < addressInfos.length; j++) {
					var addressItem = addressInfos[j];
					// We check the types
					var addressTypes = addressItem.types;
					for (var k = 0; k < addressTypes.length; k++) {
						var addType = addressTypes[k];
						if (addType == "street_number") {
							if (addressItem.short_name != null) {
								newPlace.set("streetNumber", addressItem.short_name);
							} else if (addressItem.short_name != null) {
								newPlace.set("streetNumber", addressItem.long_name);
							}
							continue;
						} else if (addType == "route") {
							if (addressItem.short_name != null) {
								newPlace.set("streetName", addressItem.short_name);
							} else if (addressItem.short_name != null) {
								newPlace.set("streetName", addressItem.long_name);
							}
							continue;
						} else if (addType == "locality") {
							if (addressItem.short_name != null) {
								newPlace.set("city", addressItem.short_name);
							} else if (addressItem.short_name != null) {
								newPlace.set("city", addressItem.long_name);							}
							continue;
						} else if (addType == "country") {
							if (addressItem.short_name != null) {								newPlace.set("country", addressItem.short_name);
							} else if (addressItem.short_name != null) {								newPlace.set("country", addressItem.long_name);							}
							continue;									} else if (addType == "postal_code") {
							if (addressItem.short_name != null) {								newPlace.set("zip", addressItem.short_name);
							} else if (addressItem.short_name != null) {								newPlace.set("zip", addressItem.long_name);							}
						}
					}
				}	
				successful.resolve(newPlace);					return successful;
			}, function(detailError){
				// We manage the error
				successful.reject(jsonResult);					return successful;
			});	
			return Parse.Promise.when(successful);
	});
}


// This is a function that search for the people around the user lcoation
Parse.Cloud.define("findPeopleAround", function(request, response) {
	// We read the parameters 
	var countryCode = request.params.countryCode;
	var latitude = request.params.latitude;
	var longitude = request.params.longitude;
	var radius = request.params.radius;	
	var placeId = request.params.placeId;	
	// Calculate support data
	console.log("LATITUDE" + latitude);
	console.log("LONGITUDE" + longitude);
	console.log("RARIUS" + radius);
	var refPoint = new Parse.GeoPoint(latitude, longitude);
	var distInKm = radius / 1000;
	var query = new Parse.Query("PeopleRole");
	query.include("place");
	// If we have the placeId we don't use the locationFilter but the
	// placeId itself
	if (placeId != ""){
		query.equalTo("placeId", placeId);
	} else {
		query.withinKilometers("placeRoleLocation", refPoint, distInKm);
	}
	// We have to build the array to return
	var peopleArray = new Array();
	query.find().then(function (nearRoles) {
		for (var i = 0; i < nearRoles.length; i++) {
			var role = nearRoles[i];
			var roleObj = new Object();
			var rolePlace = role.get("place");
			if (rolePlace == null) {
				continue;
			}
			roleObj.id = role.id;
			roleObj.everageVote = role.get("everageVote");
			roleObj.peopleName = role.get("peopleName");
			roleObj.roleAvatar = role.get("roleAvatar");			
			roleObj.placeName = role.get("placeName");
			roleObj.placeId = role.get("placeId");
			roleObj.placeAddress =  rolePlace.get("formattedAddress");
			roleObj.geometry = new Object();
			roleObj.geometry.location = new Object();
			roleObj.geometry.location.lat = rolePlace.get("location").latitude;			
			roleObj.geometry.location.lng = rolePlace.get("location").longitude;
			peopleArray.push(roleObj);	
			// We add the information for the place
			roleObj.place = new Object();
			roleObj.place.name = rolePlace.get("name");
			roleObj.place.formatted_address = rolePlace.get("formattedAddress");
			roleObj.place.placeType = rolePlace.get("placeType");			
			roleObj.place.geometry = new Object();
			roleObj.place.geometry.location = new Object();
			roleObj.place.geometry.location.lat = rolePlace.get("location").latitude;
			roleObj.place.geometry.location.lng = rolePlace.get("location").longitude;			
			roleObj.place.reference = rolePlace.get("googleReference");
			roleObj.place.city = rolePlace.get("city");
			roleObj.place.country = rolePlace.get("country");
			roleObj.place.zip = rolePlace.get("zip");
			roleObj.place.streetNumber = rolePlace.get("streetNumber");
			roleObj.place.streetName = rolePlace.get("streetName");
			roleObj.place.phoneNumber = rolePlace.get("phoneNumber");
			roleObj.place.webPage = rolePlace.get("webPage");
			roleObj.place.id = rolePlace.id	;
		}
		response.success(peopleArray);
	}, function (findError) {
		response.error(findError.message);
	});
});

// This is a function that search people by name
Parse.Cloud.define("searchPeople", function(request, response) {
	// We read the parameters 
	var countryCode = request.params.countryCode;
	var peopleName = request.params.peopleName;
	// Calculate support data
	console.log("searchPeople() PEOPLE NAME" + peopleName);
	var query = new Parse.Query("PeopleRole");
	query.include("place");
	query.contains("lowercasePeopleName", peopleName.toLowerCase());
	query.find().then(function (matchingPeople){
		console.log("searchPeople() SUCCESS" + matchingPeople);
		var peopleArray = createArrayFromRoles(matchingPeople);
		// In this case the place of a people doesn't have the related roles.
		// We have to add them
		var promise = Parse.Promise.as();		
		// Here we have the bestPlaces for the current user. 
		_.each(peopleArray, function(roleItem) {
			promise = promise.then(function(){
				var query = new Parse.Query("PeopleRole");
				query.equalTo("placeId", roleItem.place.id);
				return query.find().then(function(otherRoles) {
					// We add the roles information to the place
					var roles = new Array();
					roleItem.place.prefsRoles = roles;
					for (var j = 0; j < otherRoles.length; j++) {
						var role = otherRoles[j];
						var roleObj = new Object();
						roleObj.id = role.id;
						roleObj.peopleName = role.get("peopleName");
						roleObj.roleAvatar = role.get("roleAvatar");
						roleObj.placeName = role.get("placeName");
						roleObj.placeAddress = roleItem.placeAddress;
						roleObj.placeId = role.get("placeId");
						roleObj.geometry = new Object();
						roleObj.geometry.location = new Object();
						roleObj.geometry.location.lat =  roleItem.place.geometry.location.lat;
						roleObj.geometry.location.lng = roleItem.place.geometry.location.lng;
						console.log("getPlaces() ESISTE RUOLO " + roleObj.peopleName + " FOR " + roleObj.placeName);
						roles.push(roleObj);
					}
					return Parse.Promise.as(peopleArray);
				});
			});
		});
		return promise;
	}).then(function(peopleArrayAgain){
		response.success(peopleArrayAgain);
	}, function (findError) {
		console.log("searchPeople() FAILED" + findError);
		response.error(findError.message);
	});
});


// This is the function that permits to vote an existing user.
Parse.Cloud.define("voteExistingPeople", function(request, response) {
	// We read the parameters 
	var countryCode = request.params.countryCode;
	var roleId = request.params.roleId;
	var peopleAvatar = request.params.peopleAvatarName;
	var voteValue = request.params.voteValue;
	console.log("voteExistingPeople() COUNTRY CODE" + countryCode);
	console.log("voteExistingPeople() ROLE ID" + roleId);
	console.log("voteExistingPeople() PEOPLE AVATAR" + peopleAvatar);
	console.log("voteExistingPeople() VOTE VALUE" + voteValue);
	// We get the role for the given id
	var query = new Parse.Query("PeopleRole");
	query.get(roleId).then(function(roleToVote){
		if (roleToVote == null) {
			console.log("voteExistingPeople() NO ROLE WITH ID" + roleId);
			response.error("No role with the given id ");
			return;
		}
		var placeForRole = roleToVote.get("place");
		// If present we create the Vote for the user
		var newVote = new Parse.Object("Vote");
		newVote.set("user", Parse.User.current());
		newVote.set("people", roleToVote.get("people"));
		newVote.set("peopleId", roleToVote.get("peopleId"));
		newVote.set("place", roleToVote.get("place"));
		newVote.set("placeId", roleToVote.get("placeId"));
		newVote.set("creator", Parse.User.current());
		newVote.set("value", voteValue);
		newVote.set("placeRoleLocation", placeForRole.get("location"));
		return newVote.save().then(function(newVote){
			response.success(newVote);			
		});
	}, function(getError) {
		response.error(getError.message);
	});
});

Parse.Cloud.beforeSave("Vote", function(request, response) {
	// We get the value for the placeId and attach the related place
	var placeId = request.object.get("placeId");
	var placeQuery = new Parse.Query("Place");
	placeQuery.include("people");
	console.log("START MANAGE VOTE");
	placeQuery.get(placeId).then(function(place){
		console.log("WE GET PLACE FOR ID " + placeId);
		if (place != null) {
			request.object.set("place", place);
			request.object.set("placeRoleLocation", place.get("location"));
			console.log("PLACE SET ");
		}
		var successful = new Parse.Promise();
		successful.resolve(request.object);
		return successful;
	}).then(function(obj){
		var roleId = request.object.get("roleId");
		var peopleQuery = new Parse.Query("PeopleRole");
		peopleQuery.include("people");
		console.log("WE GET ROLE FOR ID " + roleId);
		return peopleQuery.get(roleId).then(function(role){
			console.log("WE GOT ROLE FOR ID " + roleId);
			if (role != null) {
				request.object.set("peopleRole", role);
				var people = role.get("people");
				request.object.set("peopleId", people.id);
				request.object.set("people", people);
				console.log("PEOPLE SET ");
			}
			var successful = new Parse.Promise();
			successful.resolve(request.object);
			return successful;			
		});
	}).then(function(successObject){
		console.log("FINISHED OK ");
		response.success();
	}, function(errorObject){
		console.log("FINISHED ERROR " + errorObject.message);
		response.error();
	});
});


// This is invoked after the vote is saved. Here we want to update the everage for a
// given role
Parse.Cloud.afterSave("Vote", function(request) {
	// we get the roleId from the Vote
	var roleId = request.object.get("roleId");
	console.log("Calculating everage for role with id " + roleId);
	if (roleId != null) {
		console.log("Role found ");
		var query = new Parse.Query("Vote");
		query.equalTo("roleId", roleId);
		query.find().then(function(votes){
			console.log("Votes found ");
			var numVotes = 0;
			var total = 0.0;
			for (var i = 0; votes != null && i < votes.length; i++) {
				var voteValue = votes[i].get("value");
				if (voteValue != 0) {
					total = total + voteValue;
					numVotes++;
				}
			}
			console.log("We have " + numVotes + " valid votes");
			var everageVote = 0.0;
			if (numVotes > 0){
				everageVote = total / numVotes;
			}
			console.log("Everage is " + everageVote);
			// we save the value into the PeopleRole object
			var peopleRoleQuery = new Parse.Query("PeopleRole");
			peopleRoleQuery.get(roleId).then(function(role){
				if (role != null) {
					console.log("We got role ");
					role.set("everageVote", everageVote);
					role.save();
					console.log("We updated the role for everage " + everageVote);
				}
			});
		});
	}
});


// This is the function we use to add a Comment to a user. 
Parse.Cloud.define("addCommentToPeople", function(request, response) {
	// We read the parameters 
	var countryCode = request.params.countryCode;
	var roleId = request.params.roleId;
	var peopleAvatar = request.params.peopleAvatarName;
	var voteValue = request.params.voteValue;
	response.success({});
});




/*
	Thi sfunction take a roles from the DB and creates tha array for the app
*/
function createArrayFromRoles(roles){
	var rolesArray = new Array();
	for (var i = 0; i < roles.length; i++) {
		var role = roles[i];
		var roleObj = new Object();
		var rolePlace = role.get("place");
		if (rolePlace == null) {
			continue;
		}
		roleObj.id = role.id;
		roleObj.peopleName = role.get("peopleName");
		roleObj.roleAvatar = role.get("roleAvatar");		roleObj.placeName = role.get("placeName");
		roleObj.placeId = role.get("placeId");
		roleObj.everageVote = role.get("everageVote");
		roleObj.placeAddress =  rolePlace.get("formattedAddress");
		roleObj.geometry = new Object();
		roleObj.geometry.location = new Object();
		roleObj.geometry.location.lat = role.get("placeRoleLocation").latitude;		roleObj.geometry.location.lng = role.get("placeRoleLocation").longitude;
		// We add the information for the place
		roleObj.place = new Object();
		roleObj.place.name = rolePlace.get("name");
		roleObj.place.formatted_address = rolePlace.get("formattedAddress");
		roleObj.place.placeType = rolePlace.get("placeType");		roleObj.place.geometry = new Object();
		roleObj.place.geometry.location = new Object();
		roleObj.place.geometry.location.lat = roleObj.geometry.location.lat;
		roleObj.place.geometry.location.lng = role.get("placeRoleLocation").longitude;		roleObj.place.reference = rolePlace.get("googleReference");
		roleObj.place.city = rolePlace.get("city");
		roleObj.place.country = rolePlace.get("country");
		roleObj.place.zip = rolePlace.get("zip");
		roleObj.place.streetNumber = rolePlace.get("streetNumber");
		roleObj.place.streetName = rolePlace.get("streetName");
		roleObj.place.phoneNumber = rolePlace.get("phoneNumber");
		roleObj.place.webPage = rolePlace.get("webPage");
		roleObj.place.id = rolePlace.id	;
		rolesArray.push(roleObj);		
	}
	return rolesArray;
}

