// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse} from './asp-api-helpers.js';

/// Endpoint discovery sessions /////////////////////////////////////////////////

export async function createDiscoverySession(unitid, skillid, stage = 'LIVE', type = 'SKILL') {

  const config = {
    method: 'post',
    url: `/v1/discoverySessions?unit=${unitid}`,
    data: {
      endpointReporter: {
        type: `${type}`,
        value: {
          skillId: `${skillid}`,
          skillStage: `${stage}`
        }
      }
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function getDiscoverySessionStatus(sessionid) {
  const config = {
    method: 'get',
    url: `/v1/discoverySessions/${sessionid}`
  };

  const data = await getAPIResponse(config);
  //console.log(data);
  return data;
}