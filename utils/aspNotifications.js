// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getBatchResults} from './asp-api-helpers.js';

/// Notifications API /////////////////////////////////////////////////

function translateKeys(keys, lookup) {
  return keys.split(',').map(key => lookup[key.toLowerCase()] || key).join(',');
}

//delete-all-notifications
export async function deleteAllNotifications(unitids, endpointids, type = "DeviceNotification") {
  
  let ids = [];
  let recipientType = "Unit";

  if (unitids) {
    ids = unitids.split(',');
  } else if (endpointids) {
    ids = endpointids.split(',');
    recipientType = "Endpoint";
  }

  const config = {
    method: 'post',
    url: '/v3/notifications/delete',
    headers: {
      'Accept': 'application/json'
    },
    data: {
      notificationTypes: type.split(',')
    }
  };

  const data = await getBatchResults(config, {type: recipientType}, undefined, ids, "recipients")

  return data;
}


// query-persistent-visual-alerts
export async function queryNotifications(unitids, endpointids, notificationType = "PersistentVisualAlert") {

  let ands = [];

  if (unitids) {
    unitids = unitids.split(',');
    ands.push({"or": unitids.map(unitid => ({"match": { "recipients.id": unitid}}))});
    ands.push({"match": {"recipients.type": "Unit"}});
  }
  else if (endpointids) {
    endpointids = endpointids.split(',');
    ands.push({"or": endpointids.map(endpointid => ({"match": { "recipients.id": endpointid}}))});
    ands.push({"match": {"recipients.type": "Endpoint"}});
  }

  ands.push ({"match": {"notification.variants.type": notificationType}});

  let query = { and: ands};

  const config = {
    method: 'post',
    url: '/v3/notifications/query',
    headers: {
      'Accept': 'application/json'
    },
    data: {query: query}
  };

  config.data.paginationContext = {"maxResults": 100};

  const data = await getAPIResponse(config);
  return data;
}


