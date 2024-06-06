// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getAPICombinedResults} from './asp-api-helpers.js';

/// Property Management  /////////////////////////////////////////////////
export async function getUnits(parentId, depth = 1) {

  let expanded = true;
  let config = {
    method: 'get',
    url: `/v2/units?maxResults=50&parentId=${parentId}&expand=all&queryDepth=${depth}`,
  };

  const data = await getAPICombinedResults(config); 
  return data;
}   

export async function getUnit(unitId) {

  let config = {
    method: 'get',
    url: `/v2/units/${unitId}`,
  };

  const data = await getAPIResponse(config); 
  return data;

} 

export async function deleteUnit(unitId) {
  let config = {
    method: 'delete',
    url: `/v2/units/${unitId}`,
  };

  const data = await getAPIResponse(config); 
  return data;

}   

export async function createUnit(parentId, unitName, unitType = "PLAIN") {

    let postData = JSON.stringify({
        "name": {
            "type": unitType,
            "value": {"text": unitName}
        },
        "parentId": parentId
        });

    let config = {
    method: 'post',
    url: '/v2/units',
    data: postData
    }

    const data = await getAPIResponse(config); 
    return data;
} 

export async function updateUnit(unitId, unitName, unitType = "PLAIN") {
  

  let postData = JSON.stringify( {
    "name": {
          "type": unitType,
          "value": {
              "text": unitName
          }
      }
  });

  let config = {
    method: 'put',
    url: `/v2/units/${unitId}`,
    data: postData
  };
  
 const data = await getAPIResponse(config); 
 return data;
} 

export async function createDeviceGroup(name, description, memberDevices,associatedUnits) {
  let postData = JSON.stringify({
    friendlyName: {
      type: "PLAIN",
      value: {
        text: name
      }
    },
    //"amzn1.alexa.endpoint.{endpointId}"
    memberDevices: memberDevices,
    //"amzn1.alexa.unit.did.{UnitId}"
    associatedUnits: associatedUnits
  });

  let config = {
    method: 'post',
    url: '/v1/deviceGroups',
    data: postData
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function addMemberDevice(deviceGroupId, endpointId) {
  let postData = JSON.stringify({
    memberDevice: {
      id: endpointId
    }
  });

  let config = {
    method: 'post',
    url: `/v1/deviceGroups/${deviceGroupId}/memberDevices`,
    data: postData
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function removeMemberDevice(deviceGroupId, endpointId) {
  let config = {
    method: 'delete',
    url: `/v1/deviceGroups/${deviceGroupId}/memberDevices/${endpointId}`,
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function changeDeviceGroupFriendlyName(deviceGroupId, friendlyName) {
  let postData = JSON.stringify({
    friendlyName: {
      type: "PLAIN",
      value: {
        text: friendlyName
      }
    }
  });

  let config = {
    method: 'post',
    url: `/v1/deviceGroups/${deviceGroupId}/friendlyName`,
    data: postData
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function deleteDeviceGroup(deviceGroupId) {
  let config = {
    method: 'delete',
    url: `/v1/deviceGroups/${deviceGroupId}`,
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function getDeviceGroupsByUnitId(unitId, maxResults = 10) {

  let config = {
    method: 'get',
    url: `/v1/deviceGroups?associatedUnits.id=${unitId}&maxResults=${maxResults}`
  };

  const data = await getAPICombinedResults(config); 
  return data;
}

//get-consent-status
export async function getConsentStatus(unitId, consentType="health_data") {
  let config = {
    method: 'get',
    url: `/v2/units/${unitId}/consent?consentType=${consentType}`,
    headers: {
      Host: 'api.eu.amazonalexa.com'
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//reset-consent
export async function resetConsent(unitId) {
  let config = {
    method: 'put',
    url: `/v2/units/${unitId}/consent/reset`,
    headers: {
      Host: 'api.amazonalexa.com'
    }
  };

  const data = await getAPIResponse(config);
  return data;
}






