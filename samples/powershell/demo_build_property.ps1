# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

$oldproperty = "East Northern Health"
$newproperty = "Dojo Wellness Center"
$newaddressbook = "dojo center addresses"

$json_properties = asp-cli get-units --parentid $orgid | Out-String | ConvertFrom-Json 

$propertyid = $json_properties.results.Where({$_.name.value.text -eq $oldproperty}).id
echo $propertyid

$json = asp-cli get-units --parentid $propertyid --depth all | Out-String | ConvertFrom-Json 

foreach($unit in $json.results)
{
    echo $unit.name.value.text
    $json_unit_endpoints = asp-cli get-endpoints --unitid $unit.id | Out-String | ConvertFrom-Json

    foreach($endpoint in $json_unit_endpoints.results)
    {
        Write-Host $endpoint.serialNumber.value.text + " - " + $endpoint.model.value.text
        Write-Host "disassociating " + $endpoint.id
        asp-cli disassociate-unit --endpointid $endpoint.id
    }
}

$json_available_endpoints = asp-cli get-endpoints | Out-String | ConvertFrom-Json

echo "Available endpoints: "
foreach($endpoint in $json_available_endpoints.results)
{
    Write-Host $endpoint.serialNumber.value.text - $endpoint.model.value.text - $endpoint.friendlyName.value.text
}

# $json = asp-cli create-unit --parentid $orgid --name $newproperty | Out-String | ConvertFrom-Json
# $newpropertyid= $json.id
# echo $newpropertyid
# asp-cli enable-skill-for-unit --unitid $newpropertyid --skillid "amzn1.ask.skill.2f3c39f9-740b-4204-b4af-ba9e70ca0cd8" --stage "live"

$newpropertyid = $json_properties.results.Where({$_.name.value.text -eq $newproperty}).id
echo $newpropertyid

asp-cli get-units --parentid $newpropertyid

$demo_rooms_path = ".\samples\csv\demo_rooms.csv"
Import-Csv -Path $demo_rooms_path | ForEach-Object {
    
    $json = asp-cli create-unit --parentid $newpropertyid --name $_.unit | Out-String | ConvertFrom-Json
    $newunitid = $json.id
    echo $newunitid
    
    If ($_.device -eq "") {
       Write-Host "No devices specified for room " $_.unit
    } else
    {
        Write-Host "Devices specified for room " $_.unit ": " $_.device

        $devices = $_.device -split ","
        foreach($device in $devices)
        {
           #  $json_available_endpoints = asp-cli get-endpoints | Out-String | ConvertFrom-Json
            foreach($endpoint in $json_available_endpoints.results)
            {
                if($endpoint.serialNumber.value.text -eq $device)
                {
                    Write-Host "Associating " $endpoint.serialNumber.value.text
                    Write-Host "Associating Id " $endpoint.id
                    asp-cli associate-unit --unitid $newunitid --endpointid $endpoint.id
                    break
                }
            }
        }
    }
}

asp-cli get-units --parentid $newpropertyid > "new_units.json"

$new_units_json = Get-Content "new_units.json" | Out-String | ConvertFrom-Json

foreach ($unit in $new_units_json.results)
{
    echo $unit.name.value.text
    $createResponse = asp-cli create-communication-profile --unitid $unit.id --name $unit.name.value.text | Out-String | ConvertFrom-Json
    $newProfileId = $createResponse.profileId.profileId
    echo $newProfileId
    # create allways has name "Guest" after creation
    asp-cli update-communication-profile --profileid $newProfileId --name $unit.name.value.text
    $profile = asp-cli get-communication-profile --unitid $unit.id  | Out-String | ConvertFrom-Json
    $unit | Add-Member -NotePropertyName "profile" -NotePropertyValue $profile
}

$new_units_json | ConvertTo-Json -depth 100 | Out-File "new_units_profiles.json"

$new_units_profile_json = Get-Content "new_units_profiles.json" | Out-String | ConvertFrom-Json


$newaddressbook = "east northern addresses"
$createResponse = asp-cli create-address-book --name $newaddressbook | Out-String | ConvertFrom-Json
$newAddressBookId = $createResponse.addressBookId
echo $newAddressBookId

foreach ($unit in $new_units_profile_json.results)
{
        asp-cli create-address-book-association --addressbookid $newAddressBookId --unitid $unit.id
}

$sample_contacts_path = ".\samples\csv\sample_contacts.csv"

