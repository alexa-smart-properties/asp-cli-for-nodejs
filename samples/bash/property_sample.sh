# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
propertyid=<propertyid> # replace with your propertyid

# get units of a property
parentid=$propertyid
asp-cli get-units --parentid $parentid

asp-cli get-units --parentid $parentid --depth all > rooms.json

# select first unitid in get-units results
json_output=$(asp-cli get-units --parentid $parentid | jq)
unitid=$(echo $json_output | jq -r '.results[0] | .id?')
echo $unitid

# create a new unit and capture the new unitid with jq
asp-cli create-unit --parentid $parentid --name "new unit 121"

# create a new unit and capture the new unitid with jq
json_output=$(asp-cli create-unit --parentid $parentid --name "new unit 122" | jq -r)
newunitid=$(echo $json_output | jq -r '.id?')
echo $newunitid

asp-cli get-unit --unitid $newunitid

unitid=$newunitid

# update the name of the new unit
asp-cli update-unit --unitid $unitid --name "new unit 122 updated"

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