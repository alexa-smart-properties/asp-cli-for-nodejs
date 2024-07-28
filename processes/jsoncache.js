// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { getUnit} from '../utils/aspProperty.js';
import { getEndpoints,getEndpointConnectivity} from '../utils/aspEndpoints.js';
import { listSkillEnablements} from '../utils/aspSkills.js';
import { getCommunicationProfile, getAddressBook, listContacts, listAddressBooks, getContact } from '../utils/aspCommunications.js';


import { formatUnit, formatEndpoint, formatSkill, formatContact, ensureUnitInCache, ensureEndpointInCache
         ,getUnitById,getEndpointById,getEndpointsByUnitId,buildUnits,updateArrayByIds,updateArrayById,
        getUnitsByName,getUnitsByContains,getUnitsByType, getAddressBookById, getContactById, property} from './cacheHelpers.js';

export let isFromCacheAction = false;

export async function updateJSONCache(args, result, json, format="compact") {

  switch (args.action) {

    case "get-units":
      await ensureUnitInCache(json, args.parentid, format);
      var parentUnit = getUnitById(json, args.parentid, 1, "level"); 
      parentUnit["units"] = updateArrayByIds(result["results"], parentUnit["units"], format, formatUnit);
    break;
    case "create-unit":
      args.unitid = result.id;
    case "update-unit":
      result = await getUnit(args.unitid);
    case "get-unit":
      await ensureUnitInCache(json, args.unitid, format);
      var unit = getUnitById(json, args.unitid);
      Object.assign(unit, formatUnit( result, format));
      break;
    case "delete-unit":
      //TODO: add remove unit from cache fn
      // let unit = getUnitById(json, args.unitid);
      // if (unit)
      // {
      //   let parent = getUnitById(json, unit.parentid);
      // }
      // Object.assign(unit, formatUnit( result, format));
      break;
    case "get-endpoints":
      let targetNode = null;
      if (args.unitid)
      {
        await ensureUnitInCache(json, args.unitid, format);
        let parentUnit = getUnitById(json, args.unitid);
        parentUnit["endpoints"] = [];
        targetNode = property(parentUnit, "endpoints");
      }
      else
      {
        json["endpoints"] = [];
        targetNode = property(json, "endpoints");
      }
      
      targetNode.value = result["results"].map( 
              item => formatEndpoint(item, format) );
      break;

    case "get-endpoint":
        await ensureEndpointInCache(json, args.endpointid, format);
        var endpoint = getEndpointById(json, args.endpointid);
        Object.assign(endpoint, formatEndpoint(result, format));
        if (endpoint && json.endpoints)
        {
          let endpoints = json.endpoints;
          let updatedEndpoints = endpoints.filter((item) => item.id !== args.endpointid);
          json.endpoints = updatedEndpoints;
        }
        break;
    case "get-skill-enablement": 
        await ensureUnitInCache(json, args.unitid, format);
        let skillUnit = getUnitById(json, args.unitid);
        skillUnit.skills = updateArrayById(result, skillUnit.skills, format, formatSkill);

      break;
    case "get-skill-enablements": 
        await ensureUnitInCache(json, args.unitid, format);
        let skillsUnit = getUnitById(json, args.unitid);
        skillsUnit["skills"] = updateArrayByIds(result["items"], skillsUnit["skills"], format, formatSkill);
      break;
    case "get-skill-enablement-multiple-units": 
        let results = result["results"];
        for (let result of results) {
          let unitid = result.enablements[0].unit.id;
          await ensureUnitInCache(json, unitid, format);
          let skillsUnit = getUnitById(json, unitid);
          skillsUnit["skills"] = updateArrayByIds(result["enablements"], skillsUnit["skills"], format, formatSkill);
        }
        break;
    case "get-endpoint-connectivity":
        await ensureEndpointInCache(json, args.endpointid, format);
        var endpoint = getEndpointById(json, args.endpointid);
        if (result?.properties[0]?.timeOfSample) {
          endpoint.lastsampletime = new Date(result.properties[0].timeOfSample).toISOString();
        } else {
          endpoint.connectivity = "UNKNOWN";
          break;
        }
        endpoint.connectivity = result.properties[0].value.value;
        if(endpoint.connectivity === "OK") {
          endpoint.lastconnected = endpoint.lastsampletime;
        }
        break;
    case "update-cache":
      var startTime = performance.now()

      var includes = ["units"];
      if (args.include) {
        includes = args.include.split(",");
      }
      
      let propertyid = args.propertyid;
      if (includes.includes("units")){

        if (!propertyid)
        {
          throw new Error("propertyid required for caching units");
        }

        if (format !== "compact") {
          throw new Error("update-cache only supports compact format in this release");
        }

        json["units"] = [];
        let propertyUnit = await getUnit(propertyid);
        json.id = propertyUnit.parentId; //orgid
        json["units"].push(formatUnit(propertyUnit, format, "level"));
        json["units"][0] = await buildUnits(json["units"][0], propertyid, includes, format);
      }

      if (includes.includes("endpoints")){    
        json = await applyFuncUnitHierarchy(json, async (unit) => {
          var result = await getEndpoints(unit.id);
          if (result["results"]) {
            unit.endpoints = updateArrayByIds(result["results"], unit.endpoints, format, formatEndpoint);
          }
          console.log("Endpoints::" + unit.name + "::" + result["results"].length );
          return unit;
        });
        //unassigned endpoints
        let endpointsResult = await getEndpoints();
        if (endpointsResult["results"]) {
          json["endpoints"] = updateArrayByIds(endpointsResult["results"], json["endpoints"], format, formatEndpoint);
        }  
      }

      if (includes.includes("connectivity")){    
        json = await applyFuncUnitHierarchy(json, async (unit) => {
          
          if (unit.endpoints) {
            unit.endpoints = await Promise.all(unit.endpoints.map(async (endpoint) => {
                var result = await getEndpointConnectivity(endpoint.id);
                if (result.properties)
                { 
                  let date = new Date(result.properties[0].timeOfSample);
                  var endpointUpdate = {};
                  endpointUpdate.lastsampletime = new Date(result.properties[0].timeOfSample).toISOString();
                  endpointUpdate.connectivity = result.properties[0].value.value;
                  if(endpointUpdate.connectivity === "OK") {
                    endpointUpdate.lastconnected = endpointUpdate.lastsampletime;
                  }
                  console.log("Connectivity::" + endpoint.id + "::" + endpointUpdate.connectivity );
                }
                return {...endpoint, ...endpointUpdate};
              }
            ));
          }

          return unit;
        });
      }

      if (includes.includes("skills")){    
        json = await applyFuncUnitHierarchy(json, async (unit) => {

          var result = await listSkillEnablements(unit.id);
          if (result["items"]) {
            unit.skills = await Promise.all( result["items"].map(
              (item) => {
                let formattedSkill = formatSkill(item, format);
                console.log("Skill::" + formattedSkill.id + "::" + unit.name );
                return formattedSkill;
                }));
          }  
          return unit;
        });
      }

      if (includes.includes("profiles")){    
        json = await applyFuncUnitHierarchy(json, async (unit) => {

          var result = await getCommunicationProfile(null,unit.id);
          if (result["profileId"]) {
            unit.profile = {}
            unit.profile.id = result["profileId"].profileId;
            unit.profile.name = result["name"];
            console.log("Profile::" + result["name"] );
          } else {
            delete unit.profile;
          } 
          return unit;
        });
      }

      if (includes.includes("addressbooks")){    
        delete json.addressbooks;
        let result = await listAddressBooks();
        let addressbooks = [];
        for (let item of result.results) {
          let addressbook = {};
          addressbook.id = item.addressBookId;
          addressbook.name = item.name;
          addressbook.contacts = [];
          console.log("AddressBook::" + addressbook.name );
          let contacts = await listContacts(item.addressBookId);
          for (let item of contacts.results)
          {
            let contact = await getContact(addressbook.id, item.contactId);
            console.log("Contact::" + contact.contact.name );
            addressbook.contacts.push(formatContact(contact, format));
          }
          
          addressbooks.push(addressbook);
        }
        json.addressbooks = addressbooks;
      }
      
      var endTime = performance.now()
      console.log(`Caching took ${((endTime - startTime) /1000).toFixed(2) } seconds`)
      break;
    default:
      //  console.log(`${args.action} is not available for caching`);
      break;
  }
  
  return json;
}

