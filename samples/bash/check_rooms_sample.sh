# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

propertyid=<propertyid> # replace with your propertyid
unitid=<unitid> # replace with your unitid

# init asp-cli
asp-cli init --propertyid $propertyid --orgid $orgid --authtoken $authToken

# get units of a property
parentid=$propertyid

# export all rooms under propertyid to rooms.json
asp-cli get-units --parentid $parentid --depth all > rooms.json

# iterate through all rooms in rooms.json
for id in $(jq -r ".results[] | .id" rooms.json)
  do
    unitid=$id
    echo $unitid # >> skills.json
    # json_output=$(asp-cli list-skill-enablements  --unitid $unitid)
    # skillid=$(echo $json_output | jq -r '.items[0].skill.id?')
    # echo $skillid
    # echo " - "$skillid >> skills.json

    endpointid=$(asp-cli get-endpoints --unitid $unitid | jq -r '.results[0] | .id?')
    echo " - "$endpointid
  done

unitid=amzn1.alexa.unit.did....
endpointid=amzn1.alexa.endpoint.did....
endpoint_json=$(asp-cli get-endpoint --endpointid $endpointid)
macAddress=$(echo $endpoint_json | jq -r '.connections[0].macAddress' )
asp-cli send-notification --unitids $unitid --type announcement --text "macAddress $macAddress"

asp-cli set-donotdisturb --endpointid $endpointid --value false

doNotDisturb=$(echo $json | jq -r '.settings[] | select(.key=="Alexa.DoNotDisturb.doNotDisturb") | .value')
echo $doNotDisturb

asp-cli delete-all-alarms --unitid $unitid
asp-cli delete-all-reminders --unitid $unitid
asp-cli delete-all-timers --unitid $unitid
endpointid=$(asp-cli get-endpoints --unitid $unitid | jq -r '.results[0] | .id?')
echo $endpointid
asp-cli set-maximumvolume --endpointid $endpointid --value 45
asp-cli set-donotdisturb --endpointid $endpointid --value true
asp-cli set-locales --endpointid $endpointid --value en-US,es-US
asp-cli set-wakeWords --endpointid $endpointid --value ALEXA
asp-cli set-timezone --endpointid $endpointid --value "America/Los_Angeles"
asp-cli set-temperatureunit --endpointid $endpointid --value CELSIUS
asp-cli set-distanceunits --endpointid $endpointid --value METRIC
asp-cli delete-all-notifications --unitids $unitid
asp-cli delete-all-notifications --unitids $unitid --type PersistentVisualAlert
asp-cli unpair-all-bluetooth-devices --endpointid $endpointid

asp-cli set-default-music-station --unitid $unitid --providerid I_HEART_RADIO --stationid 7193
asp-cli get-default-music-station --unitid $unitid

#features

asp-cli get-brightness --endpointid $endpointid
# set-brightness defaults to set operation
asp-cli set-brightness --endpointid $endpointid --value 50
asp-cli set-brightness --endpointid $endpointid --operation set --value 50
asp-cli set-brightness --endpointid $endpointid --operation adjust --value '-20'


asp-cli get-color --endpointid $endpointid
asp-cli set-color --endpointid $endpointid --hsb 1.0,1.0,1.0
asp-cli set-color --endpointid $endpointid --hue 0.5 --saturation 0.5 --brightness 0.5

asp-cli get-color-temperature --endpointid $endpointid
# color-temperature defaults to set operation
asp-cli set-color-temperature --endpointid $endpointid --value 500
asp-cli set-color-temperature --endpointid $endpointid --operation set --value 600
asp-cli set-color-temperature --endpointid $endpointid --operation increase
asp-cli set-color-temperature --endpointid $endpointid --operation decrease

asp-cli get-power-state --endpointid $endpointid 
asp-cli set-power-state --endpointid $endpointid --operation on
asp-cli set-power-state --endpointid $endpointid --operation off

asp-cli get-speaker-properties --endpointid $endpointid 
# set-speaker defaults to set operation
asp-cli set-speaker-properties --endpointid $endpointid --value 50
asp-cli set-speaker-properties --endpointid $endpointid --operation set --value 75
asp-cli set-speaker-properties --endpointid $endpointid --operation adjust --value '-60'

asp-cli get-temperature --endpointid $endpointid
asp-cli get-thermostat --endpointid $endpointid

asp-cli get-thermostat --endpointid $endpointid

# addressline1,addressline2,addressline3,city,stateorregion,districtorcounty,postalcode,countrycode
asp-cli set-address --endpointid $endpointid --addressline1 "123 Main St" --city "Seattle" --stateorregion "WA" --postalcode 98104-2515 --countrycode "US"
asp-cli get-address --endpointid $endpointid 


