# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
$propertyid="<propertyid>"
$orgid="<orgid>"
$authToken="<authToken>"
$aspcalldelay = 800

# init asp-cli
asp-cli init --propertyid $propertyid --orgid $orgid --authtoken $authToken --aspcalldelay $aspcalldelay

$parentid = $propertyid
asp-cli get-units --parentid $parentid
$json_output = asp-cli get-units --parentid $parentid | Out-String | ConvertFrom-Json 

$unitid = $json_output.results[0].id
echo $unitid

$json_output = asp-cli create-unit --parentid $parentid --name "new unit 4" | Out-String | ConvertFrom-Json 
$newunitid = $json_output.id
echo $newunitid

asp-cli update-unit --unitid $newunitid --name "new unit 4 update"

asp-cli get-unit --unitid $newunitid

asp-cli create-comms-profile --unitid $newunitid --profilename "profile1"

$json_output = asp-cli create-comms-profile --unitid $newunitid --profilename "profile7" | Out-String | ConvertFrom-Json 
$newprofileid= $json_output.profileId.profileId
echo $env:newprofileid

asp-cli update-comms-profile --profileid $env:newprofileid --profilename "profile7 update"

# unassigned endpoints
$json_output = asp-cli get-endpoints | Out-String | ConvertFrom-Json 

# assigned endpoints
$unitid="<unitid>"
$json_output = asp-cli get-endpoints --unitid $unitid | Out-String | ConvertFrom-Json 

# get first endpoint id
$endpointid=  $json_output.results[0].id
echo $endpointid

asp-cli get-endpoint --endpointid $endpointid
foreach($endpoint in $json_output.results)
{
    Write-Host (" name:`t" + $endpoint.friendlyName.value.text + "`n model:`t" + $endpoint.model.value.text + "`n status:`t" + $endpoint.status + "`n id:`t" + $endpoint.id)
}