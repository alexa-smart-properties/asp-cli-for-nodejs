// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse} from './asp-api-helpers.js';

/// Bluetooth /////////////////////////////////////////////////

//get-bluetooth-features 
export async function getBluetoothFeatures(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/bluetooth`
  };

  const data = await getAPIResponse(config);
  return data;
}

//unpair-all-bluetooth-devices
export async function unpairAllBluetoothDevices(endpointId) {
  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/features/bluetooth/unpair`
  };

  const data = await getAPIResponse(config);
  return data;
}