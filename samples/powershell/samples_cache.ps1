Write-Host "List of sample calls for the caching api"
Exit 

# $orgid="<orgid>"
$propertyid="<propertyid>"
$parentid="<unitid>"
$unitid="<unitid>"
$endpointid="<unitid>"
$cachefile="property_cache.json"

# adding --cache param will add results of the call to a cache file

# caches the results of get-unit to file. creates file if it does not exist
asp-cli get-unit --unitid $unitid --cache $cachefile

# caches the results of get-unit to file with a compact format
# once a format is specified for a file it cannot change. best to pass on all calls. default is "full".
# ie { "id": "amzn1.alexa.unit.did...","name": "Room 105","type": "unit","level": 4}
asp-cli get-unit --unitid $unitid --cache $cachefile --format "compact"

# caches the results of get-unit to file with a id-only format
# ie { "id": "amzn1.alexa.unit.did...","type": "level"}
asp-cli get-unit --unitid $parentid --cache $cachefile --format "ids-only"

# caches the results of get-units to file. 
asp-cli get-units --parentid $parentid --cache $cachefile --format "compact"

# caches the results of get-endpoints to file. 
#it this case will will add an ["endpoints"] array to cache file that are unassigned case not --unit is specified. 
asp-cli get-endpoints --cache $cachefile --format "compact"

# caches the results of get-endpoints to file creating a ["endpoints"] array in the "unit" object 
asp-cli get-endpoints --unitid $unitid --cache $cachefile --format "compact"

# caches the results of get-endpoint to file creating a ["endpoints"] array in the "unit" object 
asp-cli get-endpoint --endpointid $endpointid --cache $cachefile --format "compact"

##########################
# property export formats: full,compact,ids-only includes: [units],endpoints,skills

# caches the entire unit hierarchy to cache file in the compact format.
asp-cli update-cache --propertyid $propertyid --cache $cachefile --format "compact"

# caches the entire unit hierarchy with ["endpoints"] under each unit and an unassigned endpoint collection at the root .
asp-cli update-cache --propertyid $propertyid --cache $cachefile --include "endpoints"  --format "compact"

# includes unit hierarchy, endpoints, and unit skills.
asp-cli update-cache --propertyid $propertyid --cache $cachefile --include "endpoints,skills" 

asp-cli update-cache --propertyid $propertyid --cache $cachefile --include "units,endpoints,skills" 

##########################
# get-units-cashe, get-unit-cache

# returns a unit if found in the cache file. 
asp-cli get-unit-cache --unitid $unitid --cache $cachefile

# returns a unit if found in the cache file. includes 1 depth level of sub units if they exist.
asp-cli get-unit-cache --unitid $unitid --cache $cachefile --depth 1

asp-cli get-units-cache --parentid $parentid --cache $cachefile

asp-cli get-units-cache --name "Building North" --cache $cachefile

asp-cli get-units-cache --contains "202" --cache $cachefile

##########################
# get-endpoints-cashe, get-endpoint-cashe

# get all unsigned endpoints
asp-cli get-endpoints-from-cache --cache $cachefile

# get all endpoints assigned to unit
asp-cli get-endpoints-from-cache --unitid $unitid --cache $cachefile

# get assigned endpoints by model
asp-cli get-endpoints-from-cache --model "Echo Show 8 (3rd Gen)" --cache $cachefile

# get assigned endpoints by name
asp-cli get-endpoints-from-cache --name "Endpoint Name" --cache $cachefile

# get assigned endpoints by name contains
asp-cli get-endpoints-from-cache --contains "Endpoint Name" --cache $cachefile

# get endpoint 
asp-cli get-endpoint-from-cache --endpointid $endpointid --cache $cachefile
asp-cli get-endpoint-from-cache --serial "G092MM063312000P" --cache $cachefile

##########################
# get-endpoints-cashe, get-endpoint-cashe

# asp-cli update-endpoint-from-cache --endpointid $endpointid --cache $cachefile --asp_lastconnected "1713214716" --asp_checked "1713214716"

# skills


# Import the JSON file
$jsonData = Get-Content -Raw -Path "path/to/json/file.json" | ConvertFrom-Json

# Create an empty array to store the CSV data
$csvData = @()

# Iterate over the units in the JSON data
foreach ($unit in $jsonData.units) {
    $unitName = $unit.name

    # Iterate over the endpoints in the unit
    foreach ($endpoint in $unit.endpoints) {
        $endpointName = $endpoint.name
        $serial = $endpoint.serial
        $lastConnected = $endpoint.lastconnected
        $connectivity = $endpoint.connectivity

        # Create a hashtable representing a row of CSV data
        $csvRow = @{
            "unit name" = $unitName
            "endpoint name" = $endpointName
            "serial" = $serial
            "lastconnected" = $lastConnected
            "connectivity" = $connectivity
        }

        # Add the row to the CSV data array
        $csvData += $csvRow
    }
}

# Export the CSV data to a file
$csvData | Export-Csv -Path "path/to/output.csv" -NoTypeInformation