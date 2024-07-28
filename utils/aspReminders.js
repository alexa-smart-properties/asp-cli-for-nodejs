// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getAPICombinedResults, getBatchResults} from './asp-api-helpers.js';


// create-reminder
export async function createReminder(endpointids, requestTime, offsetInSeconds, scheduledTime, startDateTime, endDateTime, recurrenceRules, timeZoneId = null, locale = "en-US", text, ssml = null, pushNotificationStatus) {
    
    let recipients = endpointids.split(',').map(key => {return {"type": "Endpoint","id": key}});

    if (!ssml) { 
        ssml = `<speak>${text}</speak>`
    }

    let trigger = {
        "type": offsetInSeconds ? "SCHEDULED_RELATIVE" : "SCHEDULED_ABSOLUTE"
    }

    if (trigger.type === "SCHEDULED_ABSOLUTE") {
        trigger.scheduledTime = scheduledTime;
    } else
    {
        trigger.offsetInSeconds = offsetInSeconds;
    }
    if (timeZoneId) { trigger.timeZoneId = timeZoneId; }

    if (recurrenceRules)
    {
        let recurrence  = {
                "recurrenceRules": [
                    recurrenceRules
                ]
            }
        if (startDateTime) {recurrence.startDateTime = startDateTime;}
        if (endDateTime) {recurrence.endDateTime = endDateTime;}
        trigger.recurrence = recurrence;
    }

    const config = {
        method: 'post',
        url: '/v2/alerts/reminders',
        data: {
            "recipients": recipients,
            "requestTime": requestTime,
            "reminder": {
                "trigger": trigger,
                "alertInfo": {
                    "spokenInfo": {
                        "content": [{
                            "locale": locale,
                            "text": text,
                            "ssml": ssml
                        }]
                    }
                }
            }  
        }
    };

    const data = await getAPIResponse(config);
    return data;
}

// delete-reminder
export async function deleteReminder(reminderId) {
    const config = {
        method: 'delete',
        url: `/v2/alerts/reminders/${reminderId}`
    };

    const data = await getAPIResponse(config);
    return data;
}

// get-reminder
export async function getReminder(alertToken) {
    const config = {
        method: 'get',
        url: `/v2/alerts/reminders/${alertToken}`
    };

    const data = await getAPIResponse(config);
    return data;
}


// get-reminders
export async function getReminders(endpointId) {
    const config = {
        method: 'get',
        url: `/v2/alerts/reminders?recipient.id=${endpointId}&recipient.type=Endpoint&owner=~caller`
    };
    const data = await getAPIResponse(config);
    return data;
}

// update-reminder
export async function updateReminder(reminderId, endpointid, requestTime, offsetInSeconds, scheduledTime, startDateTime, endDateTime, recurrenceRules, timeZoneId = null, locale = "en-US", text, ssml = null, pushNotificationStatus) {
    
    let recipient = {"type": "Endpoint","id": endpointid};

    if (!ssml) { 
        ssml = `<speak>${text}</speak>`
    }

    let trigger = {
        "type": offsetInSeconds ? "SCHEDULED_RELATIVE" : "SCHEDULED_ABSOLUTE"
    }

    if (trigger.type === "SCHEDULED_ABSOLUTE") {
        trigger.scheduledTime = scheduledTime;
    } else
    {
        trigger.offsetInSeconds = offsetInSeconds;
    }
    if (timeZoneId) { trigger.timeZoneId = timeZoneId; }

    if (recurrenceRules)
    {
        let recurrence  = {
                "recurrenceRules": [
                    recurrenceRules
                ]
            }
        if (startDateTime) {recurrence.startDateTime = startDateTime;}
        if (endDateTime) {recurrence.endDateTime = endDateTime;}
        trigger.recurrence = recurrence;
    }

    const config = {
        method: 'put',
        url: `/v2/alerts/reminders/${reminderId}`,
        data: {
            "recipient": recipient,
            "requestTime": requestTime,
            "reminder": {
                "trigger": trigger,
                "alertInfo": {
                    "spokenInfo": {
                        "content": [{
                            "locale": locale,
                            "text": text,
                            "ssml": ssml
                        }]
                    }
                }
            }  
        }
    };

    const data = await getAPIResponse(config);
    return data;
}