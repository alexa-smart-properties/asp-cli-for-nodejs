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

export async function runAspCliAction(action, params = {}) {

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


