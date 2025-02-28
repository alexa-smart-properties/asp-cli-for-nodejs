// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import axios from 'axios';

//const cancelTokenSource = axios.CancelToken.source();

export const apiSettings = 
{
  orgid :"",
  apiDelay : 10,
  baseURL : 'https://api.amazonalexa.com',
  authToken : "",
  backoff: "2000,3000,5000,8000,13000,21000",
  maxBatchIds: 100,
  maxResults: 10,
  includeApiCall: false,
  noCall: false // prevents api calls and just returns config
}

function apiCallDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let backoff;

export async function getAPIResponse(config, backoffIndex) {

  if (apiSettings.noCall) {return {data:{apicall:config}}}

  if (backoffIndex === undefined && apiSettings.backoff.length > 0) {
    backoff = apiSettings.backoff.split(',');
    backoffIndex = 0;
  }

  let res = null;
  try {
    res = await axios(config);
    await apiCallDelay(apiSettings.apiDelay);
    if (res.data) {
      res.data.statuscode = res.status;
      if (apiSettings.includeApiCall) {res.data.apicall = config;}
      return res.data;
    }
    let defaultOutput = {statuscode: res.status};
    if (apiSettings.includeApiCall) {defaultOutput.apicall = config;}
    return defaultOutput;
  } catch (err) {
    
    if (err.response?.status)
    {
      //429 TOO_MANY_REQUESTS
      if ([503,500,429].includes(err.response.status)) {
        if (backoffIndex < backoff.length) {
          await apiCallDelay(backoff[backoffIndex]);
          return getAPIResponse(config, backoffIndex + 1);
        }
      }
      res = err.response.data;
      res.statuscode = err.response.status;
    } else if (err.response && (typeof err.response.data) === 'string') {
      // api does not return json data
      res = { statuscode : err.response.status};
    } 
      else 
    {
      res = { code : err.code};
    }

    return res;
  } 
}

export async function getAPICombinedResults(config,arrayName="results") {
  
  let nextToken = null;
  let combinedData = null;
  let urlWithoutToken = config.url;

  do {
    if (nextToken) {
      if (config.method === 'post') {
        config.data.paginationContext = {maxResults: apiSettings.maxResults, nextToken: nextToken};
      } else {
        config.url = urlWithoutToken + `&nextToken=${nextToken}`;
      }
    }
    const response = await getAPIResponse(config);
    if (response.statuscode > 299) {  
      return response;
    }

    if (!combinedData) {
      combinedData = response;
    } else {
      combinedData[arrayName] = [...combinedData[arrayName],...response[arrayName]];
    }
    if (!response.paginationContext)
    {
      break;
    }
    nextToken = response.paginationContext.nextToken;
  } while (nextToken);

  delete combinedData.paginationContext;
  return combinedData;
}

export async function getBatchResults(config, itemtemplate, idName="id", ids, arrayName="items") {
  
  let combinedData = null;

  while (ids.length > 0) {
    let batchIds = ids.splice(0, apiSettings.maxBatchIds);
    
    let i = 0;
    var items = batchIds.map(id => {
      let item = { ...itemtemplate, [idName]: id};
      if (itemtemplate.itemId !== undefined) { item.itemId = ++i; }
      return item; 
    });

    config.data[arrayName] = items;
    
    const response = await getAPIResponse(config);

    if (apiSettings.noCall) {  
      return response;
    }

    if (response.status > 299) {  
      return response;
    }
    if (!combinedData) {
      combinedData = {results: []};
    } 
    combinedData.results.push(response);
  }

  return combinedData;
}


