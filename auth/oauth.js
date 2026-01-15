// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/
import config from "config";
import fs from 'fs';
import axios from "axios";


export async function getOAuthLocalToken(oauthConfig) {
    const tokenFile = oauthConfig.token_file;
    if (fs.existsSync(tokenFile)) {
        const data = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
        const expiry = new Date(data.expire_date);
        expiry.setSeconds(expiry.getSeconds() - 60);
        if (Date.now() < expiry) return data.access_token;
    }
    await refreshAccessTokenWithConfig(oauthConfig);
    return JSON.parse(fs.readFileSync(tokenFile, 'utf8')).access_token;
}

async function refreshAccessTokenWithConfig(oauthConfig) {
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: oauthConfig.refresh_token,
        client_id: oauthConfig.client_id,
        client_secret: oauthConfig.client_secret,
        scope: "alexa::enterprise:management credential_locker::wifi_management profile"
    });

    const response = await axios.post('https://api.amazon.com/auth/o2/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': '',
            'Asp-Cli': ''
        }
    });

    const expiry = new Date(Date.now() + response.data.expires_in * 1000);
    fs.writeFileSync(oauthConfig.token_file, JSON.stringify({
        access_token: response.data.access_token,
        expire_date: expiry
    }));
}

export async function refreshAccessToken()
{
    const authConfig = config.get('oauthLocal');

    const params = new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': authConfig.get("refresh_token"),
      'client_id': authConfig.get("client_id"),
      'client_secret': authConfig.get("client_secret"),
      'scope': [
        "alexa::enterprise:management",
        "credential_locker::wifi_management",
        "profile",
    ].join(' ')
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
      data : params.toString()
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
