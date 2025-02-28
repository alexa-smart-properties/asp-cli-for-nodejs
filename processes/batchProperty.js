// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { getUnitById } from './cacheHelpers.js';

import * as aspEndpoints from '../utils/aspEndpoints.js';
import * as aspSkills from '../utils/aspSkills.js';
import * as aspUnitSettings from '../utils/aspUnitSettings.js';
import * as aspNotifications from '../utils/aspNotifications.js';


export async function useJSONCache() {

    let batchUnitIdsMax = 100;

    let propertyCache = arguments[1];
    let args = arguments[0];

    let propertyBase = getUnitById(propertyCache, args.propertyid, null, "level");

    if (! propertyBase || propertyBase.level < 1) 
    {
        console.log(JSON.stringify({"action": "update-property", "statuscode": 500, "message": "Property Id is not valid", "propertyid": args.propertyid}, null, 2));
        return;
    }
    var startTime = performance.now()
     function getPerfTime() {
        var endTime = performance.now()
        return ((endTime - startTime) /1000).toFixed(2);
    }
    

     switch (args.apply) {
        case 'delete-all-alarms':
            console.log(`{"apply":"${args.apply}", "results":[`);
            for (let unitid of getUnitIds(propertyBase)) {
                var data = await aspUnitSettings.deleteAllAlarms(unitid);
                var output = { statuscode: data.statuscode, unitid : unitid};
                console.log(JSON.stringify(output, null, 2) + ",");
            }
             console.log(`{}], "time": ${getPerfTime()}}`);

            break;
        case 'delete-all-reminders': {
                console.log(`{"apply":"${args.apply}", "results":[`);
                for (let unitid of getUnitIds(propertyBase)) {
                    var data = await aspUnitSettings.deleteAllReminders(unitid);
                    var output = { statuscode: data.statuscode, unitid : unitid};
                    console.log(JSON.stringify(output, null, 2) + ",");
                }
                console.log(`{}], "time": ${getPerfTime()}}`);
                break;
            }
        case 'delete-all-timers': {
                console.log(`{"apply":"${args.apply}", "results":[`);
                for (let unitid of getUnitIds(propertyBase)) {
                    var data = await aspUnitSettings.deleteAllTimers(unitid);
                    var output = { statuscode: data.statuscode, unitid : unitid};
                    console.log(JSON.stringify(output, null, 2) + ",");
                }
                console.log(`{}], "time": ${getPerfTime()}}`);
                break;
            }
        case 'delete-all-notifications': {
                var unitids = getUnitIds(propertyBase);
                console.log(`{"apply":"${args.apply}", "results":[`);
                while (unitids.length > 0) {
                    let batchUnitIds = unitids.splice(0, batchUnitIdsMax);
                    var data = await aspNotifications.deleteAllNotifications(batchUnitIds.join(","),null, args.type);
                    var output = {statuscode: data.statuscode, unitids: batchUnitIds};
                    console.log(JSON.stringify(output, null, 2) + ",");
                }
                console.log(`{}], "time": ${getPerfTime()}}`);
                break;
            }
        case 'set-default-music-station': {
                console.log(`{"apply":"${args.apply}", "results":[`);
                for (let unitid of getUnitIds(propertyBase)) {
                    var data = await aspUnitSettings.setDefaultMusicStation(unitid, args.providerid, args.stationid);
                    var output = { statuscode: data.statuscode, unitid : unitid};
                    console.log(JSON.stringify(output, null, 2) + ",");
                }
                console.log(`{}], "time": ${getPerfTime()}}`);
                break;
            }
        case  'enable-skills-for-unit':
            var skillids = args.skillids.split(",");

            console.log(`{"apply":"${args.apply}", "results":[`);

            for(const skillid of skillids) {
                var unitids = getUnitIds(propertyBase);

                while (unitids.length > 0) {
                    let batchUnitIds = unitids.splice(0, batchUnitIdsMax);
                    var data = await aspSkills.enableSkillForMultipleUnits(skillid,batchUnitIds.join(","), args.stage, args.partition, args.linkredirecturi,args.linkauthcode, args.nfilocales);
                    var output = {statuscode: data.statuscode, skillid:skillid, unitids: batchUnitIds};
                    console.log(JSON.stringify(output, null, 2) + ",");
                }
            };
             console.log(`{}], "time": ${getPerfTime()}}`);
            break;
        case  'disable-skills-for-unit':
                var skillids = args.skillids.split(",");
                console.log(`{"apply":"${args.apply}", "results":[`);
                
                for (const skillid of skillids) {
                    var unitids = getUnitIds(propertyBase);
                    while (unitids.length > 0) {
                        let batchUnitIds = unitids.splice(0, batchUnitIdsMax);
                        var data = await aspSkills.disableSkillForMultipleUnits(skillid,batchUnitIds.join(","), args.stage);
                        var output = {statuscode: data.statuscode, skillid:skillid, unitids: batchUnitIds};
                        console.log(JSON.stringify(output, null, 2) + ",");
                    }
                };
                 console.log(`{}], "time": ${getPerfTime()}}`);
                break;
        case  'set-menu-icon':
            console.log(`{"apply":"${args.apply}", "results":[`);
            var unitids = getUnitIds(propertyBase);
            
            for (let unitid of unitids) {
                var data = await aspUnitSettings.setMenuIcon(unitid, args.icon, args.value);
                var output = {statuscode: data.statuscode, unitid: unitid, icon: args.icon, value: args.value};
                console.log(JSON.stringify(output, null, 2) + ",");
            }

            console.log(`{}], "time": ${getPerfTime()}}`);
            break;
        case 'endpoint-setting':
            console.log(`{"apply":"${args.apply}", "setting": ${args.setting}, "results":[`);
            for (let endpointid of getEndpointIds(propertyBase, args.manufacturer)) {

                var data = await aspEndpoints.putEndpointSetting(endpointid,args.setting, args.value);
                var output = { statuscode: data.statuscode, endpointid : endpointid};
                if (data.message)
                {
                    output.message = data.message;
                }
                console.log(JSON.stringify(output, null, 2) + ",");
            }
            console.log("]}");

            break;
        case 'endpoint-feature':
            console.log(`{"apply":"${args.apply}", "feature": "${args.feature}", "results":[`);
            
            for (let endpointid of getEndpointIds(propertyBase, args.manufacturer)) {
                var data;
            
                switch (args.feature) {
                    case "brightness":
                        data = await aspEndpoints.setBrightness(endpointid,args.operation, args.value);
                        break;
                    case "color":
                        data = await aspEndpoints.setEndpointColor(endpointid,args.hsb, args.hue, args.saturation, args.brightness);
                        break; 
                    case "color-temperature":
                        data = await aspEndpoints.setColorTemperature(endpointid,args.operation, args.value);
                        break;
                    case "power-state":
                        data = await aspEndpoints.setPowerState(endpointid, args.operation);
                        break;
                    case "speaker-properties":
                        data = await aspEndpoints.setSpeakerProperties(endpointid,args.operation, args.value);
                        break;
                    case "address":
                        data = await aspEndpoints.postEndpointAddress(endpointid, args.addressline1, args.addressline2, 
                            args.addressline3, args.city, args.stateorregion, args.districtorcounty, args.postalcode, args.countrycode);
                        break;
                    default:
                        console.log({action: "update-property", statuscode: 500, message: "Unknown --feature", feature: args.feature});
                }

                var output = { statuscode: data.statuscode, endpointid : endpointid};
                if (data.message)
                {
                    output.message = data.message;
                }

                console.log(JSON.stringify(output, null, 2) + ",");
            }
             console.log(`{}], "time": ${getPerfTime()}}`);
            break;
        case 'notification':
            
            var unitids = getUnitIds(propertyBase);

            console.log(`{"apply":"${args.apply}", "results":[`);
            while (unitids.length > 0) {
                let batchUnitIds = unitids.splice(0, batchUnitIdsMax);
                var data = await aspNotifications.sendNotification(batchUnitIds.join(","), null, args.type, args.text, args.locale,args.template, 
                args.headertext, args.primarytext, args.secondarytext, args.tertiarytext, args["hinttext"], args.attributiontext, args.ratingtext, args.rating,
                args.background,args.thumbnail,args.attributionimage, args.coloroverlay, args.dismissaltime, args.dismissalhours, args.dismissalminutes);
                console.log(JSON.stringify(data, null, 2) + ",");
            }
             console.log(`{}], "time": ${getPerfTime()}}`);
            break;
        default:
            console.log({action: "update-property", statuscode: 500, message: "Unknown --apply", apply: args.apply});
            break;
    }
    
}


function getUnitIds(obj) {
    let unitIds = [];
    function traverse(obj) {
        if (obj.type === 'unit') {
            unitIds.push(obj.id);
        }
        if (obj.units && obj.units.length > 0) {
            obj.units.forEach(unit => {
                traverse(unit);
            });
        }
    }
    traverse(obj);
    return unitIds;
}

function getEndpointIds(obj, manufacturer) {
    let endpointIds = [];
    function traverse(obj) {
        if (obj.type === 'unit') {
            
            if (obj.endpoints && obj.endpoints.length > 0) {
                obj.endpoints.forEach(endpoint => {
                    if (manufacturer && endpoint.manufacturer !== manufacturer) {
                        return;
                    }
                    endpointIds.push(endpoint.id);
                });
            }
        }
        if (obj.units && obj.units.length > 0) {
            obj.units.forEach(unit => {
                traverse(unit);
            });
        }
    }
    traverse(obj);
    return endpointIds;
}