Import-Csv -Path $sample_contacts_path | ForEach-Object {
    If ($_.type -eq "number") {
        asp-cli create-contact --addressbookid $newAddressBookId --name $_.name --phone $_.value
    } 
    If ($_.type -eq "profile") {
        asp-cli create-contact --addressbookid $newAddressBookId --name $_.name --profile $_.value
    } 
    If ($_.type -eq "room") {
        echo $_.value
        foreach ($unit in $new_units_profile_json.results)
        {
            If ($unit.name.value.text -eq $_.value) {
                asp-cli create-contact --addressbookid $newAddressBookId --name $_.name --profile $unit.profile.profileId.profileId
            } 
        }
    } 
}

# add endpoints to property json file
foreach ($unit in $new_units_profile_json.results)
{
    $endpoints = asp-cli get-endpoints --unitid $unit.id | Out-String | ConvertFrom-Json
    $unit | Add-Member -NotePropertyName "endpoints" -NotePropertyValue $endpoints
}
$new_units_profile_json | ConvertTo-Json -depth 100 | Out-File "new_units_profiles_endpoints.json"

$new_units_ids = $new_units_json.results | ForEach-Object { $_.id }
$new_units_ids = $new_units_ids -join ','
echo $new_units_ids

$skillid = "amzn1.ask.skill.2f3c39f9-740b-4204-b4af-ba9e70ca0cd8"

asp-cli enable-skill-multiple-units --skillid $skillid --unitids $new_units_ids  --stage "live"

$maximumvolume=45
$locales="en-US,es-US"
$donotdisturb="false"
$colorinversion="ENABLED"
$timezone="America/Los_Angeles"
$timeformat="24_HOURS"
$speakingrate=1.25

$aspcalldelay = 100
asp-cli init --orgid $orgid --authtoken $authToken --aspcalldelay $aspcalldelay

foreach($unit in $new_units_json.results)
{
    echo $unit.name.value.text

    echo delete-all-alarms
    asp-cli delete-all-alarms --unitid $unit.id
    echo delete-all-reminders
    asp-cli delete-all-reminders --unitid $unit.id
    echo delete-all-timers
    asp-cli delete-all-timers --unitid $unit.id
    echo delete-all-notifications DeviceNotification
    asp-cli delete-all-notifications --unitids $unit.id --type DeviceNotification
    echo delete-all-notifications PersistentVisualAlert
    asp-cli delete-all-notifications --unitids $unit.id --type PersistentVisualAlert

    $json_unit_endpoints = asp-cli get-endpoints --unitid $unit.id | Out-String | ConvertFrom-Json
    foreach($endpoint in $json_unit_endpoints.results)
    {
        Write-Host $endpoint.serialNumber.value.text + " - " + $endpoint.model.value.text
        
        $endpointid = $endpoint.id
        echo maximumvolume:$maximumvolume
        asp-cli set-maximumvolume --endpointid $endpointid --value $maximumvolume
        echo set-locales $locales
        asp-cli set-locales --endpointid $endpointid --value $locales
        echo set-wakewords
        asp-cli set-wakewords --endpointid $endpointid --value "ALEXA"
        echo set-timezone $timezone
        asp-cli set-timezone --endpointid $endpointid --value $timezone
        echo set-speakingrate $speakingrate
        asp-cli set-speakingrate --endpointid $endpointid --value $speakingrate
        asp-cli set-address --endpointid $endpointid --addressline1 "123 Main St" --city "Seattle" --stateorregion "WA" --postalcode 98104-2515 --countrycode "US"

        echo set-timeformat $timeformat
        asp-cli set-timeformat --endpointid $endpointid --value $timeformat

        echo unpair-all-bluetooth-devices
        asp-cli unpair-all-bluetooth-devices --endpointid $endpointid
        # asp-cli enable-skill-for-unit --unitid $newpropertyid --skillid "amzn1.ask.skill.2f3c39f9-740b-4204-b4af-ba9e70ca0cd8" --stage "live"
        asp-cli set-speaker-properties --endpointid $endpointid --operation set --value 50

        asp-cli send-notification --unitids $unit.id --type announcement --text "$($endpoint.friendlyName.value.text) is configured for $($unit.name.value.text)"
    }

}



$json_properties = asp-cli get-units --parentid $orgid | Out-String | ConvertFrom-Json 
foreach($property in $json_properties.results)
{
    $json = asp-cli get-units --parentid $property.id --depth all | Out-String | ConvertFrom-Json 

    foreach($unit in $json.results)
    {
        echo $unit.name.value.text
        $json_unit_endpoints = asp-cli get-endpoints --unitid $unit.id | Out-String | ConvertFrom-Json

        foreach($endpoint in $json_unit_endpoints.results)
        {
            # Write-Host $endpoint.serialNumber.value.text + " - " + $endpoint.model.value.text
            Write-Host "disassociating " + $endpoint.id
            asp-cli disassociate-unit --endpointid $endpoint.id
            asp-cli forget-endpoint --endpointid $endpoint.id
        }
    }
}



