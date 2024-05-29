// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getAPICombinedResults,getBatchResults} from './asp-api-helpers.js';

let skillLookup = {
  core: "amzn1.ask.skill.b4ca54a9-5e5f-4c60-93a0-d4cbd48640f2",
  healthcare_us: "amzn1.ask.skill.90c5a544-3ea5-459e-8275-b925a0f84224",
  hospitality_ca: "amzn1.ask.skill.eac80ad0-ab7d-41db-9f21-1e34747c7cb5",
  hospitality_de: "amzn1.ask.skill.de46bda1-550d-4381-9a08-17204f9e935e",
  hospitality_es: "amzn1.ask.skill.b70682dd-67b0-4775-acae-f8d2ee278322",
  hospitality_fr: "amzn1.ask.skill.3c136caa-8b11-4210-a5e9-7bdd9f2c606a",
  hospitality_it: "amzn1.ask.skill.fba6aef7-cc2c-474a-992a-68b118970548",
  hospitality_jp: "amzn1.ask.skill.ae0c1da0-5068-4b71-ac8e-d4f3c230ef84",
  hospitality_uk: "amzn1.ask.skill.06322139-c2a9-4c59-a4b6-354b37aafb33",
  hospitality_us: "amzn1.ask.skill.a4697856-173d-4b66-91a3-ef4b083992f5",
  seniorliving_ca: "amzn1.ask.skill.2d1e40fa-3611-41d2-8b41-f4fb76ab4829",
  seniorliving_de: "amzn1.ask.skill.bf08c62f-49e9-4318-a79d-b7eb0787f62f",
  seniorliving_es: "amzn1.ask.skill.54da35b3-2ba1-489c-8034-8eca7b12a29b",
  seniorliving_fr: "amzn1.ask.skill.45e4d2c4-54b4-4186-af3f-3f51d22e45f6",
  seniorliving_it: "amzn1.ask.skill.19d6addf-71d4-43ae-8dba-1b83142db872",
  seniorliving_jp: "amzn1.ask.skill.5e0d3ba5-3e4f-4c83-8e24-0e6791451d8d",
  seniorliving_uk: "amzn1.ask.skill.a501f73e-aaf7-4d9b-a5b4-67c37b1bbabf",
  seniorliving_us: "amzn1.ask.skill.6a39c06f-58b4-4adb-8c7f-a75a9ca3f7e1"
};

function translateKeys(keys, lookup) {
  return keys.split(',').map(key => lookup[key.toLowerCase()] || key).join(',');
}

/// Skill Settings /////////////////////////////////////////////////

//get-skill-enablement
export async function getSkillEnablement(unitId, skillId) {

  skillId = translateKeys(skillId, skillLookup);

  const config = {
    method: 'get',
    url: `/v1/skills/${skillId}/enablements?unitId=${unitId}&expand=nameFreeInvocation`
  };
  
  const data = await getAPIResponse(config);
  return data;
}


//list-skill-enablements
export async function listSkillEnablements(unitId) {
  const config = {
    method: 'get',
    url: `/v1/skills/enablements?unitId=${unitId}&maxResults=10&expand=nameFreeInvocation`
  };

  const data = await getAPICombinedResults(config);
  return data;
}

//get-skill-enablement-for-multiple-units
export async function getSkillEnablementForMultipleUnits(unitids) {

  let i = 0;
  let items = unitids.split(',').map(unitid => new Object({
    "itemId": i++,
    "unitId": unitid
  }));

  const config = {
    method: 'post',
    url: `/v1/skills/enablements/batchGet`,
    data: {
      paginationContext: {
        maxResults: 10
      },
      items: items,
      "expand": ["nameFreeInvocation"]
    }
  };

  const data = await getAPICombinedResults(config);

  return data;
}



//enable-skill-for-unit
export async function enableSkillForUnit(skillId, unitId, stage="live",partitionName, linkRedirectUri,linkAuthCode, nfiLocales) {
  
  skillId = translateKeys(skillId, skillLookup);

  const config = {
    method: 'post',
    url: `/v1/skills/${skillId}/enablements`,
    data: {
      unitId: unitId,
      stage:stage
    }
  };

  if(partitionName) {
    config.data.partitionName = partitionName;
  }

  if (linkRedirectUri) {
    config.data.accountLinkRequest = new Object( 
      {
        "redirectUri": linkRedirectUri,
        "authCode": linkAuthCode,
        "type": "AUTH_CODE"
      }
    );
  }

  if (nfiLocales) {
    config.data.nameFreeInvocationRequest = new Object({"locales":nfiLocales.split(",")});
  }

  const data = await getAPIResponse(config);
  return data;
}

//enable-skill-for-multiple-units
//note: settings same for all units
export async function enableSkillForMultipleUnits(skillId, unitIds, stage="live", partitionName, linkRedirectUri, linkAuthCode, nfiLocales) {
  
  skillId = translateKeys(skillId, skillLookup);

  let itemTemplate = {"stage": stage, itemId:0};

  if(partitionName) { itemTemplate.partitionName = partitionName; }

  if (linkRedirectUri) {
    itemTemplate.accountLinkRequest = new Object( {
        "redirectUri": linkRedirectUri,"authCode": linkAuthCode,"type": "AUTH_CODE"
      });
  }

  if (nfiLocales) {itemTemplate.nameFreeInvocationRequest = new Object({"locales":nfiLocales.split(",")});}

  const config = {
    method: 'post',
    url: `/v1/skills/${skillId}/enablements/batch`,
    data: {
      items: []
    }
  };

  const data = await getBatchResults(config, itemTemplate, "unitId", unitIds.split(',') );
  return data;
}


//disable-skill-for-unit
export async function disableSkillForUnit(unitid, skillid, stage) {

  skillid = translateKeys(skillid, skillLookup);

  const config = {
    method: 'delete',
    url: `/v1/skills/${skillid}/enablements?unitId=${unitid}`,
  };

  if(stage) {
    config.url += `&stage=${stage}`;
  }

  const data = await getAPIResponse(config);
  return data;
}

//disable-skill-for-multiple-units
export async function disableSkillForMultipleUnits(skillid, unitIds, stage="live") {

  skillid = translateKeys(skillid, skillLookup);

  let i = 0;
  let itemTemplate = { "stage": stage, itemId:0};

  const config = {
    method: 'post',
    url: `/v1/skills/${skillid}/enablements/batchDelete`,
    data: {
      items: []
    }
  };

  const data = await getBatchResults(config, itemTemplate, "unitId", unitIds.split(',') );
  return data;

}