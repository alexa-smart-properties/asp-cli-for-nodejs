// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { getUnit, getUnits} from '../utils/aspProperty.js';
import { getEndpoints, getEndpoint } from '../utils/aspEndpoints.js';

export function cacheUnit(json, unit, format, type="unit") {
  if (!json["units"]) {
    json["units"] = [];
  }
  let parentUnit = getUnitById(json, unit.parentId);
  if (parentUnit) {
    if (!parentUnit.units) {
      parentUnit.units = [];
    }

    parentUnit.units.push(formatUnit(unit,format,type));
  } else {
    if (unit.level === 0) {
      //org level
      json.id = unit.id; 
    }
    else{
      json["units"].push(formatUnit(unit,format,type));
    }

    
  }
  return json;
}

export function formatUnit(unit, format, type="unit") {
  
  switch (format) {
    case "ids-only":
    case "compact":
            let formattedUnit = {"id": unit.id};//, parentid: item.parentId};
            if (format === "compact") 
            {
              formattedUnit = {...formattedUnit, "name": unit.name.value.text,type: type, level: unit.level};
            }
            return formattedUnit;
      break;
    default:
      return {...unit, type: type};
      break;
  }
}

export function formatEndpoint(endpoint, format) {
  
  switch (format) {
    case "ids-only":
    case "compact":
            let formattedEndpoint = {"id": endpoint.id}
            if (format === "compact") 
            {
              formattedEndpoint = {...formattedEndpoint, 
                    name: endpoint.friendlyName?.value?.text, 
                    model: endpoint.model?.value?.text, 
                    serial: endpoint.serialNumber?.value?.text,
                    manufacturer: endpoint.manufacturer?.value?.text,
                    associatedunits: endpoint.associatedUnits.map(unit => unit.id)};
            }
            return formattedEndpoint;
      break;
    default:
      return endpoint
      break;
  }
}

export function formatSkill(skill, format) {
  
  switch (format) {
    case "ids-only":
    case "compact":
            let formattedSkill = {"id": skill.skill.id}
            if (format === "compact") 
            {
              formattedSkill = {...formattedSkill, 
                    "stage": skill.skill.stage, 
                    "status": skill.status
                    ,"unit": skill.unit.id
              };
            }
            return formattedSkill;
      break;
    default:
      return skill
      break;
  }
}

export function getUnitById(obj, id, depth) {

  if (obj.id === id) {
    if (depth !== null) {trimUnitsByDepth(obj, depth);}
    return obj;
  } else if (obj.units) {
    for(let i = 0; i < obj.units.length; i++) {
      let result = getUnitById(obj.units[i], id, depth);
      if (result != null) {
        return result;
      }

    }
  }
  return null;
}

export function getUnitsByName(obj, name, depth=0) {
  let results = [];
  if (obj.name === name) {
    trimUnitsByDepth(obj, depth);
    results.push(obj);
  } 
  if (obj.units) {
    for(let i = 0; i < obj.units.length; i++) {
      results = results.concat(getUnitsByName(obj.units[i], name, depth));
    }
  }
  return results;
}

export function getUnitsByContains(obj, containText, depth=0) {
  let results = [];
  if (obj.name.includes(containText)) {
    trimUnitsByDepth(obj, depth);
    results.push(obj);
  } 

  if (obj.units) {
    for(let i = 0; i < obj.units.length; i++) {
      results = results.concat(getUnitsByContains(obj.units[i], containText, depth));
    }
  }
  return results;
}

export function getUnitsByType(obj, type, depth=0) {
  let results = [];
  if (obj.type === type) {
    trimUnitsByDepth(obj, depth);
    results.push(obj);
  } 
  if (obj.units) {
    for(let i = 0; i < obj.units.length; i++) {
      results = results.concat(getUnitsByType(obj.units[i], type,depth));
    }
  }
  return results;
}

export function trimUnitsByDepth(obj, depth) {
  if (depth === 0) {
    delete obj.units;
  } else if (obj.units) {
    for(let i = 0; i < obj.units.length; i++) {
      trimUnitsByDepth(obj.units[i], depth - 1);
    }
  }
}