asp-cli set-wifi-configuration --endpointid $endpointid --ssid "wifi-ssid" --keymanagement "WPAPSK"
asp-cli set-wifi-configuration --endpointid $endpointid --ssid "wifi-ssid" --keymanagement "WPAPSK" --priority 3

asp-cli set-wifi-configuration --endpointid $endpointid --ssid "wifi-ssid" --keymanagement "WPAPSK"
# set-wifi-configuration with priority set
asp-cli set-wifi-configuration --endpointid $endpointid --ssid "wifi-ssid" --keymanagement "WPAPSK" --priority 3

# json='{"submittedOperationId": "operationId"}'
operationId=$(asp-cli set-wifi-configuration --endpointid $endpointid --ssid "wifi-ssid" --keymanagement "WPAPSK" | jq -r '.submittedOperationId')
echo $operationId
asp-cli getWifiInstallationStatus --endpointid $endpointid --operationid $operationid

# settings
asp-cli set-donotdisturb --endpointid $endpointid --value false
asp-cli set-locales --endpointid $endpointid --value en-US,es-US
asp-cli set-wakewords --endpointid $endpointid --value ALEXA
asp-cli set-wakewordconfirmation --endpointid $endpointid --value TONE
asp-cli set-speechconfirmation --endpointid $endpointid --value TONE
asp-cli set-followup --endpointid $endpointid --value true
asp-cli set-temperatureunit --endpointid $endpointid --value CELSIUS
asp-cli set-distanceunits --endpointid $endpointid --value METRIC
asp-cli set-magnifier --endpointid $endpointid --value DISABLED
asp-cli set-closedcaptions --endpointid $endpointid --value DISABLED
asp-cli set-alexacaptions --endpointid $endpointid --value ENABLED
asp-cli set-colorinversion --endpointid $endpointid --value DISABLED
asp-cli set-timezone --endpointid $endpointid --value "America/Los_Angeles"
asp-cli set-speakingrate --endpointid $endpointid --value 1.0
asp-cli set-errorsuppression --endpointid $endpointid --value "CONNECTIVITY"
asp-cli set-maximumvolume --endpointid $endpointid --value 45
asp-cli set-timeformat --endpointid $endpointid --value "12_HOURS"


# select first unitid in getunits results
json_output=$(asp-cli getunits --parentid $parentid | jq)
unitid=$(echo $json_output | jq -r '.results[0] | .id?')
echo $unitid

# create a new unit and capture the new unitid with jq
asp-cli createunit --parentid $parentid --name "new unit 488"

# create a new unit and capture the new unitid with jq
json_output=$(asp-cli createunit --parentid $parentid --name "new unit 52" | jq -r)
newunitid=$(echo $json_output | jq -r '.id?')
echo $newunitid

asp-cli getunit --unitid $newunitid

unitid=$newunitid

# update the name of the new unit
asp-cli updateunit --unitid $unitid --name "new unit 46 updated"

asp-cli set-default-music-station --unitid $unitid --providerid I_HEART_RADIO --stationid 7193
asp-cli get-default-music-station --unitid $unitid
asp-cli delete-all-reminders --unitid $unitid
asp-cli delete-all-alarms --unitid $unitid
asp-cli delete-all-timers --unitid $unitid

asp-cli list-skill-enablements --unitid $unitid

json_output=$(asp-cli list-skill-enablements  --unitid $unitid)
skillid=$(echo $json_output | jq -r '.items[0].skill.id?')
echo $skillid

asp-cli get-skill-enablement --unitid $unitid --skillid $skillid

asp-cli get-skill-enablement-multiple-units --unitids $unitid,$unitid
# enable-skill-for-unit optional params:stage,partition,linkredirecturi,linkauthcode,nfilocales 
asp-cli enable-skill-for-unit --skillid $skillid --unitid $unitid --nfilocales en-US,es-US --stage live

asp-cli enable-skill-multiple-units --skillid $skillid --unitids $unitid,$unitid --stage live
asp-cli disable-skill-for-unit --skillid $skillid --unitid $unitid --stage live
asp-cli disable-skill-multiple-units --skillid $skillid --unitids $unitid,$unitid  --stage live

# delete unit by unitid
asp-cli deleteunit --unitid $unitid

asp-cli create-comms-profile --unitid $env:newunitid --profilename "profile1"

