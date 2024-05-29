// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse} from './asp-api-helpers.js';

/// Unit Settings /////////////////////////////////////////////////

//get-default-music-station
export async function getDefaultMusicStation(unitId) {
  const config = {
    method: 'get',
    url: `/v2/units/${unitId}/settings/MusicExperience.defaultStationPreferences`
  };

  const data = await getAPIResponse(config);
  return data;
}

//set-default-music-station
//test 	I_HEART_RADIO 7193
export async function setDefaultMusicStation(unitId, providerId, stationId) {
  const config = {
    method: 'put',
    url: `/v2/units/${unitId}/settings/MusicExperience.defaultStationPreferences`,
    data: {
      providerId: providerId,
      stationId: stationId.toString()
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

//set-menu-icon
export async function setMenuIcon(unitId, icon, value) {

  const config = {
    method: 'post',
    url: `/v2/units/${unitId}/settings/menuIcons`,
    data: {
            "menuIcons": [
              {
                  "name": `${icon}`,
                  "status": `${value}`
              }
          ]}
  };

  const data = await getAPIResponse(config);
  return data;
}

//delete-all-alarms
export async function deleteAllAlarms(unitId) {
  const config = {
    method: 'delete',
    url: `/v1/alerts/alarms?unitId=${unitId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

//delete-all-reminders
export async function deleteAllReminders(unitId) {
  const config = {
    method: 'delete',
    url: `/v1/alerts/reminders?unitId=${unitId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

//delete-all-timers
export async function deleteAllTimers(unitId) {
  const config = {
    method: 'delete',
    url: `/v1/alerts/timers?unitId=${unitId}`
  };

  const data = await getAPIResponse(config);
  return data;
}