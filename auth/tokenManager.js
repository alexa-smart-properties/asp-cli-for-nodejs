// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { getAspAccessTokenWithConfig } from './accessTokenHelper.js';
import { getOAuthLocalToken } from './oauth.js';

const tokenCache = new Map();

export async function getTokenForOrg(orgKey, orgConfig) {
  const cached = tokenCache.get(orgKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.token;
  }

  let token;
  if (orgConfig.auth === 'secretsManager') {
    token = await getAspAccessTokenWithConfig(orgConfig.secretsManager);
  } else if (orgConfig.auth === 'oauthLocal') {
    token = await getOAuthLocalToken(orgConfig.oauthLocal);
  } else {
    throw new Error(`Invalid auth type: ${orgConfig.auth}`);
  }

  tokenCache.set(orgKey, { token, expiry: Date.now() + 3500000 });
  return token;
}
