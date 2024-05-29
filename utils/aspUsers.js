// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse, getAPICombinedResults} from './asp-api-helpers.js';

// create-user
export async function createUser(orgid) {
    const config = {
        method: 'post',
        url: '/v1/auth/users',
        data: {
            "organizationId": orgid
        }
    };

    const data = await getAPIResponse(config);
    return data;
}

// get-users
export async function listUsers(orgid) {
    const config = {
        method: 'get',
        url: `/v1/auth/users?organizationId=${orgid}&maxResults=10`
    };

    const data = await getAPICombinedResults(config);
    return data;
}

// delete-user
export async function deleteUser(userId) {
    const config = {
        method: 'delete',
        url: `/v1/auth/users/${userId}`
    };

    const data = await getAPIResponse(config);
    return data;
}