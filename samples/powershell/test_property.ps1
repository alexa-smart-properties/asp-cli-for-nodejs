# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

$oldproperty = "East Northern Health"
$newproperty = "Dojo Wellness Center"
$newaddressbook = "dojo center addresses"

$newproperty = "Property Test - 1000 Rooms"

$orgid = "<orgid>"

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

$json = asp-cli create-unit --parentid $orgid --name $newproperty | Out-String | ConvertFrom-Json
$newpropertyid= $json.id
echo $newpropertyid
asp-cli enable-skill-for-unit --unitid $newpropertyid --skillid "healthcare" --stage "live"

$newpropertyid = $json_properties.results.Where({$_.name.value.text -eq $newproperty}).id
echo $newpropertyid

#  core: "amzn1.ask.skill.b4ca54a9-5e5f-4c60-93a0-d4cbd48640f2",
#  healthcare: "amzn1.ask.skill.90c5a544-3ea5-459e-8275-b925a0f84224",
#  hospitality_ca: "amzn1.ask.skill.eac80ad0-ab7d-41db-9f21-1e34747c7cb5",
#  hospitality_de: "amzn1.ask.skill.de46bda1-550d-4381-9a08-17204f9e935e",
#  hospitality_es: "amzn1.ask.skill.b70682dd-67b0-4775-acae-f8d2ee278322",
#  hospitality_fr: "amzn1.ask.skill.3c136caa-8b11-4210-a5e9-7bdd9f2c606a",
#  hospitality_it: "amzn1.ask.skill.fba6aef7-cc2c-474a-992a-68b118970548",
#  hospitality_jp: "amzn1.ask.skill.ae0c1da0-5068-4b71-ac8e-d4f3c230ef84",
#  hospitality_uk: "amzn1.ask.skill.06322139-c2a9-4c59-a4b6-354b37aafb33",
#  hospitality_us: "amzn1.ask.skill.a4697856-173d-4b66-91a3-ef4b083992f5",
#  seniorliving_ca: "amzn1.ask.skill.2d1e40fa-3611-41d2-8b41-f4fb76ab4829",
#  seniorliving_de: "amzn1.ask.skill.bf08c62f-49e9-4318-a79d-b7eb0787f62f",
#  seniorliving_es: "amzn1.ask.skill.54da35b3-2ba1-489c-8034-8eca7b12a29b",
#  seniorliving_fr: "amzn1.ask.skill.45e4d2c4-54b4-4186-af3f-3f51d22e45f6",
#  seniorliving_it: "amzn1.ask.skill.19d6addf-71d4-43ae-8dba-1b83142db872",
#  seniorliving_jp: "amzn1.ask.skill.5e0d3ba5-3e4f-4c83-8e24-0e6791451d8d",
#  seniorliving_uk: "amzn1.ask.skill.a501f73e-aaf7-4d9b-a5b4-67c37b1bbabf",
#  seniorliving_us: "amzn1.ask.skill.6a39c06f-58b4-4adb-8c7f-a75a9ca3f7e1"


asp-cli get-units --parentid $newpropertyid

$json = asp-cli create-unit --parentid $newpropertyid --name "East Building" | Out-String | ConvertFrom-Json
$eastunitid = $json.id
echo $eastunitid
$json = asp-cli create-unit --parentid $newpropertyid --name "West Building" | Out-String | ConvertFrom-Json
$westunitid = $json.id
echo $westunitid
$json = asp-cli create-unit --parentid $newpropertyid --name "South Building" | Out-String | ConvertFrom-Json
$southunitid = $json.id
echo $southunitid
$json = asp-cli create-unit --parentid $newpropertyid --name "North Building" | Out-String | ConvertFrom-Json
$northunitid = $json.id
echo $northunitid

$startMs = (Get-Date)
$json_building = asp-cli get-units --parentid $newpropertyid | Out-String | ConvertFrom-Json

foreach($building in $json_building.results)
{
    Write-Host $building.name.value.text
    $demo_floors_path = ".\samples\csv\demo_floors.csv"
    Import-Csv -Path $demo_floors_path | ForEach-Object {
    
        $json = asp-cli create-unit --parentid $building.id --name $_.unit | Out-String | ConvertFrom-Json
        $newfloorid = $json.id
        echo $newfloorid 

        
        $demo_rooms_path = ".\samples\csv\demo_rooms.csv"
        Import-Csv -Path $demo_rooms_path | ForEach-Object {
    
            $json = asp-cli create-unit --parentid $newfloorid --name $_.unit | Out-String | ConvertFrom-Json
            $newunitid = $json.id
            echo $newunitid
            
        }
        
    }
}

$endMs = (Get-Date)
Write-Host $($startMs - $endMs)

$startMs = (Get-Date)
$json_building = asp-cli get-units --parentid $newpropertyid | Out-String | ConvertFrom-Json

Write-Host $json_building.name.value.text
foreach($building in $json_building.results)
{
    $json_region2 = asp-cli get-units --parentid $building.id --cache three_levels.json --format compact | Out-String | ConvertFrom-Json

    Write-Host $json_region2.name.value.text

    foreach($region2 in $json_region2.results)  
        $json_region3 = asp-cli get-units --parentid $region2.id --cache three_levels.json --format compact | Out-String | ConvertFrom-Json
    }
}

$endMs = (Get-Date)
Write-Host $($startMs - $endMs)


