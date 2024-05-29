#!/usr/bin/env node

// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { getAspAccessToken } from '../auth/accessTokenHelper.js'; // PB

import config from 'config';
import yargs from 'yargs/yargs';
import  { hideBin } from 'yargs/helpers';
import axios from 'axios';

import {getAccessToken,refreshAccessToken} from '../auth/oauth.js';
import {apiSettings} from "../utils/asp-api-helpers.js";
import {updateFileCache, getFileCache, useFileCache} from '../processes/filecache.js';
import {createProperty} from '../processes/createProperty.js';

import * as aspBluetooth from '../utils/aspBluetooth.js';
import * as aspCommunications from '../utils/aspCommunications.js';
import * as aspDiscovery from '../utils/aspDiscovery.js';
import * as aspEndpoints from '../utils/aspEndpoints.js';
import * as aspNotifications from '../utils/aspNotifications.js';
import * as aspProperty from '../utils/aspProperty.js';
import * as aspSkills from '../utils/aspSkills.js';
import * as aspUnitSettings from '../utils/aspUnitSettings.js';
import * as aspWiFi from '../utils/aspWiFi.js';
import * as aspUsers from '../utils/aspUsers.js';
import * as aspCampaigns from '../utils/aspCampaigns.js';
import * as aspDirect from '../utils/aspDirect.js';
import * as aspWebRTC from '../utils/aspWebRTC.js';


async function initSettings()
{
  const configSettings = config.get('asp_cli');

  //options iam,oauth,accesstoken
  switch (configSettings.auth) {
  case "secretsManager":
    var accessToken = await getAspAccessToken();
    apiSettings.authToken = accessToken;
    break;
  case "oauthLocal":
    var accessToken = getAccessToken();
    if (!accessToken)
    {
      await refreshAccessToken();
      accessToken = getAccessToken();
    }
    apiSettings.authToken = accessToken;
    break;
  default:
    const authConfig = config.get('oauthLocal');
    apiSettings.authToken = authConfig.get("access_token");
    break;
  }

  const aspConfig = config.get('asp_cli');
  apiSettings.apiDelay = aspConfig.get('delay');
  apiSettings.baseURL  = aspConfig.get('aspapibase');
  
  axios.defaults.baseURL = apiSettings.baseURL;
  axios.defaults.headers.common['Authorization'] = "Bearer " + apiSettings.authToken;
  axios.defaults.headers.common['Asp-Cli'] = 'v1.0.0';
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.put['Content-Type'] = 'application/json';
  
}

await initSettings();

