# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/


Write-Host "List of sample calls for for WebRTC Cnfiguration "
Exit 


# create service provider, Note displaynames can only be one character. only en-US is currently supported for local.
# params are plural to support API in the future. --disaplaynames "A,M" --locales "en-US,es-US"
asp-cli create-service-provider --logicalid "NewProvider" --displaynames "A"

# create a new service provider and capture the serviceProviderId. Note if logicalid value is allready being  used the call will fail
$providerid = asp-cli create-service-provider --logicalid "WebRTCProvider" --displaynames "A" --output serviceProviderId

# get provider by id
asp-cli get-service-provider --providerid $providerid

# update provider
asp-cli update-service-provider --providerid $providerid --displaynames "B"

# delete provider
asp-cli delete-service-provider --providerid $providerid 


