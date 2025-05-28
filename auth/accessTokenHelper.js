// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import sm from '@aws-sdk/client-secrets-manager';
import axios from 'axios';
import config from "config";


// This function gets secret string.
async function getOAuthRequiredInfo(client) {
    const accessTokenHelper = config.get('secretsManager');
		try {
			 const getSecretValueResponse  = await client.send(
                new sm.GetSecretValueCommand({
                    SecretId: accessTokenHelper.get("secretNameForOAuth"),
                    VersionStage: accessTokenHelper.get("versionStage"), // VersionStage defaults to AWSCURRENT if unspecified
                })
            );
			
			//console.log('getSecretValueResponse.SecretString ', getSecretValueResponse );
			
			return JSON.parse(getSecretValueResponse.SecretString);
		} catch (e) {
			console.log('getOAuthRequiredInfo error ', e);
			throw e;
		}
}

async function lwaOAuth(oauthInfo) {

    const requestBody = {
        grant_type: 'refresh_token',
        refresh_token: oauthInfo['lwa-refresh-token'],
        client_id: oauthInfo['lwa-client-id'],
        client_secret: oauthInfo['lwa-client-secret'],
        scope: oauthInfo['lwa-auth-scope'],
    };

    try {
        const response = await axios.post(oauthInfo['lwa-auth-url'], new URLSearchParams(requestBody), {
            headers: { 'Accept': 'application/x-www-form-urlencoded',
                        'Content-Type' : 'application/x-www-form-urlencoded',
                        'Authorization' : '',
                        'Asp-Cli' : '' 
             },
        });

        if (response.status === 200) {
            return response.data.access_token;
        } else {
            return null;
        }
    } catch (error) {
		console.log('lwaOAuth error ', error);
        throw error;
    }
}

export async function  getAspAccessToken (){
    const accessTokenHelper = config.get('secretsManager');

    let accessToken = '';
    try {
        const regionName = accessTokenHelper.get("regionName");

        // Create a Secrets Manager client
        const client = new sm.SecretsManager({ region: regionName });
        accessToken = await lwaOAuth(await getOAuthRequiredInfo(client));
    } catch (error) {
        console.error(error);
    }

    return accessToken;
}