const actions = {


  ///////// ASP Property actions //////////////////////////

  "get-units": async function() {
    var data = await aspProperty.getUnits(argv.parentid, argv.depth);
      outputResults(data);
      return data;
    },
  "get-units-from-cache": async function() {
      var data = getFileCache(argv);
      outputResults(data);
   },
   "get-unit": async function() {
    var data = await  aspProperty.getUnit(argv.unitid);
    outputResults(data);
    return data;
  },
  "get-unit-from-cache": async function() {
    var data = getFileCache(argv);
    outputResults(data);
 },
  "create-unit": async function() {
    var data = await  aspProperty.createUnit(argv.parentid,argv.name);
    outputResults(data);
  },
  "update-unit": async function() {
    var data = await  aspProperty.updateUnit(argv.unitid, argv.name);
    outputResults(data);
  },
  "delete-unit": async function() {
    var data = await  aspProperty.deleteUnit(argv.unitid);
    outputResults(data);
  },

//v
/////// Processes //////////////////////////
"create-property": async function() {
  //longer api call delay required for createProperty
  var data = await createProperty(argv.orgid, argv.name, argv.type);
  outputResults(data);
},

"update-property": async function() {
  var data = await useFileCache(...arguments);
  //console.log(JSON.stringify({update:"completed","statuscode":200}, null, 2));
},


//v
/////// Cache actions //////////////////////////

  "update-cache": async function() {
    var data = await updateFileCache(argv, null, argv.cache, argv.format);
    console.log(JSON.stringify({export:"completed","statuscode":200}, null, 2));
  },

  "update-property-from-cache": async function() {
    var data = await useFileCache(...arguments);
  },

  ///////// Unit Settings //////////////////////////

  "get-default-music-station": async function() {
    var data = await aspUnitSettings.getDefaultMusicStation(argv.unitid);
    outputResults(data);
  },
  "set-default-music-station": async function() {
    var data = await aspUnitSettings.setDefaultMusicStation(argv.unitid, argv.providerid, argv.stationid);
    outputResults(data);
  },
  "delete-all-reminders": async function() {
    var data = await aspUnitSettings.deleteAllReminders(argv.unitid);
    outputResults(data);
  },
  "delete-all-alarms": async function() {
    var data = await aspUnitSettings.deleteAllAlarms(argv.unitid);
    outputResults(data);
  },
  "delete-all-timers": async function() {
    var data = await aspUnitSettings.deleteAllTimers(argv.unitid);
    outputResults(data);
  },

  "set-menu-icon": async function() {
    var data = await aspUnitSettings.setMenuIcon(argv.unitid, argv.icon, argv.value);
    outputResults(data);
  },


///////// Skill Settings //////////////////////////

  "get-skill-enablement": async function() {
    var data = await aspSkills.getSkillEnablement(argv.unitid, argv.skillid);
    outputResults(data);
    return data;
  },
  "get-skill-enablements": async function() {
    var data = await aspSkills.listSkillEnablements(argv.unitid);
    outputResults(data);
    return data;
  },
  "get-skill-enablement-multiple-units": async function() {
    var data = await aspSkills.getSkillEnablementForMultipleUnits(argv.unitids);
    outputResults(data);
    return data;
  },
  "enable-skill-for-unit": async function() {
    var data = await aspSkills.enableSkillForUnit(argv.skillid,argv.unitid,argv.stage ,argv.partition, argv.linkredirecturi,argv.linkauthcode, argv.nfilocales);
    outputResults(data);
  },
  "enable-skill-multiple-units": async function() {
    var data = await aspSkills.enableSkillForMultipleUnits(argv.skillid,argv.unitids,argv.stage ,argv.partition, argv.linkredirecturi,argv.linkauthcode, argv.nfilocales);
    outputResults(data);
  },
  "disable-skill-for-unit": async function() {
    var data = await aspSkills.disableSkillForUnit(argv.unitid, argv.skillid, argv.stage);
    outputResults(data);
  },
  "disable-skill-multiple-units": async function() {
    var data = await aspSkills.disableSkillForMultipleUnits(argv.skillid, argv.unitids, argv.stage);
    outputResults(data);
  },

  ///////// Endpoint discovery sessions //////////////
  "create-discovery-session": async function() {
    var data = await aspDiscovery.createDiscoverySession(argv.unitid, argv.skillid, argv.stage, argv.type);
    outputResults(data);
    return data;
  },
  "get-discovery-session-status": async function() {
    var data = await aspDiscovery.getDiscoverySessionStatus(argv.sessionid);
    outputResults(data);
    return data;
  },

  ///////// Communications //////////////////////////

  "create-communication-profile": async function() {
    var data = await aspCommunications.createCommunicationsProfile(argv.unitid, argv.profilename);
    outputResults(data);
    return data;
  },

  "update-communication-profile": async function() {
    var data = await aspCommunications.updateCommunicationsProfile(argv.profileid, argv.name);
    outputResults(data);
    return data;
  },

  "get-communication-profile": async function() {
    var data = await aspCommunications.getCommunicationProfile(argv.profileid, argv.unitid);
    outputResults(data);
    return data;
  },

  "delete-communication-profile": async function() {
    var data = await aspCommunications.deleteCommunicationProfile(argv.profileid);
    outputResults(data);
    return data;
  },
  "create-address-book": async function() {
    var data = await aspCommunications.createAddressBook(argv.name);
    outputResults(data);
  },
  "get-address-books": async function() {
    var data = await aspCommunications.listAddressBooks();
    outputResults(data);
  },
  "get-address-book": async function() {
    var data = await aspCommunications.getAddressBook(argv.addressbookid);
    outputResults(data);
  },
  "update-address-book": async function() {
    var data = await aspCommunications.updateAddressBook(argv.addressbookid,argv.name);
    outputResults(data);
  },
  "delete-address-book": async function() {
    var data = await aspCommunications.deleteAddressBook(argv.addressbookid);
    outputResults(data);
  },
  "create-contact": async function() {
    var data = await aspCommunications.createContact(argv.addressbookid, argv.name, argv.phone, argv.profile, argv.webrtc);
    outputResults(data);
  },

  "get-contacts": async function() {
    var data = await aspCommunications.listContacts(argv.addressbookid);
    outputResults(data);
  },
 
  "get-contact": async function() {
    var data = await aspCommunications.getContact(argv.addressbookid, argv.contactid);
    outputResults(data);
  },
  "update-contact": async function() {
    var data = await aspCommunications.updateContact(argv.addressbookid, argv.contactid, argv.name, argv.phone, argv.profile, argv.webrtc);
    outputResults(data);
  },
  "delete-contact": async function() {
    var data = await aspCommunications.deleteContact(argv.contactid);
    outputResults(data);
  },
  "create-address-book-association": async function() {
    var data = await aspCommunications.createAddressBookAssociation(argv.addressbookid, argv.unitid);
    outputResults(data);
  },
  "create-bulk-address-book-associations": async function() {
    var data = await aspCommunications.createBulkAddressBookAssociations(argv.addressbookid, argv.unitids);
    outputResults(data);
  },
  "get-address-book-associations": async function() {
    var data = await aspCommunications.listAddressBookAssociations(argv.unitid);
    outputResults(data);
  },
  "get-address-book-association": async function() {
    var data = await aspCommunications.getAddressBookAssociation(argv.addressbookid,argv.unitid);
    outputResults(data);
  },
  "delete-address-book-association": async function() {
    var data = await aspCommunications.deleteAddressBookAssociation(argv.addressbookid, argv.unitid);
    outputResults(data);
  },
  "create-reciprocal-association": async function() {
    var data = await aspCommunications.createReciprocalAssociation(argv.profileid, argv.contactid);
    outputResults(data);
  },
  "get-reciprocal-association-status": async function() {
    var data = await aspCommunications.getReciprocalAssociationStatus(argv.profileid, argv.contactid);
    outputResults(data);
  },
  "delete-reciprocal-association": async function() {
    var data = await aspCommunications.deleteReciprocalAssociation(argv.profileid, argv.contactid);
    outputResults(data);
  },
  "set-drop-in-preference": async function() {
    var data = await aspCommunications.setDropInPreference(argv.profileid, argv.targetprofileid, argv.value);
    outputResults(data);
  },
  "get-drop-in-preference": async function() {
    var data = await aspCommunications.getDropInPreference(argv.profileId, argv.targetprofileid);
    outputResults(data);
  },
  "create-blocking-rule": async function() {
    var data = await aspCommunications.createBlockingRule(argv.profileId, argv.targetprofileid, argv.value);
    outputResults(data);
  },
  "get-blocking-rule": async function() {
    var data = await aspCommunications.getBlockingRule(argv.profileid, argv.value);
    outputResults(data);
  },

    ///////// WebRTC //////////////////////////
    "create-service-provider": async function() {
      var data = await aspWebRTC.createServiceProvider(argv.logicalid, argv.displaynames, argv.locales);
      outputResults(data);
    },
    "get-service-provider": async function() {
      var data = await aspWebRTC.getServiceProvider(argv.providerid);
      outputResults(data);
    },
    "update-service-provider": async function() {
      var data = await aspWebRTC.updateServiceProvider(argv.providerid, argv.displaynames, argv.locales);
      outputResults(data);
    },
    "delete-service-provider": async function() {
      var data = await aspWebRTC.deleteServiceProvider(argv.providerid);
      outputResults(data);
    },
  
    "create-network-mapping": async function() {
      var data = await aspWebRTC.createNetworkMapping(argv.providerid,argv.skillid, argv.networktype);
      outputResults(data);
    },
    "get-network-mapping": async function() {
      var data = await aspWebRTC.getNetworkMapping(argv.providerid);
      outputResults(data);
    },
    "update-network-mapping": async function() {
      var data = await aspWebRTC.updateNetworkMapping(argv.providerid,argv.skillid, argv.networktype);
      outputResults(data);
    },
    "delete-network-mapping": async function() {
      var data = await aspWebRTC.deleteNetworkMapping(argv.providerid);
      outputResults(data);
    },

    "create-account-association": async function() {
      var data = await aspWebRTC.createAccountAssociation();
      outputResults(data);
    },
    "update-account-association": async function() {
      var data = await aspWebRTC.updateAccountAssociation(argv.providerid, argv.accountid, argv.networktype, argv.skillid);
      outputResults(data);
    },
    "query-network-mapping": async function() {
      var data = await aspWebRTC.queryAccountAssociation(argv.query);
      outputResults(data);
      },

    ///////// Endpoints //////////////////////////

  "get-endpoints": async function() {
    var data = await aspEndpoints.getEndpoints(argv.unitid, argv.manufacturer);
    outputResults(data);
    return data;
  },
  "query-endpoints": async function() {
    var data = await aspEndpoints.queryEndpoints(argv.query, argv.expand);
    outputResults(data);
  },
  "get-endpoints-from-cache": async function() {
    var data = getFileCache(argv);
    outputResults(data);
   },
  "get-endpoint": async function() {
    var data = await aspEndpoints.getEndpoint(argv.endpointid);
    outputResults(data);
    return data;
  },
  "get-endpoint-from-cache": async function() {
    var data = getFileCache(argv);
    outputResults(data);
  },
  "update-endpoint-from-cache": async function() {
  var data = await updateFileCache(argv, null, argv.cache, argv.format);
  console.log(JSON.stringify({export:"completed","status":200}, null, 2));
  },

  "update-endpoint-name": async function() {
    var data = await aspEndpoints.updateFriendlyName(argv.endpointid, argv.name);
    outputResults(data);
  },
  "associate-unit": async function() {
    var data = await aspEndpoints.associateUnit(argv.endpointid, argv.unitid);
    outputResults(data);
    return data;
  },
  "disassociate-unit": async function() {
    var data = await aspEndpoints.disassociateUnit(argv.endpointid);
    outputResults(data);
    return data;
  },
  "deregister-endpoint": async function() {
    var data = await aspEndpoints.deregisterEndpoint(argv.endpointid);
    outputResults(data);
    return data;
  },
  "forget-endpoint": async function() {
    var data = await aspEndpoints.forgetEndpoint(argv.endpointid);
    outputResults(data);
    return data;
  },
  "get-address": async function() {
    var data = await aspEndpoints.getEndpointAddress(argv.endpointid);
    outputResults(data);
  },
  "set-address": async function() {
    var data = await aspEndpoints.postEndpointAddress(argv.endpointid, argv.addressline1, argv.addressline2, 
      argv.addressline3, argv.city, argv.stateorregion, argv.districtorcounty, argv.postalcode, argv.countrycode);
    outputResults(data);
  },
  
///////// Endpoint Features //////////////////////////
  
/// Bluetooth ////
  "get-bluetooth-features": async function() {
    var data = await aspBluetooth.getBluetoothFeatures(argv.endpointid);
    outputResults(data);
  },
  "unpair-all-bluetooth-devices": async function() {
    var data = await aspBluetooth.unpairAllBluetoothDevices(argv.endpointid);
    outputResults(data);
  },

/// Connectivity ////
  "get-endpoint-connectivity": async function() {
    var data = await aspEndpoints.getEndpointConnectivity(argv.endpointid);
    outputResults(data);
    return data;
  },

  "get-brightness": async function() {
    var data = await aspEndpoints.getBrightness(argv.endpointid);
    outputResults(data);
  },
  "set-brightness": async function() {
    var data = await aspEndpoints.setBrightness(argv.endpointid,argv.operation, argv.value);
    outputResults(data);
  },

  "get-color": async function() {
    var data = await aspEndpoints.getEndpointColor(argv.endpointid);
    outputResults(data);
  },
  "set-color": async function() {
    var data = await aspEndpoints.setEndpointColor(argv.endpointid,argv.hsb, argv.hue, argv.saturation, argv.brightness);
    outputResults(data);
  },

  "get-color-temperature": async function() {
    var data = await aspEndpoints.getColorTemperature(argv.endpointid);
    outputResults(data);
  },
  "set-color-temperature": async function() {
    var data = await aspEndpoints.setColorTemperature(argv.endpointid,argv.operation, argv.value);
    outputResults(data);
  },

  "get-power-state": async function() {
    var data = await aspEndpoints.getPowerState(argv.endpointid);
    outputResults(data);
  },
  "set-power-state": async function() {
    var data = await aspEndpoints.setPowerState(argv.endpointid, argv.operation);
    outputResults(data);
  },

  "get-speaker-properties": async function() {
    var data = await aspEndpoints.getSpeakerProperties(argv.endpointid);
    outputResults(data);
  },
  "set-speaker-properties": async function() {
    var data = await aspEndpoints.setSpeakerProperties(argv.endpointid,argv.operation, argv.value);
    outputResults(data);
  },

  "get-temperature": async function() {
    var data = await aspEndpoints.getTemperature(argv.endpointid);
    outputResults(data);
  },
  "get-thermostat": async function() {
    var data = await aspEndpoints.getThermostat(argv.endpointid);
    outputResults(data);
  },

///////// WiFi Settings /////////////////////////
  //v
  "get-wifi-installation-status": async function() {
    var data = await aspWiFi.getWifiInstallationStatus(argv.endpointid, argv.operationid);
    outputResults(data);
  },

  "set-wifi-configuration": async function() {
    var data = await aspWiFi.setWifiConfiguration(argv.endpointid, argv.ssid, argv.keymanagement, argv.priority);
    outputResults(data);
  },

  "save-wifi-configurations": async function() {
    var data = await aspEndpoints.saveWifiConfigurations(argv.configurations,argv.host);
    outputResults(data);
  },

  ///////// Endpoint Settings /////////////////////////

  "get-endpoint-settings": async function() {
    var data = await aspEndpoints.getEndpointSettings(argv.endpointid, argv.keys);
    outputResults(data);
  },

  "update-endpoint": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,argv.setting, argv.value);
    outputResults(data);
  },

  "set-donotdisturb": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"donotdisturb", argv.value);
    outputResults(data);
  },
  "set-locales": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"locales", argv.value);
    outputResults(data);
  },
  "set-wakewords": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"wakewords", argv.value);
    outputResults(data);
  },
  "set-wakewordconfirmation": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"wakewordconfirmation", argv.value);
    outputResults(data);
  },
  "set-speechconfirmation": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"speechconfirmation", argv.value);
    outputResults(data);
  },
  "set-followup": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"followup", argv.value);
    outputResults(data);
  },
  "set-temperatureunit": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"temperatureunit", argv.value);
    outputResults(data);
  },
  "set-distanceunits": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"distanceunits", argv.value);
    outputResults(data);
  },
  "set-magnifier": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"magnifier", argv.value);
    outputResults(data);
  },
  "set-closedcaptions": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"closedcaptions", argv.value);
    outputResults(data);
  },
  "set-alexacaptions": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"alexacaptions", argv.value);
    outputResults(data);
  },
  "set-colorinversion": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"colorinversion", argv.value);
    outputResults(data);
  },
  "set-timezone": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"timezone", argv.value);
    outputResults(data);
  },
  "set-speakingrate": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"speakingrate", argv.value);
    outputResults(data);
  },
  "set-errorsuppression": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"errorsuppression", argv.value);
    outputResults(data);
  },
  "set-maximumvolume": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"maximumvolume", argv.value);
    outputResults(data);
  },
  "set-timeformat": async function() {
    var data = await aspEndpoints.putEndpointSetting(argv.endpointid,"timeformat", argv.value);
    outputResults(data);
  },
  
  ///////// Notifications //////////////////////////

  "delete-all-notifications": async function() {
    var data = await aspNotifications.deleteAllNotifications(argv.unitids, argv.type);
    outputResults(data);
  },

  "send-notification": async function() {
    var data = await aspNotifications.sendNotification(argv.unitids,argv.recipienttype, argv.type, argv.text, argv.locale,argv.template, 
      argv.headertext, argv.primarytext, argv.secondarytext, argv.tertiarytext, argv.hinttext, argv.attributiontext, argv.ratingtext, argv.rating,
      argv.background,argv.thumbnail,argv.attributionimage, argv.coloroverlay, argv.dismissaltime, argv.dismissalhours, argv.dismissalminutes,
     /*PVA 2.0*/ argv.starttime, argv.indicatorsound, argv.interruptionlevel, argv.restrictactions, argv.optionlistdata);
    outputResults(data);
  },

  ///////// Users //////////////////////////
  "create-user": async function() {
    var data = await aspUsers.createUser(argv.orgid);
    outputResults(data);
  },

  "get-users": async function() {
    var data = await aspUsers.listUsers(argv.orgid);
    outputResults(data);
  },

  "delete-user": async function() {
    var data = await aspUsers.deleteUser(argv.userid);
    outputResults(data);
  },

  ////////// Roles ////////////////////////// 

  ////////// Campaigns //////////////////////////
  "create-campaign": async function() {
    var data = await aspCampaigns.createCampaign(argv.type , argv.unitids, argv.start, argv.end, argv.locale,
              argv.headertext, argv.primarytext, argv.secondarytext, argv.tertiarytext, argv.attributiontext, 
              argv.hinttext, argv.calltoactionbuttontext, argv.playbackenabled,
              argv.ratingtext , argv.ratingnumber, argv.backgroundimage, argv.attributionimage, argv.thumbnailimage,
              argv.actiontype, argv.actionuri, argv.actioninput, argv.listhinttexts, argv.listthumbnailimages
      );
    outputResults(data);
  },

  "get-campaigns": async function() {
    var data = await aspCampaigns.listCampaigns();
    outputResults(data);
  },

  "query-campaigns": async function() {

    var data = await aspCampaigns.queryCampaigns(argv.query);
    outputResults(data);
  },

  "get-campaign": async function() {
    var data = await aspCampaigns.getCampaign(argv.campaignid);
    outputResults(data);
  },

  "delete-campaign": async function() {
    var data = await aspCampaigns.deleteCampaign(argv.campaignid);
    outputResults(data);
  },

