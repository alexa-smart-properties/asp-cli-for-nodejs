// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse} from './asp-api-helpers.js';

////// Endpoint WiFi ///////////////////////////////////////////

export async function getWifiInstallationStatus(endpointId, operationId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/connectivity/addOrUpdateWifiConfigurations/submittedOperations/${operationId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function saveWifiConfigurations(wifiConfigurations, host="credential-locker-service.amazon.com") {
  
  wifiConfigurations = JSON.parse(wifiConfigurations);
  
  const config = {
    method: 'post',
    url: `https://${host}/credentiallocker/v2/saveWifiConfigurations`,
    headers: {
      'x-amz-access-token': apiSettings.authToken,
      'Content-Type': 'application/json'
    },
    data: {
      wifiConfigurations
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function setWifiConfiguration(endpointid, ssid, keyManagement, priority ) {
  
  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointid}/features/connectivity/addOrUpdateWifiConfigurations`,
      data: {
        "payload": {
          "wifiConfigurations": [{
              "ssid": `"${ssid}"`,
              "keyManagement": `${keyManagement}`
          }]
      }
    }
  };

  if (priority) { 
    config.data.payload.wifiConfigurations[0].priority = Number.parseInt(priority);
  }

  const data = await getAPIResponse(config);
  return data;
}

//forget-wifi-configurations
export async function forgetWifiConfigurations(endpointId, ssid, keyManagement) {
  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/features/connectivity/forgetWifiConfigurations`,
    data: {
      "payload": {
        "wifiConfigurations": [{
          "ssid": ssid,
          "keyManagement": keyManagement
        }]
      }
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//get-wifi-configurations
export async function getWifiConfigurations(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/connectivity/wifiConfigurations`,
  };

  const data = await getAPIResponse(config);
  return data;
}
