// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getAPICombinedResults} from './asp-api-helpers.js';

//create-sip-trunk
export async function createSipTrunk(tlsCertChains, tlsNames, peerNames, peerPorts, peerIPs) {
  const config = {
    method: 'post',
    url: '/v1/communications/network/siptrunk',

    data: {

    }
  };

  let certChains = tlsCertChains.split(',');
  let certChainsNames = tlsNames.split(',');

  let tls = certChains.map((certChain, index) => {
    return {
      name: certChainsNames[index],
      certificateChain: certChain
    };
  });

  config.data.tls = tls;

  if (peerIPs) {
    let peers = peerIPs.split(',').map((peerIP, index) => {
      return {
        name: peerNames.split(',')[index],
        port: peerPorts.split(',')[index],
        ip: peerIP
      };
    });
    config.data.peers = peers;

  } else {
    config.data.peer = {
      name: peerNames,
      port: peerPorts
    }
  } 


  config.data.certificateChain = tlsCertChains.split(',');

  const data = await getAPIResponse(config);
  return data;

}

//get-sip-trunk
export async function getSipTrunk(trunkId) {
  const config = {
    method: 'get',
    url: `/v1/communications/network/siptrunk/${trunkId}`
  };

  const data = await getAPIResponse(config);
  return data;
}


//get-sip-trunks
export async function getSipTrunks() {
  const config = {
    method: 'get',
    url: '/v1/communications/network/siptrunk'
  };

  const data = await getAPICombinedResults(config);
  return data;
}


//update-sip-trunk
export async function updateSipTrunk(trunkId, tlsCertChains, tlsNames, peerNames, peerPorts, peerIPs) {
  const config = {
    method: 'put',
    url: `/v1/communications/network/siptrunk/${trunkId}`,
    data: {

    }
  };

  let certChains = tlsCertChains.split(',');
  let certChainsNames = tlsNames.split(',');

  let tls = certChains.map((certChain, index) => {
    return {
      name: certChainsNames[index],
      certificateChain: certChain
    };
  });

  config.data.tls = tls;

  if (peerIPs) {
    let peers = peerIPs.split(',').map((peerIP, index) => {
      return {
        name: peerNames.split(',')[index],
        port: peerPorts.split(',')[index],
        ip: peerIP
      };
    });
    config.data.peers = peers;

  } else {
    config.data.peer = {
      name: peerNames,
      port: peerPorts
    }
  } 


  config.data.certificateChain = tlsCertChains.split(',');

  const data = await getAPIResponse(config);
  return data;

}

// delete-sip-trunk
export async function deleteSipTrunk(trunkId) {
  const config = {
    method: 'delete',
    url: `/v1/communications/network/siptrunk/${trunkId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

// create-extension-mapping
export async function mapExtension(trunkId, extension, profileId, routingType="communication-profile") {
  const config = {
    method: 'post',
    url: `/v1/communications/network/siptrunk/${trunkId}/extension/${extension}`,
    data: {
      "routingType": routingType,
      "commsProfileId": profileId
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

// get-extension-mapping
export async function getExtensionMapping(trunkId, extension) {
  const config = {
    method: 'get',
    url: `/v1/communications/network/siptrunk/${trunkId}/extension/${extension}`
  };

  const data = await getAPIResponse(config);
  return data;
}

// update-extension-mapping
export async function updateExtensionMapping(trunkId, extension, commsProfileId, routingType="communication-profile") {
  const config = {
    method: 'put',
    url: `/v1/communications/network/siptrunk/${trunkId}/extension/${extension}`,
    data: {
      "routingType": routingType,
      "commsProfileId": commsProfileId
    }
  };

  const data = await getAPIResponse(config);
  return data;
}


// delete-extension-mapping
export async function deleteExtensionMapping(trunkId, extension) {
  const config = {
    method: 'delete',
    url: `/v1/communications/network/siptrunk/${trunkId}/extension/${extension}`
  };

  const data = await getAPIResponse(config);
  return data;
}

// list-extensions
export async function listExtensions(trunkId) {
  const config = {
    method: 'get',
    url: `/v1/communications/network/siptrunk/${trunkId}/extensions`
  };

  const data = await getAPIResponse(config);
  return data;
}