///////// API Direct Call //////////////////////////

"direct-api-call": async function() {
  var data = await aspDirect.directApiCall(argv.config);
  outputResults(data);
}

};

function preProcess(args) {
  if (argv.delay !== undefined) {
    apiSettings.apiDelay = argv.delay;
  }
  if (argv.includeapicall !== undefined) {
    apiSettings.includeApiCall = JSON.parse(argv.includeapicall);
  }
  //update args from config defaults
  const defaults = config.get('defaults');
  if (defaults) {
    Object.keys(defaults).forEach(key => {
      if (!argv.hasOwnProperty(key)) {
        argv[key] = defaults[key];
      }
    });
  }
}

function outputResults(data, outputParams = null) {
  if (argv.output) {

    if (!outputParams)
    {
      outputParams = argv.output.split('.');
    }
    let value = data;

    let i = 0;
    for (let param of outputParams) {
      
      if (param.includes('[]')) {
        const key = param.substring(0, param.indexOf('['));
        value = value[key].map(item => {
          //return outputResults(item,outputParams.slice(i - 2))}
          return item[outputParams[i + 1]]}
          ).join(',');
        break;
      } else if (param.includes('[') && param.includes(']')) {
        const index = param.substring(param.indexOf('[') + 1, param.indexOf(']'));
        const key = param.substring(0, param.indexOf('['));
        value = value[key][index];
      } else {
        value = value[param];
      }
      if (value === undefined) {
        break;
      }
      i++;
    }
    if (typeof value === 'object') 
    {
      console.log(JSON.stringify(value, null, 2));
      return;
    }
    console.log(value);
          
  } else {
      if (typeof data === 'object') 
      {
        data["action"] = argv.action;
      }
      console.log(JSON.stringify(data, null, 2));
  }
}

