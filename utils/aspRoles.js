// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse, getAPICombinedResults} from './asp-api-helpers.js';

// Roles /////////////////////////////////////////////////////////////

//batch-assign-role
//batch-revoke-role

//get-roles
export async function getRoles(unitId, roleName, groupId) {
    const config = {
        method: 'get',
        url: `/v1/roles?${unitId ? "unitId=" + unitId : ""}${roleName && "&roleName=" + roleName}${groupId && "&targetEntityId=" + groupId}`
    };

    const data = await getAPICombinedResults(config);
    return data;
}

//get-role
export async function getRole(roleid) {
    const config = {
      method: 'get',
      url: `/v1/roles/${roleid}`
    };
  
    const data = await getAPIResponse(config);
    return data;
}

// assign-role
export async function assignRole(roleId, principalid, propagate=false, expiresat) {
    const config = {
        method: 'post',
        url: `/v1/roles/${roleId}/assignments`,
        data:
         {
                    "principalId": principalid,
                    "propagate": propagate,
                    ...(expiresat && { expiresAt:expiresat })
        }
    };
    
    const data = await getAPIResponse(config);
    return data;
}

// revoke-role
export async function revokeRole(roleid, principalid, propagate = false) {
    const config = {
      method: 'delete',
      url: `/v1/roles/${roleid}/assignments`,
      params: {
        principalId: principalid,
        propagate: propagate
      }
    };
  
    const data = await getAPIResponse(config);
    return data;
}

//get-principal-assignments
export async function getPrincipalAssignments(roleId) {
    const config = {
        method: 'get',
        url: `/v1/roles/${roleId}/assignments`,
      
    };

    const data = await getAPICombinedResults(config);
    return data;
}

//get-role-assignments
export async function getRoleAssignments(principalId,unitId,groupId) {
    const config = {
      method: 'get',
      url: `/v1/roles/assignments?principalId=${principalId}${unitId ? `&unitId=${unitId}` : ''}${groupId ? `&targetEntityId=${groupId}` : ''}`,
      // params: {
      // //  ...(unitId && { unitId: unitId }),
      // //  ...(groupId && { targetEntityId: groupId })
      // }
    };
  
    const data = await getAPICombinedResults(config);
    return data;
}