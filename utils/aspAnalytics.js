// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse} from './asp-api-helpers.js';

//generate-report
export async function generateReport(unitid, categories = "DEVICE", startdate, enddate, granularity = "DAILY", showsubunits = true, s3bucketarn) {
  const config = {
    method: 'post',
    url: '/v1/enterprise/analytics/reports',
    data: {
      "unitId": unitid,
      "categories": categories.split(","), //PROPERTY_SKILL, PROACTIVE_CAMPAIGN, DOMAIN_ENGAGEMENT, COMMUNICATION, DEVICE
      dateRange: {
         "startDate": startdate,
        "endDate": enddate,
        "granularity": granularity
      },
      format: "CSV",
       "showSubUnits": showsubunits,
      deliveryChannel: {
        id: s3bucketarn,
        type: "S3"
      }
    }
  };

  return await getAPIResponse(config);
}

