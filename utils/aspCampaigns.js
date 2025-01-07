// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse, getAPICombinedResults} from './asp-api-helpers.js';

function translateKeys(keys, lookup) {
  return keys.split(',').map(key => lookup[key.toLowerCase()] || key).join(',');
}

  let templates = {
   textwrapping : "doc://alexa/apl/documents/home/cards/textWrapping",
   media :        "doc://alexa/apl/documents/home/cards/media", 
   rating :       "doc://alexa/apl/documents/home/cards/rating",
   foryourday :   "doc://alexa/apl/documents/home/cards/suggestedActions",
   onthisday :    "doc://alexa/apl/documents/home/cards/primePhoto",
   photocard :    "doc://alexa/apl/documents/home/cards/selectedPhoto"
  }
  
//create-campaign
export async function createCampaign(type="textwrapping", unitids, start, end, locale="en-US",
headerText="", primarytext="", secondaryText="", tertiaryText="", attributionText, hintText, callToActionButtonText, playbackEnabled= false,
ratingText, ratingNumber, backgroundImage= null, attributionImage = null, thumbnailImage,
actionType="SkillConnection", actionUri=null, actioninput=null, listHintTexts, listThumbnailImages = "") {

    let template = translateKeys(type, templates);
    
    const config = {
        method: 'post',
        url: '/v1/proactive/campaigns',
        data: {
            "targeting": {
                "type": "UNITS",
                "values": unitids.split(',').map(unitid => new Object({ "id": unitid }))
              },
              "scheduling": {
                "activationWindow": {
                  "start": start,
                  "end": end
                }
              },
              "suggestion": {
                "variants": [
                  {
                    "placement": {"channel": "HOME"},
                    "content": {
                      "values": [
                        {
                          "locale": locale,
                          "document": {
                            "type": "Link",
                            "src": template
                          },
                          "datasources": {}
                        }
                      ]
                    }
                  }
                ]
              }

        }
    };

    let datasources = {};
    switch (type) {
        case 'textwrapping': 
            datasources = {"displayText": {
            "headerText": (headerText || null),
            "primaryText": (primarytext || null),
            "secondaryText": (secondaryText || null),
            "hintText": (hintText || null),
            "tertiaryText": (tertiaryText || null),
            "callToActionButtonText": (callToActionButtonText || null),
            "playbackEnabled": playbackEnabled
          },
          "background": {
          },
          "attribution": {
            "attributionText": (attributionText || null)
          }};
          if (backgroundImage) {datasources.background.backgroundImageSource = backgroundImage;}
          if (attributionImage) {datasources.attribution.attributionImageSource = attributionImage;}
          break;
        case 'media':
            datasources = {"thumbnail": {
               
                },
                "displayText": {
                    "headerText": (headerText || null),
                    "primaryText": (primarytext || null),
                    "secondaryText": (secondaryText || null),
                    "tertiaryText": (tertiaryText || null),
                    "hintText": (hintText || null)
                },
                "background": {

                },
                "attribution": {
                    "attributionText": (attributionText || null),
                }
            };
            if (thumbnailImage) {datasources.thumbnail.thumbnailImageSource = thumbnailImage;}
            if (backgroundImage) {datasources.background.backgroundImageSource = backgroundImage;}
            if (attributionImage) {datasources.attribution.attributionImageSource = attributionImage;}
        break;
        case 'rating':
            datasources = {"displayText": {
                "headerText": (headerText || null),
                "ratingNumber": (ratingNumber || null),
                "ratingText": (ratingText || null),
                "primaryText": (primarytext || null),
                "hintText": (hintText || null)
                },
                "background": {
                },
                "thumbnail": {  
                }
            };
            if (thumbnailImage) {datasources.thumbnail.thumbnailImageSource = thumbnailImage;}
            if (backgroundImage) {datasources.background.backgroundImageSource = backgroundImage;}
          break;
          case 'foryourday':
            let listimages = listThumbnailImages.split(',');
            let listitems = listHintTexts.split(',').map((item, index) => {
                return {
                    "hintText": item,
                    "thumbnailSource": (listimages[index] || null)
                }
            });
            datasources = {"displayText": {
                "headerText": (headerText || null),
                "listItems": listitems,
                "action": {
                    "type": (actionType || null),
                    "uri": (actionUri || null),
                    "input": {}
                    }
                },
                "background": {}
            };
            
            break;
        case 'onthisday':
            datasources = {
                "displayText": {
                    "headerText": (headerText || null),
                    "hintText": (hintText || null),
                    "primaryText": (primarytext || null),
                    "action": {
                    "type": (actionType || null),
                    "uri": (actionUri || null),
                    "input": {}
                    },
                },
                "background": {}
            };
            if (backgroundImage) {datasources.background.backgroundImageSource = backgroundImage;}
        break;
        case 'photocard':
            datasources = {
                "displayText": {
                    "hintText": (hintText || null),
                    "primaryText": (primarytext || null),
                    "secondaryText": (secondaryText || null),
                    "action": {
                        "type": (actionType || null),
                        "uri": (actionUri || null),
                        "input": {} //actioninput not supported
                    },
                },
                "background": {}
            };
            if (backgroundImage) {datasources.background.backgroundImageSource = backgroundImage;}
        break;
    }

    config.data.suggestion.variants[0].content.values[0].datasources = datasources;        

    const data = await getAPIResponse(config);
    return data;
}

//list-campaigns
export async function listCampaigns() {
    const config = {
        method: 'get',
        url: `/v1/proactive/campaigns?maxResults=10`,
    };

    const data = await getAPICombinedResults(config);
    return data;
}

/* */
export async function queryCampaigns(query) {
     
    const config = {
        method: 'post',
        url: `/v1/proactive/campaigns/query`,
        data: { "query": JSON.parse(query) }
    };

    config.data["paginationContext"] = {};

    const data = await getAPICombinedResults(config);
    return data;
}


//get-campaign
export async function getCampaign(campaignId) {
    const config = {
        method: 'get',
        url: `/v1/proactive/campaigns/${campaignId}`,
    };

    const data = await getAPIResponse(config);
    return data;
}

//delete-campaign
export async function deleteCampaign(campaignId) {
    const config = {
        method: 'delete',
        url: `/v1/proactive/campaigns/${campaignId}`,
    };

    const data = await getAPIResponse(config);
    return data;
}




