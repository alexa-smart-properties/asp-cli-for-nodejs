# Please note that by default ASP Rooms are L3 units. To list all rooms under a property, please use L2 unit's ID as parent.
$parentId = "amzn1.alexa.unit.did..."

$units = asp-cli get-units --parentid $parentId | ConvertFrom-Json

foreach ($unit in $units.results) {
    Write-Output "Unit ID: $($unit.id)"
    Write-Output "Unit Name: $($unit.name.value.text)"

    # Retrieve all endpoints (devices) associated with the current unit - these will include both Echo devices and Smart Home devices.
    $endpoints = asp-cli get-endpoints --unitid $unit.id | ConvertFrom-Json

    # Iterate over each endpoint (device)
    foreach ($endpoint in $endpoints.results) {
        Write-Output "`tEndpoint ID: $($endpoint.id)"
        Write-Output "`tEndpoint Name: $($endpoint.friendlyName.value.text)"
        Write-Output "`tEndpoint Description: $($endpoint.description.value.text)"
        Write-Output "`tEndpoint Manufacturer Name: $($endpoint.manufacturer.value.text)"
        Write-Output "`tEndpoint Device Type: $($endpoint.model.value.text)"
        Write-Output "`t---"

        #Use deregister-endpoint if they are online; otherwise use forget-endpoint.
        #asp-cli forget-endpoint --endpointid $endpoint.id # !! Please uncomment only after you have confirmed the script is returning the endpoints to delete.

        Write-Output "`tEndpoint forgotten"
        Write-Output "`t---"
    }
    
    # Delete the empty room
    #asp-cli delete-unit --unitid $unit.id # !! Please uncomment only after you have confirmed the script is returning the units to delete.
    
    Write-Output "`tUnit deleted"
    Write-Output "`t---"
    
    Write-Output "====================="
}
