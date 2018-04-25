const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const moment = require('moment');

const bookingService = require('./service/bookingService');

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

server.post('/venulytics', (req, res) => {
    console.log("req", req)
    console.log("req.queryResult", req.result)
    //var token = "dGVzdCB0ZXN0OnRlc3RAZ21haWwuY29tOig4ODgpIDg4OC04ODg4";
    var intentName = req.result.metadata.intentName;
    console.log("intentName", intentName)
    var bookedVenueNumber, bookedTableId;

    if(intentName === 'UserProvidesVenueName') {
      var venueNameSlot = req.body.result.parameters.venueName;
      console.log("venueNameSlot", venueNameSlot)
      if(venueNameSlot) {
        const venueName = venueNameSlot;
        bookingService.getVenueDetails(venueName, function (venueNumber) {
          console.log("venueNumber", venueNumber)
            if (venueNumber != "ERROR") {
                bookedVenueNumber = venueNumber;
                var dataToSend = "To book a reservation in " + venueName + ", Please choose the table number";
                return res.json({
                    speech: dataToSend,
                    displayText: dataToSend,
                    source: 'venulytics'
                });
            } else {
                return res.json({
                    speech: "Invalid venue name",
                    displayText: "Invalid venue name",
                    source: 'venulytics'
                });
            }
        })
      } else {
        return res.json({
            speech: 'please, tell me the venue name',
            displayText: 'please, tell me the venue name',
            source: 'venulytics'
        });
      }
    } else if(intentName === 'UserProvidesTableName') {
      const tableNumberSlot = req.body.result.parameters.tableNumber;
      if (tableNumberSlot) {
          const tableNumber = tableNumberSlot;
          bookingService.getTableDetails(tableNumber, bookedVenueNumber, function (tableName, tableId) {
              var dataToSend;
              if (tableName.status != "ERROR") {
                  bookedTableId = tableId;
                  dataToSend = "Do you want to confirm?";
              } else {
                  dataToSend = "choosing table not available";
              }
              return res.json({
                  speech: dataToSend,
                  displayText: dataToSend,
                  source: 'venulytics'
              });
          })
      } else {
        return res.json({
            speech: 'please, tell me the table number',
            displayText: 'please, tell me the table number',
            source: 'venulytics'
        });
      }

    } else if(intentName === 'UserConfirms') {
      const confirmationSlot = req.body.result.parameters.yesOrNo;
      if(confirmationSlot) {
        const yesOrNo = ConfirmationSlot;
        if(yesOrNo === 'yes') {
          bookingService.orderConfirmation(bookedVenueNumber, bookedTableId, function (tableName) {
              var dataToSend;
              if ((tableName.status != 404) && (tableName.status != 500)) {
                  dataToSend = "Your " + tableName.order.orderItems[0].name + "is booked successfully!";
              } else {
                  dataToSend = "Sorry, your order is not booked";
              }
              return res.json({
                  speech: dataToSend,
                  displayText: dataToSend,
                  source: 'venulytics'
              });
          })
        } else {
          return res.json({
              speech: 'Thanks for your using our booking service',
              displayText: 'Thanks for your using our booking service',
              source: 'venulytics'
          });
        }
      } else {
        return res.json({
            speech: 'Please, confirm your order',
            displayText: 'Please, confirm your order',
            source: 'venulytics'
        });
      }
    } else {
        throw new Error('Invalid intent');
    }
});

server.listen((process.env.PORT || 8000), () => {
    console.log("Server is up and running...");
});
