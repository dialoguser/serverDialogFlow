"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const { WebhookClient, Text, Card, Image, Suggestion, Payload } = require('dialogflow-fulfillment');

const restService = express();

restService.use(bodyParser.json());
restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const WELCOME_INTENT = "Default Welcome Intent"
const FALLBACK_INTENT= "Default Fallback Intent"
const NEED_QUOTE_INTENT = "NeedQuote"
const MAKE_SANDWICH_INTENT = "makeSandwich"
const HOT_SANDWICH = "hotSandwich"

const QUOTE_TYPE_ENTITY = "TypeOfQuote"


const wikipediaUrl = 'https://www.google.com/maps/search/?api=1&query=tours+france';
const wikipediaImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/15/Sandwiches_pour_cocktail.JPG';

//--------------------------------------------------------//

function sandwich(agent)
{
  const typeSandwich = agent.parameters["typeOfSandwich"].toLowerCase();
  const gotType = typeSandwich.length > 0;

  



  if (gotType){
    agent.add("you want a " + typeSandwich + " sandwich.");
    if (typeSandwich == "hot"){
      agent.add("What meat and condiments do you want :)?");
    }else if (typeSandwich == "cold"){
      agent.add("What ingredient do you want :)?");
    }

  }else{
    agent.add("Type please :)");
    agent.add(new Card({
      title: `Vibrating molecules`,
      imageUrl: wikipediaImageUrl,
      text: `Did you know that temperature is really just a measure of how fast molecules are vibrating around?! 😱`,
      buttonText: 'Temperature Wikipedia Page', 
      buttonUrl: wikipediaUrl
    })
  );
    agent.add(new Suggestion(`hot`));
    agent.add(new Suggestion(`cold`));
    agent.add(new Suggestion(`Cancel`));
  }

	
}

function Hot (agent){
  const meat = agent.parameters["meat"];
	const condiments = agent.parameters["condiments"];
  
  var context = agent.context.get("sandwichtypecontext");

  console.info("CONTEXT LIFE SPAN");
  console.info(context.lifespan);

	
	const gotMeat = meat.length > 0 ;
	const gotCondiments = condiments.length > 0;
	
	if(gotMeat && gotCondiments){
		agent.add(meat +" and " + condiments+" will be ready soon. Do you want a drink ?");
	} else if (!gotMeat && gotCondiments){
		agent.add("What meat do you want?");
	}else if (gotMeat && !gotCondiments){
		agent.add("What condiments do you want?");
	}else{
		agent.add("please specify what meat and condiments do you want.");
	}
}

//--------------------------------------------------------//



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
    

    const lang = agent.locale.toLowerCase();
    console.info(lang);

    if (lang.includes("fr"))
      agent.add(`Bonjour sur Express.JS webhook!`);
    else if (lang.includes("en"))
      agent.add(`Welcome to Express.JS webhook!`);

}

function fallback (agent) {
    // console.info(`unknown -- ${agent.originalRequest}`);
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}



function quote (agent) {
    
	const quote_type = agent.parameters[QUOTE_TYPE_ENTITY].toLowerCase();
	
	if (quote_type == "inspiration") 
    {
    	agent.add("Quote inspiration ")
    }else if (quote_type == "happiness") 
    {
    	agent.add("Quote happiness ")
    }else if (quote_type == "friendship") 
    {
    	agent.add("Quote friendship ")
    }else
  		agent.add("Quote :) ")
	
}

function WebhookProcessingQuote(req, res) {
    var agent = new WebhookClient({request: req, response: res});
    console.info(`agent set`);

    let intentMap = new Map();
    intentMap.set(WELCOME_INTENT, welcome);
    intentMap.set(FALLBACK_INTENT, fallback);
	intentMap.set(NEED_QUOTE_INTENT, quote);
    agent.handleRequest(intentMap);
}


// Webhook
restService.post('/quote', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessingQuote(req, res);
});

//-------------------------------------------------------------------------------------------------------//



function WebhookProcessingSandwich(req, res) {
    var agent = new WebhookClient({request: req, response: res});
    console.info(`agent set`);

    let intentMap = new Map();
    intentMap.set(WELCOME_INTENT, welcome);
    intentMap.set(FALLBACK_INTENT, fallback);
    intentMap.set(MAKE_SANDWICH_INTENT, sandwich);
    intentMap.set(HOT_SANDWICH, Hot);
    agent.handleRequest(intentMap);
}

// Webhook
restService.post('/sandwich', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessingSandwich(req, res);
});


restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
