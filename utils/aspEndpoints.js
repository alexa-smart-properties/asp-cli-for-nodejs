// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse,getAPICombinedResults} from './asp-api-helpers.js';

function translateKeys(keys, lookup) {
  return keys.split(',').map(key => lookup[key.toLowerCase()] || key).join(',');
}

/// Endpoints /////////////////////////////////////////////////

// get-endpoints
export async function getEndpoints(unitId = null , manufacturer = null) {
  const config = {
    method: 'get',
    url: '/v2/endpoints?owner=~caller&expand=all'
  };

  if (unitId) {
    config.url = `/v2/endpoints?associatedUnits.id=${unitId}&expand=all`;
  }

  const data = await getAPICombinedResults(config);
  if (manufacturer && data.results) {
    data.results = data.results.filter(item => item.manufacturer?.value.text === manufacturer);
  }
  return data;
}

export async function getEndpoint(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}?expand=all`
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function queryEndpoints(query, expand) {
  const config = {
    method: 'post',
    url: '/v2/endpointQuery',
    data: { "query": JSON.parse(query) }
    };

    if (expand) config.data.expand = expand.split(',');

    config.data["paginationContext"] = {};

    const data = await getAPICombinedResults(config);
    return data;

}

//update-endpoint-name
export async function updateFriendlyName(endpointId, name) {
  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/friendlyName`,
    data: {
      "type": "PLAIN",
      "value": {
        "text": name
      }
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function associateUnit(endpointId, unitId) {
  const config = {
    method: 'put',
    url: `/v2/endpoints/${endpointId}/associatedUnits`,
    data: [
      {
        "id": `${unitId}`
      }
    ]
  };
  const data = await getAPIResponse(config);
  return data;
}

export async function disassociateUnit(endpointId) {
    const config = {
      method: 'put',
      url: `/v2/endpoints/${endpointId}/associatedUnits`,
      data: [
        {
          "id": "~caller.defaultUnitId"
        }
      ]
    };

  const data = await getAPIResponse(config);
  return data;
}

export async function deregisterEndpoint(endpointId) {
  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/deregister`
  };

const data = await getAPIResponse(config);
return data;
}


export async function forgetEndpoint(endpointId) {
  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/forget`
  };

const data = await getAPIResponse(config);
return data;
}


////// Endpoint Features ///////////////////////////////////////////

export async function getEndpointConnectivity(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/connectivity`
  };
  const data = await getAPIResponse(config);
  return data;
}

export async function getBrightness(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/brightness`
  };

  const data = await getAPIResponse(config);
  return data;
}

const brightnessLookup = {set:"setBrightness",
  adjust:"adjustBrightness"
};

export async function setBrightness(endpointId, operation="set", value ) {
  
  operation = translateKeys(operation, brightnessLookup);
  let operationName = operation === "setBrightness" ? "brightness" : "brightnessDelta";
  
  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/features/brightness/${operation}`,
      data: {
        "payload": { }
    }
  };
  config.data.payload[operationName] =  Number.parseInt(value)

  const data = await getAPIResponse(config);

  return data;
}

export async function getEndpointColor(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/color`
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function setEndpointColor(endpointId, hsb, hue, saturation, brightness) {
  
  if (hue !== undefined) {
    hsb = [];
    hsb[0] = hue;
    hsb[1] = saturation;
    hsb[2] = brightness;
  } else {
    hsb = hsb.split(',');
  }

  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/features/color/setColor`,
      data: {
        "payload": {
              "color": {
                "hue": Number.parseFloat(hsb[0]),
                "saturation": Number.parseFloat(hsb[1]),
                "brightness": Number.parseFloat(hsb[2])
            }
         }
    }
  };
  
  const data = await getAPIResponse(config);
  return data;
}

export async function getColorTemperature(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/colorTemperature`
  };

  const data = await getAPIResponse(config);
  return data;
}

const colorTemperatureLookup = {set:"setColorTemperature",
  increase:"increaseColorTemperature",
  decrease:"decreaseColorTemperature"
};

export async function setColorTemperature(endpointId, operation="set", value) {
  
  operation = translateKeys(operation, colorTemperatureLookup);

  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/features/colorTemperature/${operation}`,
  };

  if (operation === "setColorTemperature") {
    config.data = {
      "payload": {
        "colorTemperatureInKelvin": Number.parseInt(value)
      }
    };
  }


  
  const data = await getAPIResponse(config);
  return data;
}


export async function getPowerState(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/power`
  };

  const data = await getAPIResponse(config);
  return data;
}

const powerStateLookup = {on:"turnOn",
  off:"turnOff"
};

export async function setPowerState(endpointId, operation="on") {
  
  operation = translateKeys(operation, powerStateLookup);

  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/features/power/${operation}`,
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function getSpeakerProperties(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/speaker`
  };

  const data = await getAPIResponse(config);
  return data;
}

const speakerLookup = {set:"setVolume",
  adjust:"adjustVolume"
};

export async function setSpeakerProperties(endpointId, operation="set", value ) {
  
  operation = translateKeys(operation, speakerLookup);
  let operationName = operation === "setVolume" ? "volume" : "volumeDelta";
  
  const config = {
    method: 'post',
    url: `/v2/endpoints/${endpointId}/features/speaker/${operation}`,
      data: {
        "payload": { }
    }
  };
  config.data.payload[operationName] =  Number.parseInt(value)

  const data = await getAPIResponse(config);
  return data;
}

export async function getTemperature(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/temperatureSensor`
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function getThermostat(endpointId) {
  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/features/thermostat`
  };

  const data = await getAPIResponse(config);
  return data;
}


////// endpoint settings ///////////////////////////////////////////

