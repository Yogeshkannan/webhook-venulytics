const request = require('request');

exports.getVenueDetails = function(venueName, callback) {
  console.log("venueName-->", venueName)
    request.get(venueDetailsRequest(venueName), function (error, response, body) {
        //console.log("response-->", response)
        console.log("body-->", body)
        var d = JSON.parse(body);
        var result = d.venues;
        if (result.length > 0) {
            callback(result[0].id);
        } else {
            callback("ERROR");
        }
    })
}

function venueDetailsRequest(venueName) {
    var token = 'dGVzdCB0ZXN0OnRlc3RAZ21haWwuY29tOig4ODgpIDg4OC04ODg4';
    var apiUrl = 'http://dev.api.venuelytics.com/WebServices/rsapi/v1//venues/q?lat=&lng=&dist=20000&search=' + venueName;
    var options = {
        url: apiUrl,
        headers: {
            'Authorization': 'Anonymous ' + token
        }
    };
    console.log("Options-->", options)
    return options;
}

exports.getTableDetails = function(tableNumber, bookedVenueNumber, callback) {
    request.get(tableDetailsRequest(tableNumber, bookedVenueNumber), function (error, response, body) {
        var result = JSON.parse(body);
        if (result) {
            for (var i = 0; i < result.length; i++) {
                var element = result[i].elements;
                for (var j = 0; j < element.length; j++) {
                    if (tableNumber === element[j].name.toLowerCase()) {
                        callback(element[j].name, element[j].id);
                    }
                }
            }
        } else {
            callback("ERROR");
        }
    })
}

function tableDetailsRequest(tableNumber, bookedVenueNumber) {
    var token = "dGVzdCB0ZXN0OnRlc3RAZ21haWwuY29tOig4ODgpIDg4OC04ODg4";
    var options = {
        url: 'http://dev.api.venuelytics.com/WebServices/rsapi/v1/venuemap/' + bookedVenueNumber,
        headers: {
            'Authorization': 'Anonymous ' + token
        }
    };
    return options;
}

exports.orderConfirmation = function(bookedVenueNumber, bookedTableId, callback) {
    request.post(bookYourOrder(bookedVenueNumber, bookedTableId), function (error, response, body) {
        var result = JSON.parse(body);
        if (result) {
            callback(result);
        } else {
            callback("ERROR");
        }
    })
}

function bookYourOrder(bookedVenueNumber, bookedTableId) {
    var ENDPOINT = 'http://dev.api.venuelytics.com/WebServices/rsapi/v1/vas/';
    var token = "dGVzdCB0ZXN0OnRlc3RAZ21haWwuY29tOig4ODgpIDg4OC04ODg4";
    var options = {
        method: 'POST',
        uri: ENDPOINT + bookedVenueNumber + '/orders',
        body: JSON.stringify({
            "serviceType": "Bottle",
            "venueNumber": bookedVenueNumber,
            "reason": "Birthday Party",
            "contactNumber": "(888) 888-8888",
            "contactEmail": "test@gmail.com",
            "contactZipcode": "23987298",
            "noOfGuests": 2,
            "noOfMaleGuests": 0,
            "noOfFemaleGuests": 0,
            "budget": 0,
            "serviceInstructions": "none",
            "status": "REQUEST",
            "fulfillmentDate": Date.now(),
            "durationInMinutes": 0,
            "deliveryType": "Pickup",
            "order": {
                "venueNumber": bookedVenueNumber,
                "orderDate": Date.now(),
                "orderItems": [
                    {
                        "venueNumber": bookedVenueNumber,
                        "productId": bookedTableId,
                        "productType": "VenueMap",
                        "quantity": 5,
                        "name": "Table 10A"
                    }
                ]
            },
            "prebooking": false,
            "employeeName": "",
            "visitorName": "test test"
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Anonymous " + token
        }
    };
    return options;
}
