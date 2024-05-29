// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse} from './asp-api-helpers.js';

//direct-api-call
export async function directApiCall(config) {

  config = JSON.parse(config);

  const data = await getAPIResponse(config);
  return data;
}