async function postProcess(args, result) {
  
  if (!argv.output && result && result.statuscode < 299) {
    if (args[0].cache) {
      await updateFileCache(args[0], result, args[0].cache, args[0].format);
    }
  } 
}

Object.keys(actions).forEach(key => {
  let action = actions[key];
  actions[key] = async function() {

    let result = {};
    try {
      preProcess.apply(this, arguments);
      result = await action.apply(this, arguments);
      await postProcess.apply(this, [arguments, result]);
    }
    catch (err) {
      //throw err;
      let message = 'Invalid or missing parameters.';
      if (err.message) {
        message = err.message;
      }
      result = {statuscode: 500, message: message};
      console.log(JSON.stringify(result, null, 2));
    }
    return result;
  };
});

const argv = yargs(hideBin(process.argv))
  
  .option('action', {
    describe: 'ASP API action to perform. e.g. get-units, create-unit, update-unit, delete-unit',
    type: 'string',
    required: true
    
  })
  .demandOption(['action'], 'Please provide both action and arguments.')
  .command('$0 <action>', 'Ex: asp-cli get-endpoints', (yargs) => {
    yargs.positional('action', {
      describe: 'The default argument',
      type: 'string'
    });
  })
  .argv;

const action = argv.action;

if (actions[action]) {
  actions[action](argv);
} else {
  console.log('Unknown action: ' + action);
}