$env:json_output=$(asp-cli create-comms-profile --unitid $env:newunitid --profilename "profile7"| jq -r)
$env:newprofileid=$(echo $env:json_output | jq -r '.profileId.profileId')
echo $env:newprofileid

asp-cli update-comms-profile --profileid $env:newprofileid --profilename "profile7 update"

# update-comms-profile get-comms-profile


json_output=$(asp-cli get-endpoints)
endpointid=$(echo $json_output | jq -r '.results[0] | .id?')
echo $endpointid

asp-cli get-endpoint --endpointid $endpointid

endpointid='amzn1.alexa.endpoint.did.AFXA4UAD2SXFTLWGIDY5JV4I6JPOAIKZHMX642VCH4YKFDOMFI7V5KMAU6QQVUMJAR62TOM535QNEUQJ45ZJYYVS5OHVUAKBNBVXFFLKKZVLGYLWM6NZG'
# asp-cli get-endpoint-settings --endpointid $endpointid --keys "doNotDisturb,locales,timeZone,speakingRate"
# asp-cli get-endpoint-settings --endpointid $endpointid --keys "locales,wakewords,wakewordconfirmation,speechconfirmation,followup,temperatureunit,distanceunits,closedcaptions,alexacaptions,magnifier,colorinversion,timezone,speakingrate,errorsuppression,maximumvolume,timeformat"
json=$(asp-cli get-endpoint-settings --endpointid $endpointid --keys "locales,wakewords,wakewordconfirmation,speechconfirmation,followup,temperatureunit,distanceunits,closedcaptions,alexacaptions,magnifier,colorinversion,timezone,speakingrate,errorsuppression,maximumvolume,timeformat")

doNotDisturb=$(echo $json | jq -r '.settings[] | select(.key=="Alexa.DoNotDisturb.doNotDisturb") | .value')
echo doNotDisturb:: $doNotDisturb 
speakingRate=$(echo $json | jq -r '.settings[] | select(.key=="SpeechSynthesizer.speakingRate") | .value')
echo speakingRate:: $speakingRate 
locales=$(echo $json | jq -r '.settings[] | select(.key=="System.locales") | .value[0]')
echo locales:: $locales 
timezone=$(echo $json | jq -r '.settings[] | select(.key=="System.timeZone") | .value')
echo timezone:: $timezone 
wakewords=$(echo $json | jq -r '.settings[] | select(.key=="SpeechRecognizer.wakeWords") | .value[0]')
echo wakewords:: $wakewords 
wakewordconfirmation=$(echo $json | jq -r '.settings[] | select(.key=="SpeechRecognizer.wakeWordConfirmation") | .value')
echo wakewordconfirmation:: $wakewordconfirmation 
speechconfirmation=$(echo $json | jq -r '.settings[] | select(.key=="SpeechRecognizer.speechConfirmation") | .value')
echo speechconfirmation:: $speechconfirmation 
temperatureunit=$(echo $json | jq -r '.settings[] | select(.key=="System.temperatureUnit") | .value')
echo temperatureunit:: $temperatureunit
distanceunits=$(echo $json | jq -r '.settings[] | select(.key=="System.distanceUnits") | .value')
echo distanceunits:: $distanceunits
closedcaptions=$(echo $json | jq -r '.settings[] | select(.key=="Accessibility.Captions.ClosedCaptions.enablement") | .value')
echo closedcaptions:: $closedcaptions
alexacaptions=$(echo $json | jq -r '.settings[] | select(.key=="Accessibility.Captions.AlexaCaptions.enablement") | .value')
echo alexacaptions:: $alexacaptions
magnifier=$(echo $json | jq -r '.settings[] | select(.key=="Accessibility.Display.Magnifier.enablement") | .value')
echo magnifier:: $magnifier
colorinversion=$(echo $json | jq -r '.settings[] | select(.key=="Accessibility.Display.ColorInversion.enablement") | .value')
echo colorinversion:: $colorinversion
errorsuppression=$(echo $json | jq -r '.settings[] | select(.key=="Alexa.ManagedDevice.Settings.errorSuppression") | .value[0]')
echo errorsuppression:: $errorsuppression
maximumvolume=$(echo $json | jq -r '.settings[] | select(.key=="Alexa.ManagedDevice.Settings.maximumVolumeLimit") | .value')
echo maximumvolume:: $maximumvolume
timeformat=$(echo $json | jq -r '.settings[] | select(.key=="Alexa.DataFormat.Time.timeFormat") | .value')
echo timeformat:: $timeformat


# asp-cli get-endpoint-connectivity --endpointid $endpointid   
# asp-cli watch --propertyid $env:propertyid