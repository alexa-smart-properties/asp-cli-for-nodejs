// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getAPICombinedResults} from './asp-api-helpers.js';

/// Service Providers /////////////////////////////////////////////////

//create-service-provider
export async function createServiceProvider(logicalId, displayNames, locales = "en-US") {
  const config = {
    method: 'post',
    url: '/v1/communications/serviceProviders',
    data: {
      serviceProviderLogicalId: logicalId,
      displayName : []
    }
  };

  locales = locales.split(',');
  displayNames.split(',');

  locales.forEach(locale => {
    config.data.displayName.push({
      locale,
      value: displayNames[locales.indexOf(locale)]
    });
  });

  const data = await getAPIResponse(config);
  return data;
}

//get-service-provider
export async function getServiceProvider(serviceProviderId) {
  const config = {
    method: 'get',
    url: `/v1/communications/serviceProviders/${serviceProviderId}`,
  };

  const data = await getAPIResponse(config);
  return data;
}

//update-service-provider
export async function updateServiceProvider(serviceProviderId, displayNames, locales = "en-US") {
  const config = {
    method: 'put',
    url: `/v1/communications/serviceProviders/${serviceProviderId}`,
    data: {
      displayName : []
    }
  };

  locales = locales.split(',');
  displayNames.split(',');

  locales.forEach(locale => {
    config.data.displayName.push({
      locale,
      value: displayNames[locales.indexOf(locale)]
    });
  });

  const data = await getAPIResponse(config);
  return data;
}

//delete-service-provider
export async function deleteServiceProvider(serviceProviderId) {
  const config = {
    method: 'delete',
    url: `/v1/communications/serviceProviders/${serviceProviderId}`,
  };

  const data = await getAPIResponse(config);
  return data;
}

/// Network Mapping /////////////////////////////////////////////////

//create-network-mapping
export async function createNetworkMapping(providerId, skillId, networkType = "SKILL") {
  const config = {
    method: 'post',
    url: `/v1/communications/serviceProviders/${providerId}/network`,
    data: { 
      "networkType": networkType,
      "skillConfiguration":
      {
         "skillId": skillId
      }
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//get-network-mapping
export async function getNetworkMapping(providerId) {
  const config = {
    method: 'get',
    url: `/v1/communications/serviceProviders/${providerId}`,
  };

  const data = await getAPIResponse(config);
  return data;
}

//update-network-mapping
export async function updateNetworkMapping(providerId, skillId, networkType = "SKILL") {
  const config = {
    method: 'put',
    url: `/v1/communications/serviceProviders/${providerId}/network`,
    data: { 
      "networkType": networkType,
      "skillConfiguration":
      {
         "skillId": skillId
      }
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//delete-network-mapping
export async function deleteNetworkMapping(providerId) {
  const config = {
    method: 'delete',
    url: `/v1/communications/serviceProviders/${providerId}/network`
  };

  const data = await getAPIResponse(config);
  return data;
}


/// Account Association /////////////////////////////////////////////////

//create-account-association
export async function createAccountAssociation(providerId, externalUserId, profileId, amazonIdType = "communication-profile") {
  const config = {
    method: 'post',
    url: `/v1/communications/serviceProviders/${providerId}/externalUsers`,
    data: {
      "externalUserId": externalUserId,
      "amazonId": profileId,
      "amazonIdType": amazonIdType
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//update-account-association
export async function updateAccountAssociation(providerId, externalUserId, profileId, amazonIdType = "communication-profile") {
  const config = {
    method: 'put',
    url: `/v1/communications/serviceProviders/${providerId}/externalUsers`,
    data: {
      "externalUserId": externalUserId,
      "amazonId": profileId,
      "amazonIdType": amazonIdType
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//query-account-association
export async function queryAccountAssociation(providerId, externalUserIds) {
  const config = {
    method: 'post',
    url: `/v1/communications/serviceProviders/${providerId}/externalUsers`,
    data: {
      "filters": {
            "externalUserIds": externalUserIds.split(',')
       }
    }
  };

  const data = await getAPICombinedResults(config);
  return data;
}