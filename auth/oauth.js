// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/
import config from "config";
import fs from 'fs';
import axios from "axios";
import qs from 'qs';

export async function refreshAccessToken()
{
    const authConfig = config.get('oauthLocal');

    let data = qs.stringify({
      'grant_type': 'refresh_token',
      'refresh_token': authConfig.get("refresh_token"),
      'client_id': authConfig.get("client_id"),
      'client_secret': authConfig.get("client_secret"),
      'scope': [
        "alexa::enterprise:management",
        "credential_locker::wifi_management",
        "profile",
    ]

    });

    let postConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.amazon.com/auth/o2/token',
      headers: { 
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Authorization' : '',
        'Asp-Cli' : ''
      },
      data : data
    };

    await axios.request(postConfig)
    .then((response) => {

      if (authConfig.get("cacheToken"))
      {
        let expireSeconds = response.data.expires_in;
        let expireDate = new Date();
        expireDate.setSeconds(expireDate.getSeconds() + expireSeconds);

        let settings = {"access_token": response.data.access_token, 
        "expire_date": expireDate};

        fs.writeFileSync(authConfig.get("token_file"), JSON.stringify(settings, null, 2), (err) => {
          if (err){console.log(err); throw err};
        });
        // console.log("New Token");
      }
    })
    .catch((error) => {
      console.log("Error refreshing token. Please check your configuration.");
    });
}

export function getAccessToken(){
  
    const authConfig = config.get('oauthLocal');

    let tokenFilePath = authConfig.get("token_file");
    if (fs.existsSync(tokenFilePath)) {
      
    const data = fs.readFileSync(tokenFilePath, 'utf8');
      const tokenSettings = JSON.parse(data);
      let expireDate = new Date(tokenSettings.expire_date);
      
      expireDate.setSeconds(expireDate.getSeconds() - 60);

      if (Date.now() < expireDate)
      {
        //console.log("Token expires at: " + expireDate.toISOString() + " (" + expireDate.toLocaleString() + ")");
        return tokenSettings.access_token
      } else {
        //console.log("Token expired");
      }
    }
    return null;    
}
