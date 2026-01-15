// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { actions, argv,  wrapAction } from '../bin/index.js';

export function addWrappedActions(newActions) {
  console.log('aspcli.js: added new actions:');
  Object.keys(newActions).forEach(key => {
    actions[key] = newActions[key];
    
    wrapAction(key);
});
}

export function addAction(key, action) {
    actions[key] = action;
}

import config from 'config';
import { getTokenForOrg } from '../auth/tokenManager.js';
import axios from 'axios';
import { apiSettings } from '../utils/asp-api-helpers.js';

export async function runAspCliAction(action, params = {}, orgKey = null) {

   // console.log('runAspCliAction::', action);
   
   if (orgKey && config.has(`organizations.${orgKey}`)) {
     const orgConfig = config.get(`organizations.${orgKey}`);
     const token = await getTokenForOrg(orgKey, orgConfig);
     apiSettings.authToken = token;
     axios.defaults.headers.common['Authorization'] = "Bearer " + token;
     if (orgConfig.orgid && !params.orgid) params.orgid = orgConfig.orgid;
   }
   
   for (var x in argv) {if (Object.prototype.hasOwnProperty.call(argv,x)) delete argv[x];}

    Object.assign(argv, params);
    argv.directoutput = true;
    argv.includeapicall = true;
    argv.action = action;

    if (actions[action]) {
        let results = await actions[action](argv);
        return results;
      } else {
        return {status: 404, message: 'Unknown action: ' + action};
      }
      
}


