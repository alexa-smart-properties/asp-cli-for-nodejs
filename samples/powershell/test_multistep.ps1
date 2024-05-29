# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
Write-Host "List of reference calls with multi api cli calls"
Exit 

# unitid=<unitid> # replace with your unitid
$unitid="<unitid>"


################################################################
# send-notification of the mac addresses of a devices in unit for debugging
$json_output = asp-cli get-endpoints --unitid $unitid | Out-String | ConvertFrom-Json 
# get first endpoint id
$endpointid=  $json_output.results[0].id
Write-Host $endpointid
$endpoint_json= asp-cli get-endpoint --endpointid $endpointid | Out-String | ConvertFrom-Json 
$macAddress=$endpoint_json.connections[0].macAddress
asp-cli send-notification --unitids $unitid --text "macAddress $macAddress"





# bluetooth
