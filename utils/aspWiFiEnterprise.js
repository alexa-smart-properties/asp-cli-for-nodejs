// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getAPICombinedResults,apiSettings} from './asp-api-helpers.js';

////// Enterprise WiFi ///////////////////////////////////////////

//create-certificate-authority
export async function createCertificateAuthority(friendlyName, rotationPeriod=12, interval='MONTHS') {

  if (rotationPeriod !== 6 && rotationPeriod !== 12) {
    throw new Error('rotationPeriod must be either 6 or 12');
  }
  if (interval !== 'MONTHS') {
    throw new Error('interval must be MONTHS');
  }

  const config = {
    method: 'post',
    url: '/v1/enterprise/certificateAuthorities',
    data: {
      friendlyName: {
        type: 'PLAIN',
        value: {
          text: friendlyName
        }
      },
      rotationPeriod: {
        value: rotationPeriod,
        interval: interval
      }
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//get-certificate-authority
export async function getCertificateAuthority(certificateAuthorityId, expand = 'all') {
  const config = {
    method: 'get',
    url: `/v1/enterprise/certificateAuthorities/${certificateAuthorityId}${expand ? `?expand=${expand}` : ''}`
  };

  const data = await getAPIResponse(config);
  return data;
}

//update-certificate-authority
export async function updateCertificateAuthority(certificateAuthorityId, friendlyName, rotationPeriod, interval = 'MONTHS') {
  
  if (!friendlyName && !rotationPeriod) {
    throw new Error('Either friendlyName or rotationPeriod must be provided');
  }

  if (rotationPeriod && (rotationPeriod !== 6 && rotationPeriod !== 12)) {
    throw new Error('rotationPeriodValue must be either 6 or 12');
  }
  if (interval !== 'MONTHS') {
    throw new Error('interval must be MONTHS');
  }
  
  const config = {
    method: 'put',
    url: `/v1/enterprise/certificateAuthorities/${certificateAuthorityId}`,
    data: {
      ...(friendlyName && {
        friendlyName: {
          type: 'PLAIN',
          value: {
            text: friendlyName
          }
        }
      }),
      ...(rotationPeriod && {
        rotationPeriod: {
          value: rotationPeriod,
          interval: interval
        }
      })
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//import-certificate
export async function importCertificate(certificateAuthorityId, certificate, certificateChain) {
  console.log(certificate);
  const config = {
    method: 'post',
    url: `/v1/enterprise/certificateAuthorities/${certificateAuthorityId}/importCertificate`,
    data: {
      certificate: Buffer.from(certificate, 'base64').toString('utf-8') ,
      certificateChain: Buffer.from(certificateChain, 'base64').toString('utf-8') 
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//delete-certificate-authority
export async function deleteCertificateAuthority(certificateAuthorityId) {
  const config = {
    method: 'delete',
    url: `/v1/enterprise/certificateAuthorities/${certificateAuthorityId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

//get-certificate-authorities
//TODO:validate expand default
export async function getCertificateAuthorities(expand = 'all') {
  const config = {
    method: 'get',
    url: `/v1/enterprise/certificateAuthorities?${expand ? `expand=${expand}` : ''}`
  };

  const data = await getAPICombinedResults(config);
  return data;
}