export async function applyFuncUnitHierarchy(json, func) {

  if (json?.units) {
    for (let i = 0; i < json.units.length; i++) {
      json.units[i] = await func(json.units[i]);
      json.units[i] = await applyFuncUnitHierarchy(json.units[i], await func);
    }
  }
  return json;
}

export function getJSONCache(args, json) {

  switch (args.action) {
    case "get-units-from-cache":
      isFromCacheAction = true;
      var depth = 1;
      if (args.depth) {
        depth = parseInt(args.depth);
      }
      let unitsResult = {action: "get-units-from-cache", statuscode: 200};
      let parentUnit = null;
      if (args.contains) {
        parentUnit = {};
        parentUnit.units = getUnitsByContains({...json, name:"not set"}, args.contains,args.depth);
      } else if (args.name) {
        parentUnit = {};
        parentUnit.units = getUnitsByName({...json, name:"not set"}, args.name,args.depth);
      } else if (args.type) {
        parentUnit = {};
        parentUnit.units = getUnitsByType({...json, name:"not set"}, args.type,args.depth);
      } else if (args.parentid)
      {
        parentUnit = getUnitById(json, args.parentid, 1 + depth, "level");
      }

      if (parentUnit && parentUnit.units) {
        const flattenUnits = (units) => {
          let flattenedUnits = [];
          for (let unit of units) {
            flattenedUnits.push(unit);
            if (unit.units) {
              flattenedUnits = flattenedUnits.concat(flattenUnits(unit.units));
            }
          }
          return flattenedUnits;
        };

        parentUnit.units = flattenUnits(parentUnit.units);
      }

      if (parentUnit) {
        if (!parentUnit.units) {
          parentUnit.units = [];
        }
        unitsResult = {...unitsResult, units: parentUnit.units};
      } else
      {
        unitsResult = {...unitsResult, statuscode: 404, message: "Unit not found", parentid: args.parentid};
      }

      return unitsResult;

    case "get-unit-from-cache":
      isFromCacheAction = true;
      let result = {action: "get-unit-from-cache", statuscode: 200};
      var depth = 0;
      if (args.depth) {
        depth = parseInt(args.depth);
      }
      let unit = getUnitById(json, args.unitid, depth);
      if (unit) {
        json = {...result, ...unit};
      } else
      {
        json = {...result, statuscode: 404, message: "Unit not found"};
      }
      return json;

    case "get-endpoints-from-cache":
      isFromCacheAction = true;
      let endpoints = json.endpoints;
      if (args.unitid) {
        endpoints = getEndpointsByUnitId(json, args.unitid, args.manufacturer);
      }
      json = {action: "get-endpoints-from-cache","endpoints": endpoints};
      return json;

    case "get-endpoint-from-cache":
        isFromCacheAction = true;
        let endpointResult = {action: "get-endpoint-from-cache", statuscode: 200};
        var endpoint = getEndpointById(json, args.endpointid, args.serial);
        if (endpoint) {
          json = {...endpointResult, ...endpoint};
        } else
        {
          json = {...endpointResult, statuscode: 404, message: "Endpoint not found"};
        }
        return json;

    case "get-address-books-from-cache": 
        isFromCacheAction = true;
        let addressBooksResult = {action: "get-address-books-from-cache", statuscode: 200,"addressbooks": []};
        var addressbooks = json.addressbooks;
          if (addressbooks) {
            let justBooks = addressbooks.map((item) => { return {id: item.id, name: item.name};} );
            json = {...addressBooksResult, "addressbooks": justBooks};
          } else
          {
            json = {"addressbooks": [], statuscode: 404, message: "Address Books not found"};
          }
          return json;
    case "get-address-book-from-cache": 
        isFromCacheAction = true;
        let addressbookResult = {action: "get-address-book-from-cache", statuscode: 200};
        var addressbook = getAddressBookById(json, args.id, args.name);
        if (addressbook.length > 0) {
          json = {...addressbookResult, ...addressbook[0]};
        } else {
          json = {...addressbookResult, statuscode: 404, message: "Address Book not found"};
        }
      return json;
    case "get-contacts-from-cache": 
        isFromCacheAction = true;
        let contactsResult = {action: "get-contacts-from-cache", statuscode: 200};
        var addressbook = getAddressBookById(json, args.addressbookid, args.addressbookname);
        if (addressbook.length > 0) {
          json = {...contactsResult, ...addressbook[0].contacts};
        } else {
          json = {...contactsResult, statuscode: 404, message: "Address Book not found"};
        }
      return json;
    case "get-contact-from-cache":
      isFromCacheAction = true;
       let contactResult = {action: "get-contact-from-cache", statuscode: 200};
        var addressbook = getAddressBookById(json, args.addressbookid, args.addressbookname);
        if (addressbook.length > 0) {
          let contact = getContactById(addressbook[0], args.id, args.name, args.profileid);
          console.log(contact);
          if (contact.length > 0) {
            json = {...contactResult, ...contact[0]};
          } else
          {
            json = {statuscode: 404, message: "Contact not found"};
          }
        } else {
          json = {...contactResult, statuscode: 404, message: "Address Book not found"};
        }
      return json;
    default:
      throw new Error(`${args.action} is not available for caching`);
  }
    return json;
}



