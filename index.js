"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const { WebhookClient } = require('dialogflow-fulfillment');

const restService = express();

restService.use(bodyParser.json());
restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);



restService.post("/echo", function(req, res) {
  var speech =
    req.body.queryResult &&
    req.body.queryResult.parameters &&
    req.body.queryResult.parameters.echoText
      ? req.body.queryResult.parameters.echoText
      : "Seems like some problem. Speak again.";
  return res.json({
    fulfillmentText: speech,
	fulfillmentMessages: [
    {
      text: {
		text : [speech]
	  }
    }
  ],

    source: "webhook-echo-sample"
  });
});

function welcome (agent) {
    agent.add(`Welcome to Express.JS webhook!`);
}

function fallback (agent) {
    // console.info(`unknown -- ${agent.originalRequest}`);
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

function WebhookProcessing(req, res) {
    const agent = new WebhookClient({request: req, response: res});
    console.info(`agent set`);

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
// intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
    agent.handleRequest(intentMap);
}


// Webhook
restService.post('/test', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessing(req, res);
});

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
