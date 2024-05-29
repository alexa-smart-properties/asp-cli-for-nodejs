# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
Write-Host "List of reference calls for unit settings and endpoint settings and features"
Exit 

$unitid="<unitid>"
$endpointid="<unitid>"

echo delete-all-alarms
asp-cli delete-all-alarms --unitid $unitid
echo delete-all-reminders
asp-cli delete-all-reminders --unitid $unitid
echo delete-all-timers
asp-cli delete-all-timers --unitid $unitid
echo delete-all-notifications DeviceNotification
asp-cli delete-all-notifications --unitids $unitid --type DeviceNotification
echo delete-all-notifications PersistentVisualAlert
asp-cli delete-all-notifications --unitids $unitid --type PersistentVisualAlert

# get first endpoint in unit
endpointid=$(asp-cli get-endpoints --unitid $unitid | jq -r '.results[0] | .id?')
echo endpointid: $endpointid

# connectivity status
asp-cli get-endpoint-connectivity --endpointid $endpointid   

$maximumvolume=45
$locales="en-US,es-US"
$donotdisturb=true
$colorinversion=ENABLED
$timezone="America/Los_Angeles"
$timeformat="24_HOURS"
$speakingrate=1.25

echo set-colorinversion $colorinversion
asp-cli set-colorinversion --endpointid $endpointid --value $colorinversion
echo maximumvolume:$maximumvolume
asp-cli set-maximumvolume --endpointid $endpointid --value $maximumvolume
echo set-donotdisturb $donotdisturb
asp-cli set-donotdisturb --endpointid $endpointid --value $donotdisturb
echo set-locales $locales
asp-cli set-locales --endpointid $endpointid --value $locales
echo set-wakewords
asp-cli set-wakewords --endpointid $endpointid --value ALEXA
echo set-timezone $timezone
asp-cli set-timezone --endpointid $endpointid --value $timezone
echo set-temperatureunit
asp-cli set-temperatureunit --endpointid $endpointid --value CELSIUS
echo set-distanceunits
asp-cli set-distanceunits --endpointid $endpointid --value METRIC
echo set-wakewordconfirmation
asp-cli set-wakewordconfirmation --endpointid $endpointid --value TONE
echo set-speechconfirmation
asp-cli set-speechconfirmation --endpointid $endpointid --value NONE
echo set-followup
asp-cli set-followup --endpointid $endpointid --value false
echo set-magnifier
asp-cli set-magnifier --endpointid $endpointid --value DISABLED
echo set-closedcaptions
asp-cli set-closedcaptions --endpointid $endpointid --value DISABLED
echo set-alexacaptions
asp-cli set-alexacaptions --endpointid $endpointid --value ENABLED
echo set-speakingrate $speakingrate
asp-cli set-speakingrate --endpointid $endpointid --value $speakingrate
echo set-errorsuppression
asp-cli set-errorsuppression --endpointid $endpointid --value "CONNECTIVITY"
echo set-timeformat $timeformat
asp-cli set-timeformat --endpointid $endpointid --value $timeformat

echo unpair-all-bluetooth-devices
asp-cli unpair-all-bluetooth-devices --endpointid $endpointid

asp-cli get-bluetooth-features --endpointid $endpointid

echo set-default-music-station 
asp-cli set-default-music-station --unitid $unitid --providerid I_HEART_RADIO --stationid 7193
asp-cli get-default-music-station --unitid $unitid

# endpoint features

echo set-brightness
asp-cli set-brightness --endpointid $endpointid --value 50
asp-cli set-brightness --endpointid $endpointid --operation set --value 50
asp-cli set-brightness --endpointid $endpointid --operation adjust --value '-20'
asp-cli get-brightness --endpointid $endpointid

echo set-color
asp-cli set-color --endpointid $endpointid --hsb 1.0,1.0,1.0
asp-cli set-color --endpointid $endpointid --hue 0.5 --saturation 0.5 --brightness 0.5
asp-cli get-color --endpointid $endpointid

echo set-color-temperature
asp-cli set-color-temperature --endpointid $endpointid --value 500
asp-cli set-color-temperature --endpointid $endpointid --operation set --value 600
asp-cli set-color-temperature --endpointid $endpointid --operation "increase"
asp-cli set-color-temperature --endpointid $endpointid --operation "decrease"
asp-cli get-color-temperature --endpointid $endpointid

echo set-power-state
asp-cli set-power-state --endpointid $endpointid --operation on
asp-cli set-power-state --endpointid $endpointid --operation off
asp-cli get-power-state --endpointid $endpointid 

echo set-speaker-properties
asp-cli set-speaker-properties --endpointid $endpointid --operation set --value 75
asp-cli set-speaker-properties --endpointid $endpointid --operation adjust --value '-60'
asp-cli get-speaker-properties --endpointid $endpointid 

echo get-temperature
asp-cli get-temperature --endpointid $endpointid
echo get-thermostat
asp-cli get-thermostat --endpointid $endpointid
