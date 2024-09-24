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
import * as aspPBX from '../utils/aspPBX.js';
import * as aspEvents from '../utils/aspEvents.js';
import * as aspReminders from '../utils/aspReminders.js';

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

export const actions = {

  ///////// ASP Property actions //////////////////////////

  "get-units": async function() {
    var data = await aspProperty.getUnits(argv.parentid, argv.depth);
      return outputResults(data);
    },
  "get-units-from-cache": async function() {
      var data = getFileCache(argv);
      return outputResults(data);
   },
   "get-unit": async function() {
      var data = await  aspProperty.getUnit(argv.unitid);
      return outputResults(data);
  },
  "get-unit-from-cache": async function() {
      var data = getFileCache(argv);
      return outputResults(data);
 },
  "create-unit": async function() {
      var data = await  aspProperty.createUnit(argv.parentid,argv.name);
      return outputResults(data);
  },
  "update-unit": async function() {
    var data = await  aspProperty.updateUnit(argv.unitid, argv.name);
    return outputResults(data);
  },
  "delete-unit": async function() {
    var data = await  aspProperty.deleteUnit(argv.unitid);
    return outputResults(data);
  },
  //EU only currently
  "get-consent-status": async function() {
    var data = await  aspProperty.getConsentStatus(argv.unitid, argv.consenttype);
    return outputResults(data);
  },
  "reset-consent": async function() {
    var data = await  aspProperty.resetConsent(argv.unitid);
    return outputResults(data);
  },

/////// Processes //////////////////////////
"create-property": async function() {
  //longer api call delay required for createProperty
  var data = await createProperty(argv.orgid, argv.name, argv.type);
  return outputResults(data);
},

// "update-property": async function() {
//   var data = await useFileCache(...arguments);
// },


/////// Cache actions //////////////////////////

  "update-cache": async function() {
    var data = await updateFileCache(argv, null, argv.cache, argv.format);
    return data;
  },

  "update-property-from-cache": async function() {
    var data = await useFileCache(...arguments);
    return data;
  },

  ///////// Unit Settings //////////////////////////

  "get-default-music-station": async function() {
    var data = await aspUnitSettings.getDefaultMusicStation(argv.unitid);
    return outputResults(data);
  },
  "set-default-music-station": async function() {
    var data = await aspUnitSettings.setDefaultMusicStation(argv.unitid, argv.providerid, argv.stationid);
    return outputResults(data);
  },
  "delete-all-reminders": async function() {
    var data = await aspUnitSettings.deleteAllReminders(argv.unitid);
    return outputResults(data);
  },
  "delete-all-alarms": async function() {
    var data = await aspUnitSettings.deleteAllAlarms(argv.unitid);
    return outputResults(data);
  },
  "delete-all-timers": async function() {
    var data = await aspUnitSettings.deleteAllTimers(argv.unitid);
    return outputResults(data);
  },

  "set-menu-icon": async function() {
    var data = await aspUnitSettings.setMenuIcon(argv.unitid, argv.icon, argv.value);
    return outputResults(data);
  },


///////// Skill Settings //////////////////////////

  "get-skill-enablement": async function() {
    var data = await aspSkills.getSkillEnablement(argv.unitid, argv.skillid);
    return outputResults(data);
  },
  "get-skill-enablements": async function() {
    var data = await aspSkills.listSkillEnablements(argv.unitid);
    return outputResults(data);
  },
  "get-skill-enablement-multiple-units": async function() {
    var data = await aspSkills.getSkillEnablementForMultipleUnits(argv.unitids);
    return outputResults(data);
  },
  "enable-skill-for-unit": async function() {
    var data = await aspSkills.enableSkillForUnit(argv.skillid,argv.unitid,argv.stage ,argv.partition, argv.linkredirecturi,argv.linkauthcode, argv.nfilocales);
    return outputResults(data);
  },
  "enable-skill-multiple-units": async function() {
    var data = await aspSkills.enableSkillForMultipleUnits(argv.skillid,argv.unitids,argv.stage ,argv.partition, argv.linkredirecturi,argv.linkauthcode, argv.nfilocales);
    return outputResults(data);
  },
  "disable-skill-for-unit": async function() {
    var data = await aspSkills.disableSkillForUnit(argv.unitid, argv.skillid, argv.stage);
    return outputResults(data);
  },
  "disable-skill-multiple-units": async function() {
    var data = await aspSkills.disableSkillForMultipleUnits(argv.skillid, argv.unitids, argv.stage);
    return outputResults(data);
  },

  ///////// Endpoint discovery sessions //////////////
  "create-discovery-session": async function() {
    var data = await aspDiscovery.createDiscoverySession(argv.unitid, argv.skillid, argv.stage, argv.type);
    return outputResults(data);
  },
  "get-discovery-session-status": async function() {
    var data = await aspDiscovery.getDiscoverySessionStatus(argv.sessionid);
    return outputResults(data);
  },

  ///////// Communications //////////////////////////

  "create-communication-profile": async function() {
    var data = await aspCommunications.createCommunicationsProfile(argv.unitid, argv.profilename);
    return outputResults(data);
    return data;
  },

  "update-communication-profile": async function() {
    var data = await aspCommunications.updateCommunicationsProfile(argv.profileid, argv.name);
    return outputResults(data);
    return data;
  },

  "get-communication-profile": async function() {
    var data = await aspCommunications.getCommunicationProfile(argv.profileid, argv.unitid);
    return outputResults(data);
    return data;
  },

  "delete-communication-profile": async function() {
    var data = await aspCommunications.deleteCommunicationProfile(argv.profileid);
    return outputResults(data);
    return data;
  },
  "create-address-book": async function() {
    var data = await aspCommunications.createAddressBook(argv.name);
    return outputResults(data);
  },
  "get-address-books": async function() {
    var data = await aspCommunications.listAddressBooks();
    return outputResults(data);
  },
  "get-address-books-from-cache": async function() {
      var data = getFileCache(argv);
      return outputResults(data); 
   },
  "get-address-book": async function() {
    var data = await aspCommunications.getAddressBook(argv.addressbookid);
    return outputResults(data);
  },
  "get-address-book-from-cache": async function() {
      var data = getFileCache(argv);
      return outputResults(data); 
   },
  "update-address-book": async function() {
    var data = await aspCommunications.updateAddressBook(argv.addressbookid,argv.name);
    return outputResults(data);
  },
  "delete-address-book": async function() {
    var data = await aspCommunications.deleteAddressBook(argv.addressbookid);
    return outputResults(data);
  },
  "create-contact": async function() {
    var data = await aspCommunications.createContact(argv.addressbookid, argv.name, argv.phone, argv.profile, argv.webrtc);
    return outputResults(data);
  },

  "get-contacts": async function() {
    var data = await aspCommunications.listContacts(argv.addressbookid);
    return outputResults(data);
  },
  "get-contacts-from-cache": async function() {
      var data = getFileCache(argv);
      return outputResults(data); 
   },
 
  "get-contact": async function() {
    var data = await aspCommunications.getContact(argv.addressbookid, argv.contactid);
    return outputResults(data);
  },
  "get-contact-from-cache": async function() {
      var data = getFileCache(argv);
      return outputResults(data); 
   },
  "update-contact": async function() {
    var data = await aspCommunications.updateContact(argv.addressbookid, argv.contactid, argv.name, argv.phone, argv.profile, argv.webrtc);
    return outputResults(data);
  },
  "delete-contact": async function() {
    var data = await aspCommunications.deleteContact(argv.contactid);
    return outputResults(data);
  },
  "create-address-book-association": async function() {
    var data = await aspCommunications.createAddressBookAssociation(argv.addressbookid, argv.unitid);
    return outputResults(data);
  },
  "create-bulk-address-book-associations": async function() {
    var data = await aspCommunications.createBulkAddressBookAssociations(argv.addressbookid, argv.unitids);
    return outputResults(data);
  },
  "get-address-book-associations": async function() {
    var data = await aspCommunications.listAddressBookAssociations(argv.unitid);
    return outputResults(data);
  },
  "get-address-book-association": async function() {
    var data = await aspCommunications.getAddressBookAssociation(argv.addressbookid,argv.unitid);
    return outputResults(data);
  },
  "delete-address-book-association": async function() {
    var data = await aspCommunications.deleteAddressBookAssociation(argv.addressbookid, argv.unitid);
    return outputResults(data);
  },
  "create-reciprocal-association": async function() {
    var data = await aspCommunications.createReciprocalAssociation(argv.profileid, argv.contactid);
    return outputResults(data);
  },
  "get-reciprocal-association-status": async function() {
    var data = await aspCommunications.getReciprocalAssociationStatus(argv.profileid, argv.contactid);
    return outputResults(data);
  },
  "delete-reciprocal-association": async function() {
    var data = await aspCommunications.deleteReciprocalAssociation(argv.profileid, argv.contactid);
    return outputResults(data);
  },
  "set-drop-in-preference": async function() {
    var data = await aspCommunications.setDropInPreference(argv.profileid, argv.targetprofileid, argv.value);
    return outputResults(data);
  },
  "get-drop-in-preference": async function() {
    var data = await aspCommunications.getDropInPreference(argv.profileId, argv.targetprofileid);
    return outputResults(data);
  },
  "create-blocking-rule": async function() {
    var data = await aspCommunications.createBlockingRule(argv.profileId, argv.targetprofileid, argv.value);
    return outputResults(data);
  },
  "get-blocking-rule": async function() {
    var data = await aspCommunications.getBlockingRule(argv.profileid, argv.value);
    return outputResults(data);
  },

    ///////// WebRTC //////////////////////////
    "create-service-provider": async function() {
      var data = await aspWebRTC.createServiceProvider(argv.logicalid, argv.displaynames, argv.locales);
      return outputResults(data);
    },
    "get-service-provider": async function() {
      var data = await aspWebRTC.getServiceProvider(argv.providerid);
      return outputResults(data);
    },
    "update-service-provider": async function() {
      var data = await aspWebRTC.updateServiceProvider(argv.providerid, argv.displaynames, argv.locales);
      return outputResults(data);
    },
    "delete-service-provider": async function() {
      var data = await aspWebRTC.deleteServiceProvider(argv.providerid);
      return outputResults(data);
    },
  
    "create-network-mapping": async function() {
      var data = await aspWebRTC.createNetworkMapping(argv.providerid,argv.skillid, argv.networktype);
      return outputResults(data);
    },
    "get-network-mapping": async function() {
      var data = await aspWebRTC.getNetworkMapping(argv.providerid);
      return outputResults(data);
    },
    "update-network-mapping": async function() {
      var data = await aspWebRTC.updateNetworkMapping(argv.providerid,argv.skillid, argv.networktype);
      return outputResults(data);
    },
    "delete-network-mapping": async function() {
      var data = await aspWebRTC.deleteNetworkMapping(argv.providerid);
      return outputResults(data);
    },

    "create-account-association": async function() {
      var data = await aspWebRTC.createAccountAssociation();
      return outputResults(data);
    },
    "update-account-association": async function() {
      var data = await aspWebRTC.updateAccountAssociation(argv.providerid, argv.accountid, argv.networktype, argv.skillid);
      return outputResults(data);
    },
    "query-network-mapping": async function() {
      var data = await aspWebRTC.queryAccountAssociation(argv.query);
      return outputResults(data);
      },

     ///////// PBX //////////////////////////   
     
     "create-sip-trunk": async function() {
        var data = await aspPBX.createSipTrunk(argv.certchains, argv.certchainnames, argv.peernames,argv.peerports, argv.peerips);
        return outputResults(data);
      },

      "get-sip-trunk": async function() {
        var data = await aspPBX.getSipTrunk(argv.trunkid);
        outputResults(data);
      },
      "get-sip-trunks": async function() {
        var data = await aspPBX.getSipTrunks();
        outputResults(data);
      },

      "update-sip-trunk": async function() {
        var data = await aspPBX.updateSipTrunk(argv.trunkid,argv.certchains, argv.certchainnames, argv.peernames,argv.peerports, argv.peerips);
        outputResults(data);
      },

      "delete-sip-trunk": async function() {
        var data = await aspPBX.deleteSipTrunk(argv.trunkid);
        outputResults(data);
      },

      "create-extension-mapping": async function() {
        var data = await aspPBX.mapExtension(argv.trunkid, argv.extension, argv.profileid, argv.routingtype);
        outputResults(data);
      },
      "get-extension-mapping": async function() { 
        var data = await aspPBX.getExtensionMapping(argv.trunkid, argv.extension);
        outputResults(data);
      },
      "update-extension-mapping": async function() {
        var data = await aspPBX.updateExtensionMapping(argv.trunkid, argv.extension, argv.profileid, argv.routingtype);
        outputResults(data);
      },
      "delete-extension-mapping": async function() {
        var data = await aspPBX.deleteExtensionMapping(argv.trunkid, argv.extension);
        outputResults(data);
      },
      "list-extensions": async function() {
        var data = await aspPBX.listExtensions(argv.trunkid);
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
    return outputResults(data);
  },
  "get-endpoints-from-cache": async function() {
    var data = getFileCache(argv);
    return outputResults(data);
   },
  "get-endpoint": async function() {
    var data = await aspEndpoints.getEndpoint(argv.endpointid);
    return outputResults(data);
  },
  "get-endpoint-from-cache": async function() {
    var data = getFileCache(argv);
    return outputResults(data);
  },
  "update-endpoint-from-cache": async function() {
  var data = await updateFileCache(argv, null, argv.cache, argv.format);
  return data;
  },

  "update-endpoint-name": async function() {
    var data = await aspEndpoints.updateFriendlyName(argv.endpointid, argv.name);
    return outputResults(data);
  },
  "associate-unit": async function() {
    var data = await aspEndpoints.associateUnit(argv.endpointid, argv.unitid);
    return outputResults(data);
    return data;
  },
  "disassociate-unit": async function() {
    var data = await aspEndpoints.disassociateUnit(argv.endpointid);
    return outputResults(data);
    return data;
  },
  "deregister-endpoint": async function() {
    var data = await aspEndpoints.deregisterEndpoint(argv.endpointid);
    return outputResults(data);
    return data;
  },
  "forget-endpoint": async function() {
    var data = await aspEndpoints.forgetEndpoint(argv.endpointid);
    return outputResults(data);
    return data;
  },
  "get-address": async function() {
    var data = await aspEndpoints.getEndpointAddress(argv.endpointid);
    return outputResults(data);
  },
  "set-address": async function() {
    var data = await aspEndpoints.postEndpointAddress(argv.endpointid, argv.addressline1, argv.addressline2, 
      argv.addressline3, argv.city, argv.stateorregion, argv.districtorcounty, argv.postalcode, argv.countrycode);
      return outputResults(data);
  },
  
///////// Endpoint Features //////////////////////////
  
/// Bluetooth ////
  "get-bluetooth-features": async function() {
    var data = await aspBluetooth.getBluetoothFeatures(argv.endpointid);
    return outputResults(data);
  },
  "unpair-all-bluetooth-devices": async function() {
    var data = await aspBluetooth.unpairAllBluetoothDevices(argv.endpointid);
    return outputResults(data);
  },

/// Connectivity ////
  "get-endpoint-connectivity": async function() {
    var data = await aspEndpoints.getEndpointConnectivity(argv.endpointid);
    return outputResults(data);
    return data;
  },

  "get-brightness": async function() {
    var data = await aspEndpoints.getBrightness(argv.endpointid);
    return outputResults(data);
  },
  "set-brightness": async function() {
    var data = await aspEndpoints.setBrightness(argv.endpointid,argv.operation, argv.value);
    return outputResults(data);
  },

  "get-color": async function() {
    var data = await aspEndpoints.getEndpointColor(argv.endpointid);
    return outputResults(data);
  },
  "set-color": async function() {
    var data = await aspEndpoints.setEndpointColor(argv.endpointid,argv.hsb, argv.hue, argv.saturation, argv.brightness);
    return outputResults(data);
  },

  "get-color-temperature": async function() {
    var data = await aspEndpoints.getColorTemperature(argv.endpointid);
    return outputResults(data);
  },
  "set-color-temperature": async function() {
    var data = await aspEndpoints.setColorTemperature(argv.endpointid,argv.operation, argv.value);
    return outputResults(data);
  },

  "get-power-state": async function() {
    var data = await aspEndpoints.getPowerState(argv.endpointid);
    return outputResults(data);
  },
  "set-power-state": async function() {
    var data = await aspEndpoints.setPowerState(argv.endpointid, argv.operation);
    return outputResults(data);
  },

  "get-speaker-properties": async function() {
    var data = await aspEndpoints.getSpeakerProperties(argv.endpointid);
    return outputResults(data);
  },
  "set-speaker-properties": async function() {
    var data = await aspEndpoints.setSpeakerProperties(argv.endpointid,argv.operation, argv.value);
    return outputResults(data);
  },

  "get-temperature": async function() {
    var data = await aspEndpoints.getTemperature(argv.endpointid);
    return outputResults(data);
  },
  "get-thermostat": async function() {
    var data = await aspEndpoints.getThermostat(argv.endpointid);
    return outputResults(data);
  },

///////// WiFi Settings /////////////////////////

  "get-wifi-installation-status": async function() {
    var data = await aspWiFi.getWifiInstallationStatus(argv.endpointid, argv.operationid);
    return outputResults(data);
  },

  "set-wifi-configuration": async function() {
    var data = await aspWiFi.setWifiConfiguration(argv.endpointid, argv.ssid, argv.keymanagement, argv.priority);
    return outputResults(data);
  },

  "save-wifi-configurations": async function() {
    var data = await aspEndpoints.saveWifiConfigurations(argv.configurations,argv.host);
    return outputResults(data);
  },

  "forget-wifi-configurations": async function() {
    var data = await aspWiFi.forgetWifiConfigurations(argv.endpointid, argv.ssid, argv.keymanagement);
    return outputResults(data);
  },

  "get-wifi-configurations": async function() {
    var data = await aspWiFi.getWifiConfigurations(argv.endpointid);
    return outputResults(data);
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
    return outputResults(data);
  },

  ///////// Endpoint Reminders //////////////////////

  "get-reminders": async function() {
    var data = await aspReminders.getReminders(argv.endpointid);
    return outputResults(data);
  },
  "get-reminder": async function() {
    var data = await aspReminders.getReminder(argv.reminderid);
    return outputResults(data);
  },
  "create-reminder": async function() {
    var data = await aspReminders.createReminder(argv.endpointids, argv.requesttime, argv.offsetinseconds, argv.scheduledtime, argv.startdatetime, argv.enddatetime, argv.recurrencerules, argv.timezoneid, argv.locale, argv.text, argv.ssml);
    return outputResults(data);
  },
  "update-reminder": async function() {
    var data = await aspReminders.updateReminder(argv.reminderid, argv.endpointid, argv.requesttime, argv.offsetinseconds, argv.scheduledtime, argv.startdatetime, argv.enddatetime, argv.recurrencerules, argv.timezoneid, argv.locale, argv.text, argv.ssml);
    return outputResults(data);
  },
  "delete-reminder": async function() {
    var data = await aspReminders.deleteReminder(argv.reminderid);
    return outputResults(data);
  },

  ///////// Notifications //////////////////////////

  "delete-all-notifications": async function() {
    var data = await aspNotifications.deleteAllNotifications(argv.unitids, argv.endpointids, argv.type);
    return outputResults(data);
  },

  "send-notification": async function() {

    var data = await aspNotifications.sendNotification(argv.unitids,argv.endpointids, argv.type, argv.text, argv.locale,argv.template, 
      argv.headertext, argv.primarytext, argv.secondarytext, argv.tertiarytext, argv.hinttext, argv.attributiontext, argv.ratingtext, argv.rating,
      argv.background,argv.thumbnail,argv.attributionimage, argv.coloroverlay, argv.dismissaltime, argv.dismissalhours, argv.dismissalminutes,
     /*PVA 2.0*/ argv.starttime, argv.indicatorsound, argv.interruptionlevel, argv.restrictactions, argv.optionlistdata);
    return outputResults(data);
  },

  "query-notifications": async function() {
    var data = await aspNotifications.queryNotifications(argv.unitids, argv.endpointids, argv.notificationType);
    outputResults(data);
  },

  ///////// Users //////////////////////////
  "create-user": async function() {
    var data = await aspUsers.createUser(argv.orgid);
    return outputResults(data);
  },

  "get-users": async function() {
    var data = await aspUsers.listUsers(argv.orgid);
    return outputResults(data);
  },

  "delete-user": async function() {
    var data = await aspUsers.deleteUser(argv.userid);
    return outputResults(data);
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

///////// SNS Events //////////////////////////
  // create-subscription-configuration
  "create-subscription-configuration": async function() {
    var data = await aspEvents.createSubscriptionConfiguration(argv.type, argv.channelids);
    return outputResults(data);
  },

// get-subscription-configuration
  "get-subscription-configuration": async function() {  
    var data = await aspEvents.getSubscriptionConfigurationById(argv.configurationid);
    return outputResults(data);
  },

  // get-subscription-configurations
  "get-subscription-configurations": async function() {  
    var data = await aspEvents.getSubscriptionConfigurations();
    return outputResults(data);
  },


// delete-subscription-configuration
  "delete-subscription-configuration": async function() {
    var data = await aspEvents.deleteSubscriptionConfiguration(argv.configurationid);
    return outputResults(data);
  },

// create-subscription
  "create-subscription": async function() {
    var data = await aspEvents.createSubscription(argv.configurationid, argv.eventnamespace, argv.eventname, argv.parentid, argv.unitid, argv.skillid);
    return outputResults(data);
  },  

// get-subscription
  "get-subscription": async function() {
    var data = await aspEvents.getSubscription(argv.subscriptionid);
    return outputResults(data);
  },
// get-subscriptions
  "get-subscriptions": async function() {
    var data = await aspEvents.getSubscriptions(argv.unitid, argv.parentid, argv.eventnamespace, argv.eventname);
    return outputResults(data);
  },

// delete-subscription
  "delete-subscription": async function() {
    var data = await aspEvents.deleteSubscription(argv.subscriptionid);
    return outputResults(data);
  },

///////// API Direct Call //////////////////////////

"direct-api-call": async function() {
  var data = await aspDirect.directApiCall(argv.config);
  return outputResults(data);
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

export function outputResults(data, outputParams = null) {
  
  if (data.statuscode > 299 && argv.output !== 'statuscode')
  {
      console.log(JSON.stringify(data, null, 2));
      return data;
  }
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
    } else {
      console.log(value);
    }
    return value;
   
  } else {
      if (typeof data === 'object') 
      {
        data["action"] = argv.action;
      }
      console.log(JSON.stringify(data, null, 2));
  }
  return data;

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
