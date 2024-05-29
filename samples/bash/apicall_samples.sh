# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
# get units of a property

parentid=$propertyid

asp-cli get-units --parentid $parentid

asp-cli get-units --parentid $parentid --depth all > rooms.json

# select first unitid in getunits results
json_output=$(asp-cli get-units --parentid $parentid | jq)
unitid=$(echo $json_output | jq -r '.results[0] | .id?')
echo $unitid

# create a new unit and capture the new unitid with jq
asp-cli create-unit --parentid $parentid --name "new unit 488"

# create a new unit and capture the new unitid with jq
json_output=$(asp-cli create-unit --parentid $parentid --name "new unit 52" | jq -r)
newunitid=$(echo $json_output | jq -r '.id?')
echo $newunitid

asp-cli get-unit --unitid $newunitid

unitid=$newunitid

# update the name of the new unit
asp-cli update-unit --unitid $unitid --name "new unit 46 updated"

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
asp-cli delete-unit --unitid $unitid

asp-cli create-comms-profile --unitid $env:newunitid --profilename "profile1"

$env:json_output=$(asp-cli create-comms-profile --unitid $env:newunitid --profilename "profile7"| jq -r)
$env:newprofileid=$(echo $env:json_output | jq -r '.profileId.profileId')
echo $env:newprofileid

asp-cli update-comms-profile --profileid $env:newprofileid --profilename "profile7 update"

# update-comms-profile get-comms-profile

# $env:parentid="amzn1.alexa.unit.did.AEVHISSAEKLKENTOJR2DYPJFTBLJPV2CAISPOCGH46Q7DK46K4PB434YU3FKGLIT2VGS7J5XVVVMH5KBUL4MEVDIZZHNAQWKXP5VU2YL"
# 

json_output=$(asp-cli get-endpoints)
endpointid=$(echo $json_output | jq -r '.results[0] | .id?')
echo $endpointid

asp-cli get-endpoint --endpointid $endpointid

endpointid='amzn1.alexa.endpoint.did.AFXA4UAD2SXFTLWGIDY5JV4I6JPOAIKZHMX642VCH4YKFDOMFI7V5KMAU6QQVUMJAR62TOM535QNEUQJ45ZJYYVS5OHVUAKBNBVXFFLKKZVLGYLWM6NZG'
asp-cli get-endpoint-settings --endpointid $endpointid --keys "doNotDisturb,locales,timeZone,speakingRate"

asp-cli get-endpoint-connectivity --endpointid $endpointid   

asp-cli watch --propertyid $env:propertyid