const settingsLookup = {donotdisturb:"Alexa.DoNotDisturb.doNotDisturb",
  locales:"System.locales",
  wakewords:"SpeechRecognizer.wakeWords",
  wakewordconfirmation:"SpeechRecognizer.wakeWordConfirmation",
  speechconfirmation:"SpeechRecognizer.speechConfirmation",
  followup:"SpeechRecognizer.FollowUp.mode",
  temperatureunit:"System.temperatureUnit",
  distanceunits:"System.distanceUnits",
  closedcaptions:"Accessibility.Captions.ClosedCaptions.enablement",
  alexacaptions:"Accessibility.Captions.AlexaCaptions.enablement",
  magnifier:"Accessibility.Display.Magnifier.enablement",
  colorinversion:"Accessibility.Display.ColorInversion.enablement",
  timezone:"System.timeZone",
  speakingrate:"SpeechSynthesizer.speakingRate",
  errorsuppression:"Alexa.ManagedDevice.Settings.errorSuppression",
  maximumvolume:"Alexa.ManagedDevice.Settings.maximumVolumeLimit",
  timeformat:"Alexa.DataFormat.Time.timeFormat",
  address:"address",
  screencontrollerpolicy:"Alexa.ScreenController.screenControllerPolicy"

};


export function getSettingKeyByValue(value) {
  return Object.keys(settingsLookup).find(key => settingsLookup[key] === value);
}

export async function getEndpointSettings(endpointId, keys) {

  keys = translateKeys(keys, settingsLookup);

  const config = {
    method: 'get',
    url: `/v2/endpoints/${endpointId}/settings?keys=${keys}`
  };

  const data = await getAPICombinedResults(config, "settings");
  return data;
}



  export async function putEndpointSetting(endpointId, setting, value, oldValue) {
    const config = {
      method: 'put',
      url: `/v2/endpoints/${endpointId}/settings/`
    };

    setting = translateKeys(setting, settingsLookup);

    config.url = `${config.url}${setting}`;

    switch (setting) {
      case 'Alexa.DoNotDisturb.doNotDisturb':
        //bool
        config.data = value;
        break;
      case 'System.locales':
        config.data = value.split(',');
        break;
      case 'SpeechRecognizer.wakeWords':
        //Valid values: ALEXA, AMAZON, COMPUTER, ECHO
        config.data =  value.split(',');
        break;
      case 'SpeechRecognizer.wakeWordConfirmation':
        //Valid values: TONE or NONE
        config.data = value;
        break;
      case 'SpeechRecognizer.speechConfirmation':
        //Valid values: TONE or NONE
        config.data = value;
        break;
      case 'SpeechRecognizer.FollowUp.mode':
        //Valid values: bool
        config.data = value;
        break;
      case 'Alexa.ManagedDevice.Settings.errorSuppression':
        //Valid values: "CONNECTIVITY".
        config.data = value.split(',');
        break;
        //Valid values: 0–100
      case "Alexa.ManagedDevice.Settings.maximumVolumeLimit":
        config.data = value;
        break;
      case 'System.temperatureUnit':
        //Valid values: "CELSIUS" or "FAHRENHEIT"
        config.data =  value;
        break;
      case 'System.distanceUnits':
        //Valid values: "METRIC" or "IMPERIAL".
        config.data = value;
       
        break;
      case 'Accessibility.Display.Magnifier.enablement':
        //Valid values: "ENABLED" or "DISABLED".
        config.data = value;
        break;
      case 'Accessibility.Captions.ClosedCaptions.enablement':
        //Valid values: "ENABLED" or "DISABLED".
        config.data = value;
        break;
      case 'Accessibility.Captions.AlexaCaptions.enablement':
        //Valid values: "ENABLED" or "DISABLED".
        config.data = value;
        break;
      case 'Accessibility.Display.ColorInversion.enablement':
        //Valid values: "ENABLED" or "DISABLED".
        config.data = value;
        break;
      case "Alexa.DataFormat.Time.timeFormat":
        //Valid values: 12_HOURS, 24_HOURS
        config.data = value;
        break;
      case 'System.timeZone':
        config.data = value;
        break;
      case 'SpeechSynthesizer.speakingRate':
        //Valid values: [0.75, 0.85, 1, 1.25, 1.5, 1.75, 2]
        config.data = value;
        break;
      case 'Alexa.ScreenController.screenControllerPolicy':
        value = JSON.parse(value);
        if (!oldValue) {
          oldValue = {};
        }
        config.data = {...oldValue, ...value};
        break;
      default:
        console.log('Invalid setting');
    }

    const data = await getAPIResponse(config);

    return data;
  }

  export async function getEndpointAddress(endpointId) {
    const config = {
      method: 'get',
      url: `/v2/endpoints/${endpointId}/settings/address`,
      headers: {
        'Host': 'api.amazonalexa.com',
        'Accept': 'application/json'
      }
    };
  
    const data = await getAPIResponse(config);
    return data;
  }
  
    export async function postEndpointAddress(endpointId, addressLine1, addressLine2 = "", addressLine3 = "", city = "", stateOrRegion = "", districtOrCounty = "", postalCode = "", countryCode = "") {
      const config = {
        method: 'post',
        url: `/v2/endpoints/${endpointId}/settings/address`,
        headers: {
          'Host': 'api.amazonalexa.com',
          'Accept': 'application/json'
        },
        data: {
          address: {
            "addressLine1": addressLine1,
            "addressLine2": addressLine2,
            "addressLine3": addressLine3,
            "city": city,
            "stateOrRegion": stateOrRegion,
            "districtOrCounty": districtOrCounty,
            "postalCode": postalCode.toString(),
            "countryCode": countryCode
          }
        }
      };

      const data = await getAPIResponse(config);
      return data;
    }