//send-notification
export async function sendNotification(unitids, endpointids, type="DeviceNotification", text, locale ="en-US", template="wrapping", 
                                        headerText="", primaryText="", secondaryText="", tertiaryText="", hintText="", attributionText="",ratingText="",rating="0",
                                        background,thumbnail,attributionImage, colorOverlay=true, dismissalTime, dismissalHours, dismissalMinutes,
                                        startTime, indicatorSound, interruptionLevel, restrictActions, optionListData,

                                        paragraphText = "",
                                        
                                        backgroundaction="Dismiss",
                                        backgroundactionurl,
                                        backgroundalign="CENTER",
                                        backgroundshape="ROUND", 
                                        
                                        thumbnailaction="Dismiss",
                                        thumbnailactionurl,
                                        thumbnailalign="LEFT", //"LEFT/RIGHT
                                        thumbnailshape="ROUND", //"ROUND/SQUARE",
                                        
                                        //actionbutton
                                        buttontext="Dismiss",
                                        buttonaction="Dismiss",
                                        buttonactionurl,               
                                      ) {






                                          
  if (dismissalHours || dismissalMinutes) {
    dismissalMinutes = (dismissalMinutes) ? dismissalMinutes : 0;
    if (dismissalHours) {
      dismissalMinutes += (dismissalHours * 60);
    }
    let date = new Date();
    date.setMinutes(date.getMinutes() + dismissalMinutes);
    dismissalTime = date.toISOString();
  }

  const templateLookup = {notification:"DeviceNotification",
    announcement:"Announcement",
    persistentalert:"PersistentVisualAlert",
    alert:"PersistentVisualAlert",
    pva:"PersistentVisualAlert"
  };

  let templates = {
    wrapping:"doc://alexa/apl/documents/enterprise/notifications/persistentvisualalert/textWrappingTemplate",
    media:"doc://alexa/apl/documents/enterprise/notifications/persistentvisualalert/mediaThumbnailTemplate",
    rating:"doc://alexa/apl/documents/enterprise/notifications/persistentvisualalert/ratingTemplate",
    optionlist: "doc://alexa/apl/documents/enterprise/notifications/persistentvisualalert/optionListTemplate",
    imagelist: "doc://alexa/apl/documents/enterprise/notifications/persistentvisualalert/imageListTemplate",
    buttonlist: "doc://alexa/apl/documents/enterprise/notifications/persistentvisualalert/buttonListTemplate"
  }

  let notificationType = translateKeys(type, templateLookup);

  let values = null;
  let contentType = null;
  
  switch (notificationType) {
    case 'DeviceNotification':
      values = [{"locale": locale,"text": text}];
      contentType = "SpokenText";
      break;
    case 'Announcement':
      values = [{"locale": locale,"text": text}];
      contentType = "SpokenText";
      break;
    case 'PersistentVisualAlert': {
      let datasources ={
          "displayText": {
              "primaryText": primaryText,
              "secondaryText": secondaryText
          },
          "background": {
              "backgroundImageSource": background,
              colorOverlay: colorOverlay
          }
          
      }

      switch (template) {
        case 'media':
          datasources = {
            "displayText": {
              "headerText": headerText,
              "primaryText": primaryText,
              "secondaryText": secondaryText,
              "tertiaryText": tertiaryText,
              "hintText": hintText
            },
            "background": {
              "backgroundImageSource": background,
              colorOverlay: colorOverlay
            },
            "thumbnail": {
              "thumbnailImageSource": thumbnail
            },
            "attribution": {
              "attributionText": attributionText,
              "attributionImageSource": attributionImage
            }
          }
          
          break;
        case 'rating':
          datasources = {
            "displayText": {
              "headerText": headerText,
              "primaryText": primaryText,
              "ratingText": ratingText,
              "ratingNumber": rating.toString(),
              "hintText": hintText
            },
            "thumbnail": {
              "thumbnailImageSource": thumbnail
            },
            "background": {
              "backgroundImageSource": background,
              colorOverlay: colorOverlay
            }
          }
          break;
          case 'optionlist':
            datasources = {
              "headerText": {"value": headerText},
              "primaryText":{"value":primaryText},
              "secondaryText":{"value":secondaryText},
              "hintText":{"value":hintText},
              optionList: JSON.parse(optionListData)
            }
            if (background) {datasources.backgroundImage = {
              "src": background,
              colorOverlay: colorOverlay
            };}
            if (attributionImage) {datasources.attributionImage = {
              "src": attributionImage
            };}
            if (thumbnail) {datasources.thumbnailImage = {
              "src": thumbnail
            };}
            break;
          case 'imagelist':
          case 'buttonlist':
            datasources = {
              "attributionText": {"value": attributionText},
              "primaryText":{"value":primaryText},
              "secondaryText":{"value":secondaryText},
              "paragraphText": {"value": paragraphText}, 
              "hintText":{"value":hintText}
            }

            if (template === 'buttonlist') {
              datasources.optionList = JSON.parse(optionListData);  
            }
            if (template === 'imagelist') { 
              datasources.imageList = JSON.parse(optionListData);
            }

            datasources.attributionText.actions = backgroundaction ? [{type:backgroundaction,url:backgroundactionurl}] : null;
            datasources.primaryText.actions = backgroundaction ? [{type:backgroundaction,url:backgroundactionurl}] : null;
            datasources.secondaryText.actions = backgroundaction ? [{type:backgroundaction,url:backgroundactionurl}] : null;
            datasources.hintText.actions = backgroundaction ? [{type:backgroundaction,url:backgroundactionurl}] : null;
            datasources.paragraphText.actions = backgroundaction ? [{type:backgroundaction,url:backgroundactionurl}] : null;

            if (background) {
              datasources.background = {
                "backgroundImageSource": background,
                "shape": backgroundshape,
                "alignment": backgroundalign,
                colorOverlay: colorOverlay
            };
            if (backgroundaction) {datasources.background.actions = [{type:backgroundaction,url:backgroundactionurl}];}
            }

            if (thumbnail) {
              datasources.thumbnailImage = {
                "src": thumbnail,
                "shape": thumbnailshape,
                "alignment": thumbnailalign,
              }
              if (thumbnailaction) {datasources.thumbnailImage.actions = [{type:thumbnailaction,url:thumbnailactionurl}];}
            }
          
            if (buttontext) {datasources.actionButton = {
                  "value": buttontext, 
                  "actions": [{type:buttonaction,url:buttonactionurl}] 
              };
            }

            break;
      }

      values = [{"locale": locale,
                  "document": {
                      "type": "Link",
                      "src": templates[template]
                  },
                  "datasources": datasources
                }];

      contentType = "V0Template";
      break;

    }
  }

  if (unitids && endpointids) {
    throw new Error("Only one of unitids or endpointids can be specified in the the CLI.");
  }

  let recipientType = (endpointids) ? "Endpoint" : "Unit";
  let recipients = (endpointids) ? endpointids :  unitids;

  const config = {
    method: 'post',
    url: '/v3/notifications',
    headers: {
      'Accept': 'application/json'
    },
    data: {
      //recipients: recipients,
      notification: {
        variants: [
          {
            type: notificationType,
            content: {
              variants: [
                {
                  type: contentType,
                  values: values
                }
              ]
            }
          }
        ]
      }
    }
  };

  let deliveryPreferences = {};

  if (indicatorSound) {
    deliveryPreferences.indicator = {sound: {type: indicatorSound}};
  }
  if (interruptionLevel) {
    deliveryPreferences.interruption = {level: interruptionLevel};
  }
  if (restrictActions) {
    deliveryPreferences.restrictActions = restrictActions.split(',');
  }

  if (startTime) {
    let scheduling = {activationWindow: {start: startTime}};
    if (dismissalTime) {
      scheduling.activationWindow.end = dismissalTime;
    }
    config.data.notification.variants[0].scheduling = scheduling;
  } else if(dismissalTime) {
    config.data.notification.variants[0].dismissalTime = dismissalTime;
  }

  if (Object.keys(deliveryPreferences).length > 0) {
    config.data.notification.variants[0].deliveryPreferences = deliveryPreferences;
  } 

  const data = await getBatchResults(config, {"type": recipientType}, "id", recipients.split(','), "recipients");
  return data;
}
