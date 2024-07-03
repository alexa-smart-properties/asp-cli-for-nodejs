// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getAPICombinedResults, getBatchResults} from './asp-api-helpers.js';

// create-subscription-configuration
export async function createSubscriptionConfiguration(type='SNS', channeids, idempotencyToken = "1234567890") {
    
    const channels = channeids.split(',').map(channelid => ({ type, id: channelid }));

    const config = {
        method: 'post',
        url: '/v1/eventMessenger/subscriptionConfigurations'
        ,
        data: {
            "idempotencyToken": idempotencyToken,
            "deliveryChannels": channels
        }
    };

    const data = await getAPIResponse(config);
    return data;
}

// get-subscription-configuration
export async function getSubscriptionConfigurationById(configurationId) {
    const config = {
        method: 'get',
        url: `/v1/eventMessenger/subscriptionConfigurations/${configurationId}`
    };

    const data = await getAPIResponse(config);
    return data;
}

// get-subscription-configurations
export async function getSubscriptionConfigurations() {
    const config = {
        method: 'get',
        url: `/v1/eventMessenger/subscriptionConfigurations?owner=~caller&maxResults=100`
    };

    const data = await getAPICombinedResults(config);
    return data;
}

// delete-subscription-configuration
export async function deleteSubscriptionConfiguration(configurationId) {
    const config = {
        method: 'delete',
        url: `/v1/eventMessenger/subscriptionConfigurations/${configurationId}`
    };

    const data = await getAPIResponse(config);
    return data;
}

// create-subscription
export async function createSubscription(configurationId, eventNamespace, eventName, parentId = null, unitId = null, skillId = null, idempotencyToken = "1234567890") {
    const config = {
        method: 'post',
        url: '/v1/eventMessenger/subscriptions',
        data: {
            "subscriptionConfigurationId": configurationId,
            "eventType": {    
                "namespace":eventNamespace,
                "name":eventName 
              }
        }
    };

    console.log(unitId);

    let entities = {};

    switch (eventNamespace) {
        case "Alexa.Role.Management":
            entities.resource = { "type": "Resource", "resourceType": "Unit", "resourceId": unitId }
            break;
        case "Alexa.Enterprise.Subscription":
            entities.unit = { "parent": { "type": "Unit", "id": parentId } }
            break;
        case "Alexa.Enterprise.Endpoint.Activity":
            config.data.idempotencyToken = idempotencyToken;
            config.data.eventHeaderVersion = "V2";
            config.data.subscriptionDurationInSeconds = 3600;
        case "Alexa.Automation.Execution":
        case "Alexa.Endpoint.Lifecycle":
        case "Alexa.Skill.Interaction":
        case "Alexa.Enterprise.Endpoint":
            if (unitId) {
                entities.unit = { "type": "Unit", "id": unitId }
                if (parentId) {
                    entities.unit.parent = { "type": "Unit", "id": parentId }
                }
                if (skillId) {
                    entities.skill = { "type": "Skill", "id": skillId }
                }
            }
            break;
        }
        
    config.data.entities = entities;

    const data = await getAPIResponse(config);
    //console.log(parentId);
    console.log(JSON.stringify(config, null, 2));
    return data;
}

// get-subscription
export async function getSubscription(subscriptionId) {
    const config = {
        method: 'get',
        url: `/v1/eventMessenger/subscriptions/${subscriptionId}`
    };

    const data = await getAPIResponse(config);
    return data;
}

// get-subscriptions
export async function getSubscriptions(unitId, parentId, eventNamespace, eventName) {
    const config = {
        method: 'get',
        url: '/v1/eventMessenger/subscriptions?owner=~caller'
    };

    if (unitId) {
        config.url += `&entities.unit.id=${unitId}&entities.unit.type=Unit`;
    }   

    if (parentId) {
        config.url += `&entities.unit.parent.id=${parentId}&entities.unit.parent.type=Unit`;
    } 

    if (eventNamespace && eventName) {
        config.url += `&eventType.namespace=${eventNamespace}&eventType.name=${eventName}`;
    } 

    const data = await getAPICombinedResults(config);
    return data;
}

// delete-subscription
export async function deleteSubscription(subscriptionId) {
    const config = {
        method: 'delete',
        url: `/v1/eventMessenger/subscriptions/${subscriptionId}`
    };

    const data = await getAPIResponse(config);
    return data;
}