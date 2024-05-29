# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/


# unitid=<unitid> # replace with your unitid
$unitid=$1

echo unitid: $unitid

echo delete-all-notifications DeviceNotification
asp-cli delete-all-notifications --unitids $unitid --type DeviceNotification
echo delete-all-notifications PersistentVisualAlert
asp-cli delete-all-notifications --unitids $unitid --type PersistentVisualAlert

$sampleimage=https://d2o906d8ln7ui1.cloudfront.net/images/templates_v3/headline/HeadlineBackground_Dark.png

# send-notification default type is notification
asp-cli send-notification --unitids $unitid,$unitid --text "Hello notification"
# send-notification and specify type announcement
asp-cli send-notification --unitids $unitid --type announcement --text "Hello announcement"

# send-notification --type pva defaults to template wrapping
asp-cli send-notification --unitids $unitid --type pva --primarytext "wrapping alert" --secondarytext "secondary text"

# send-notification --type pva/wrapping with background and dismissaltime
asp-cli send-notification --unitids $unitid --type pva --template wrapping --primarytext test --secondarytext test \
                          --background $sampleimage --dismissaltime "2025-04-30T10:00:00.00Z" 

# send-notification --type pva/wrapping with background and coloroverlay off
asp-cli send-notification --unitids $unitid --type pva --primarytext test --secondarytext test \
                          --background $sampleimage --coloroverlay false

# send-notification --type pva/media with background and dismissaltime
asp-cli send-notification --unitids $unitid --type pva --template media --primarytext test --secondarytext test \
                          --tertiarytext "tertiary text" --hintText "hint text" --attributionText "attribution text" \
                          --background $sampleimage --thumbnail $sampleimage \
                          --attributionimage $sampleimage --dismissaltime "2025-04-30T10:00:00.00Z"

# send-notification --type pva/rating with background 
asp-cli send-notification --unitids $unitid --type pva --template rating --headertext "header text" --primarytext "sample rating" \
                          --background $sampleimage --hintText "hint text" --ratingtext "my rating" --rating 1.5 --coloroverlay false



# send-notification of the mac address of a device for debugging
$json_output = asp-cli get-endpoints --unitid $unitid | Out-String | ConvertFrom-Json 
# get first endpoint id
$endpointid=  $json_output.results[0].id
echo $endpointid
$endpoint_json= asp-cli get-endpoint --endpointid $endpointid | Out-String | ConvertFrom-Json 
$macAddress=$endpoint_json.connections[0].macAddress
asp-cli send-notification --unitids $unitid --text "macAddress $macAddress"
