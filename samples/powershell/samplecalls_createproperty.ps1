# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

Write-Host "List of sample calls for the create Property"
Exit 

# orgid can additionally be set in config/default.json along with any parameter which the cli will use as a default
$orgid="<valid orgid>" 
$name="Alexa Sports Rehab Center" 

# create a new property
asp-cli create-property --orgid $orgid --name $name --type "healthcare_us" 

# create a new property with orgid coming from config/default.json if set
asp-cli create-property --name $name --type "healthcare_us" 

# use the --output parameter to capture the new property id from the results
# by default the asp-cli will return the JSON data from the REST API
$propertyid = asp-cli create-property --orgid $orgid --name $name --type "healthcare_us" --output id

# get units in the property
asp-cli get-units --parentid $propertyid 

# if parentid is in the config/default.json the call would be simply
asp-cli get-units

# the create-property creates a single "Default" unit which is where rooms/units are added 
# since this is new property the defaultUnit will be the only unit in the property 
$defaultUnitId = asp-cli get-units --parentid $propertyid --output results[0].id

# create a new room with in the default unit group and capture the id
$newRoomId = asp-cli create-unit --parentid $defaultUnitId --name "Room 202" --output id

asp-cli undate-unit --unitid $newRoomId --name "Room 201" 