//only works with compact format and assigned units
export function getEndpointById(obj, endpointid, serialNumber) {

  //org level
  if (obj && obj["endpoints"]) {
    let result = null;
    if (serialNumber) {
      result = obj["endpoints"].find(item => item.serial === serialNumber);
    }
    else
    {
      result = obj["endpoints"].find(item => item.id === endpointid);
    }
    if (result != null) {
      return result;
    } 
  } 

  if (obj && obj.units) {
    for(let i = 0; i < obj.units.length; i++) {
      let result = getEndpointById(obj.units[i], endpointid, serialNumber);
      if (result != null) {
        return result;
      }
    }
  }
  return null;
}

export function getEndpointsByUnitId(obj, unitid, manufacturer) {
  if (obj.id === unitid && obj["endpoints"]) {
    return obj["endpoints"];
  } 

  if (obj && obj.units) {
    for(let i = 0; i < obj.units.length; i++) {
      let result = getEndpointsByUnitId(obj.units[i], unitid);
      
      if (manufacturer && result != null) {
        result = result.filter(item => item.manufacturer === manufacturer);
      }
      if (result != null) {
        return result;
      }
    }
  }
  return null;
}

export function property(object, prop) {
  return {
      get value () {
          return object[prop]
      },
      set value (val) {
          object[prop] = val;
      }
  };
}

export async function buildUnits(json, parentid, includes, format) {
    
    json.type = "level";
    let result = await getUnits(parentid);

    if (result.status === 404) {
      throw new Error("INVALID_UNIT_ID::" + parentid);
    }
    let units = result.results;
    if (units.length === 0) {
      json.type = "unit";
      return json;
    }

    json.units = [];
    for (let unit of units) {
      let formattedUnit = formatUnit(unit, format);
      let length = json.units.push(formattedUnit);
      console.log("Adding unit::" + formattedUnit.id + "::" + unit.name.value.text );
      json.units[length - 1] = await buildUnits(json.units[length - 1], unit.id, includes, format);
    }
    return json;
  }

  export async function getUncachedHierarchy(json, parentid) {
  let parentHierarchy = [];
  let parentId = parentid;
  
  while (parentId) {
    let unit = getUnitById(json, parentId);
    if (!unit) {
      unit = await getUnit(parentId);
      unit.fromcache = false;
    } else
    {
      return parentHierarchy;
    }
    if (unit) {
      parentHierarchy.push(unit);
      parentId = unit.parentId;
      if (unit.level === 0) {
        parentId = null;
      }
    } else {
      parentId = null;
    }
  }
  return parentHierarchy;
}

export async function ensureUnitInCache(json, unitid, format) {
  let array = await getUncachedHierarchy(json, unitid);

  for (let i = array.length - 1; i > -1; i--) {
    cacheUnit(json, array[i], format, i === 0 ? "unit" : "level");
  }
}

export async function ensureEndpointInCache(json, endpointid, format) {
  let endpoint = getEndpointById(json, endpointid);
  if (!endpoint) {
    endpoint = await getEndpoint(endpointid);
    if (endpoint) {
      await ensureUnitInCache(json, endpoint.associatedUnits[0].id, format);
      json = getUnitById(json, endpoint.associatedUnits[0].id);
      json.endpoints = json.endpoints || [];
      json.endpoints.push(formatEndpoint(endpoint, format));
    }
  }
}

export function updateArrayByIds(sourceArray, targetArray=[], format, formatFunction) {

  console.log("updateArrayByIds::format::" + format);
  let resultIds = sourceArray.map(item => item.id);
  let cacheIds = targetArray.map(item => item.id);
  let removedIds = cacheIds.filter(id => !resultIds.includes(id));

  for (let item of sourceArray) { 
    let entity = formatFunction(item, format); 
    if (!targetArray.find(item => item.id === item.id)) {
      targetArray.push(entity);
    } else
    {
      targetArray = targetArray.map(destItem => destItem.id === entity.id ? {...destItem, ...entity} : entity);
    }
  }
  return targetArray.filter(item => !removedIds.includes(item.id));
}

export function updateArrayById(item, targetArray, format, formatFunction) {

  targetArray = targetArray || [];
  let entity = formatFunction(item, format); 
  let targetItem = targetArray.find(target => target.id === entity.id);
  if (targetItem) {
    targetArray = targetArray.map(item => item.id === entity.id ? {...item, ...entity} : item);
  } else {
    targetArray.push(entity);
  }
  
  return targetArray;
}


