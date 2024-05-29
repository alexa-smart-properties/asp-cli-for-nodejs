# ASP-CLI Cookbook

## Introduction
This cookbook provides examples and recipes for using the `asp-cli` command-line tool.


- Getting started with the asp-cli
- Recipe 1: Working with asp-cli results
- Recipe 2: Managing Property Units and Endpoints
- Recipe 3: Creating a Smart Property from the asp-cli
- Recipe 4: Creating Units / Assigning Endpoints
- Recipe 5: Managing Skills
- Recipe 6: Managing Endpoints
- Recipe 7: Managing Addressbooks & Contacts
- Recipe 8: Managing Notifications and Campaigns
- Recipe 9: Caching Property
- Recipe 10: Bulk Operations
- Recipe 11: Using the `--output` parameter
- Recipe 12: Reporting 
- Recipe 13: Using the project files for NodeJS apps. 
- Recipe 14: Using Sample Scripts

## Getting started with the asp-cli

1. Follow the instructions in the [README.md](README.md) to ensure that the asp-cli is installed and the authentication is configured.
2. Open a terminal or command prompt.
3. Navigate to the directory where `asp-cli` is installed.
4. Run the following command to retrive devices that are in the account but not assigned to a property unit/room:

```asp-cli get-endpoints```

If the business account associated with the authentication credentials contains unassigned units, they will be included in the results. It is important to note that the response from the API call will return the same results as making the corresponding REST call for all endpoints, as documented in the [ASP REST API](https://developer.amazon.com/de-DE/docs/alexa/alexa-smart-properties/endpoint-api.html#get-all-endpoints).

When processing the results within a script, it is recommended to refer to the ASP REST API documentation for the expected JSON format. There are a few minor differences compared to the ASP REST API. The status code of a REST API call is always included directly in the JSON result. Additionally, some ASP REST API calls may not return JSON data. In such cases, the response will include `{"statuscode": 200}` to indicate a successful or error response, ensuring that all `asp-cli` responses can be processed as JSON.

    > asp-cli get-endpoints

    Result:
    {
        "statuscode": 200
        "results": [
            {
                "id": "amzn1.alexa.endpoint...
                ...

## Recipe 1: Working with asp-cli results

The JSON results from an asp-cli call can be used for subsequent api calls. For example, the `asp-cli create-unit` call will return JSON that contains a new Unit ID. This ID can be used for other setup actions such as assigning devices to the unit or updating Unit settings. 

### Example: Processing the asp-call results

To run the bash script examples, you will need to install the `jq` library. `jq` is a lightweight and flexible command-line JSON processor. You can find the `jq` installers here: [jq project site](https://jqlang.github.io/jq/).


The following example demonstrates how to use the `jq` CLI processor to extract a list of property IDs from an ASP-CLI call and store them in a shell variable called `ids`.

    # set a valid orgid
    orgid=<orgid>

    ids=$(asp-cli get-units --parentid $orgid | jq -r '.results | map(.id) | join(",")')
    echo $ids


For PowerShell, the native functionality to process JSON and CSV will be used. Here is the same result in PowerShell to capture a list of property IDs in a shell variable (`ids`).
    

    $orgid=<orgid>

    $ids = (asp-cli get-units --parentid $orgid | ConvertFrom-Json).results.id -join ","
    echo $ids

In addition, an asp-cli call can have an `--output` parameter that can filter the returned results based on a path in the JSON. 

For example, the id will be directly returned without the need for JSON parsing in the script. 

    asp-cli create-unit --name "Room 207" --ouput id


## Recipe 2: Managing Property Units and Endpoints

The following call to `get-units` takes a parameter `--parentid` and will return all the units under that `parentid`. In this case the the orgid is being used which will return all the properties created within the organization. 

    $orgid = "<specify orgid>"
    asp-cli get-units --parentid $orgid

The following call will return all the units in a parent group and make a call it `get-endpoints` to return all the endpoints for a unit.

    

    # using jq and bash. Specifying just Amazon endpoints.
    parentid="<specify parentid>"
    units=$(asp-cli get-units --parentid $parentid)

    jq -r '.results[].id' <<< $units | while read -r id; do
        unitid=$id
        asp-cli get-endpoints --unitid $unitid --manufacturer "Amazon"
    done

    # using Powershell
    $parentid = "<specify parentid>"
    $units = asp-cli get-units --parentid $parentid  | Out-String | ConvertFrom-Json 

    foreach($unit in $units.results)
    {
        asp-cli get-endpoints --unitid $unitid --manufacturer "Amazon"
    }


## Recipe 3: Creating a Smart Property from the asp-cli

The `asp-cli` provides the ability to create a smart property from scratch. In order for the property to work well within the ASP Web Console it uses the following Smart Property structure. 

    Organization -> Property -> Default Group   

Using the following `asp-cli` to create a Property with the same structure. This will create the propery, create the Default unit parent and assign the base skill for the Property type. 

    asp-cli create-property --name "Anchorage Healthcare" --type "healthcare_us"


Property types can be one of the following types currently:

Healthcare: `healthcare_us`

Hospitality:
`hospitality_ca`
`hospitality_de`
`hospitality_es`
`hospitality_fr`
`hospitality_it`
`hospitality_jp`
`hospitality_uk`
`hospitality_us`

Senior Living:
`seniorliving_ca`
`seniorliving_de`
`seniorliving_es`
`seniorliving_fr`
`seniorliving_it`
`seniorliving_jp`
`seniorliving_uk`
`seniorliving_us`


The following will create a new property and capture the propertyid. The Default unit parent is then captures via a `get-units` action.

    $propertyid = asp-cli create-property --name "Redmond Springs" --type "seniorliving_us" --output id
    $parentid = asp-cli get-units --parentid $propertyid --output results[0].id
    asp-cli create-unit --name "Unit 201" --parentid $parentid


## Recipe 4: Creating Units / Assigning Endpoints

The following will create a unit and assign an endpoint. The Default unit parent is then captures via a `asp-cli get-endpoints` without specifying a unitid to get a list of unassociated endpoints. Later examples with can simply these steps by selecting unit and endpoint by other properties such as name and serial number. This will be useful when creating associations via scripts leveraging files such as CSVs that define the designations.

    $parentid=<specify parentid>
    $endpointid=<specify endpointid>
    $newunitid = asp-cli create-unit --parentid $parentid --name "Room 101" --output id
    asp-cli associate-unit --unitid $newunitid --endpointid 


## Recipe 5: Managing Skills

A skill can be enabled on a unit by the `enable-skill-for-unit` action. Alternatively, multiple units can enable a skill with the `enable-skill-multiple-units` action. 

    $skillid=<specify skillid>
    $unitid=<specify unitid>
    asp-cli "enable-skill-for-unit" --skillid $skillid --unitid $unitid  --stage "live"

    asp-cli "enable-skill-multiple-units" --skillid $skillid --unitids $unitids 

A skill can be disabled on a unit by the `disable-skill-for-unit` action with the `disable-skill-multiple-units` for batch operations. 

    asp-cli "disable-skill-for-unit" --skillid $skillid --unitid $unitid --stage "live"

    asp-cli "disable-skill-multiple-units" --skillid $skillid --unitids $unitids --stage "live"

Utilize the `create-discovery-session` to find endpoints via a Skill. 

    asp-cli "create-discovery-session" --skillid $skillid --unitid $unitid
    $sessionid = ...
    asp-cli "get-discovery-session-status" --sessionid $sessionid

## Recipe 6: Managing Endpoints

There are a series of cli calls that can be used to manage or update endpoints. These can be used for adhoc actions on a room or to "reset" a room for a new occupant. 

    $unitid=<specify unitid>
    asp-cli delete-all-alarms --unitid $unitid
    asp-cli delete-all-reminders --unitid $unitid
    asp-cli delete-all-timers --unitid $unitid
    asp-cli delete-all-notifications --unitids $unitid --type DeviceNotification
    asp-cli delete-all-notifications --unitids $unitid --type PersistentVisualAlert

    # get endpoints in unit
    endpointid=$(asp-cli get-endpoints --unitid $unitid | jq -r '.results[0] | .id?')

The connectivity of a specific endpoint can be accessed via the following `asp-cli` call

    # connectivity status
    asp-cli get-endpoint-connectivity --endpointid $endpointid 

Each endpoint setting has an action such as the following:

    # endpoint settings
    asp-cli set-colorinversion --endpointid $endpointid --value ENABLED
    asp-cli set-maximumvolume --endpointid $endpointid --value 50
    asp-cli set-donotdisturb --endpointid $endpointid --value true
    asp-cli set-locales --endpointid $endpointid --value "en-US,es-US"
    asp-cli set-wakewords --endpointid $endpointid --value ALEXA

In addition, each endpoint setting has a `get` action to get the value for a specific endpoint.

    # endpoint features
    asp-cli set-speaker-properties --endpointid $endpointid --operation set --value 75
    asp-cli set-speaker-properties --endpointid $endpointid --operation adjust --value '-60'
    asp-cli get-speaker-properties --endpointid $endpointid 
 
    asp-cli get-temperature --endpointid $endpointid
    asp-cli get-thermostat --endpointid $endpointid

## Recipe 7: Managing Addressbooks & Contacts

    asp-cli get-address-book --addressbookid $addressBookId
    asp-cli create-address-book --name "staff address book" 

    $addresssBookId = asp-cli create-address-book --name "campus east" --output id

    asp-cli get-communication-profile --unitid $unitid
    asp-cli get-communication-profile --profileid $profileId

    asp-cli update-communication-profile --profileid $profileId --name "new name"

    asp-cli delete-communication-profile --profileid $profileId 

    # always has name "Guest" after creation
    asp-cli create-communication-profile --unitid $unitid --name "new profile"

    $createResponse = asp-cli create-communication-profile --unitid $unitid --name "new profile" | Out-String | ConvertFrom-Json
    $newProfileId = $createResponse.profileId.profileId
    echo $newProfileId

    asp-cli update-communication-profile --profileid $newProfileId --name "new name"

    asp-cli create-address-book-association         --addressbookid $newAddressBookId --unitid $unitid
    asp-cli list-address-book-associations          --addressbookid $newAddressBookId --unitid $unitid
    asp-cli get-address-book-association            --addressbookid $newAddressBookId --unitid $unitid
    asp-cli delete-address-book-association         --addressbookid $newAddressBookId --unitid $unitid
    asp-cli create-bulk-address-book-associations   --addressbookid $newAddressBookId --unitid $unitid,$unitid
    asp-cli get-address-book-association            --addressbookid $newAddressBookId --unitid $unitid

    $contactId="...
    asp-cli create-reciprocal-association       --profileid $newProfileId --contactid $contactId
    asp-cli get-reciprocal-association-status   --profileid $newProfileId --contactid $contactId
    asp-cli delete-reciprocal-association       --profileid $newProfileId --contactid $contactId
    asp-cli set-drop-in-preference  --profileid $newProfileId --targetprofileid $newProfileId --value ENABLED   
    asp-cli get-drop-in-preference  --profileId $newProfileId --targetprofileid $newProfileId
    asp-cli create-blocking-rule    --profileId $newProfileId --targetprofileid 111 --value ENABLED
    asp-cli get-blocking-rule       --profileid  $newProfileId  --value ENABLED

## Recipe 8: Managing Notifications and Campaigns


    # clear DeviceNotifications from a single unit.
    asp-cli delete-all-notifications --unitids $unitid --type DeviceNotification
    
    asp-cli delete-all-notifications --unitids $unitid --type PersistentVisualAlert

    $sampleimage=https://d2o906d8ln7ui1.cloudfront.net/images/templates_v3/headline/HeadlineBackground_Dark.png

    # send-notification default type is notification
    asp-cli send-notification --unitids $unitid --text "Hello Notification"
    # send-notification and specify type announcement
    asp-cli send-notification --unitids $unitid,$unitid  --type announcement --text "Hello Announcement"

    # send-notification --type pva/wrapping with background and dismissaltime
    asp-cli send-notification --unitids $unitid --type pva --template wrapping --primarytext test --secondarytext test \
                            --background $sampleimage --dismissaltime "2025-04-30T10:00:00.00Z" 

    # send-notification --type pva/media with background and dismissaltime
    asp-cli send-notification --unitids $unitid --type pva --template media --primarytext test --secondarytext test \
                            --tertiarytext "tertiary text" --hintText "hint text" --attributionText "attribution text" \
                            --background $sampleimage --thumbnail $sampleimage \
                            --attributionimage $sampleimage --dismissaltime "2025-04-30T10:00:00.00Z"

    # send-notification --type pva/rating with background 
    asp-cli send-notification --unitids $unitid --type pva --template rating --headertext "header text" --primarytext "sample rating" \
                            --background $sampleimage --hintText "hint text" --ratingtext "my rating" --rating 1.5 --coloroverlay false


## Recipe 9: Caching Property

The `update-cache` action will create/update a json file with the units and endpoints within a property. By default it uses a more compact format that includes the commonly used data for management and reporting. 

Current the file cashe can include units,endpoints,skills, and connectivity. 


```
asp-cli update-cache --propertyid $propertyid --cache "filename.json"

# create/update a cache file containing the unit property hierarchy and the associated endpoints for each unit
asp-cli update-cache --propertyid $propertyid --cache "filename.json" --include "units,endpoints"

# create/update 
asp-cli update-cache --propertyid $propertyid --cache "filename.json" --include "skills"

```

If propertyid and cache have default values in the config (default.json), the caching calls would simply be:

    asp-cli update-cache

The following asp-cli calls support the caching parameter. The cache will be selectively updated based on the call results.
   
   
    asp-cli get-units 
    asp-cli get-unit
    asp-cli get-endpoints
    asp-cli get-endpoint
    get-skill-enablement 
    get-skill-enablements
    get-skill-enablement-multiple-units 
    get-endpoint-connectivity
    
    # returns a unit if found in the cache file. 
    asp-cli get-unit-cache --unitid $unitid --cache $cachefile

    # returns a unit if found in the cache file. includes 1 depth level of sub units if they exist.
    asp-cli get-unit-from-cache --unitid $unitid --cache $cachefile --depth 1

    asp-cli get-units-from-cache --parentid $parentid --cache $cachefile

    asp-cli get-units-from-cache --name "Building North" --cache $cachefile

    asp-cli get-units-from-cache --contains "202" --cache $cachefile

    ##########################

    # get all unsigned endpoints
    asp-cli get-endpoints-from-cache --cache $cachefile

    # get all endpoints assigned to unit
    asp-cli get-endpoints-from-cache --unitid $unitid --cache $cachefile

    # get assigned endpoints by model
    asp-cli get-endpoints-from-cache --model "Echo Show 8 (3rd Gen)" --cache $cachefile

    # get assigned endpoints by name or name contains
    asp-cli get-endpoints-from-cache --name "Endpoint Name" --cache $cachefile
    asp-cli get-endpoints-from-cache --contains "Endpoint Name" --cache $cachefile

    # get endpoint 
    asp-cli get-endpoint-from-cache --endpointid $endpointid --cache $cachefile
    asp-cli get-endpoint-from-cache --serial "G092MM063312000P" --cache $cachefile


## Recipe 10: Bulk Operations


Examples:

build file cache. run when needed or use partial update calls


The following calls require a `--cache` and `--propertyid` . For convenience these parameters have been added to the `default.json` config file like the following:

    "defaults": {
      "orgid": "amzn1.alexa.unit.did...",
      "propertyid" : "amzn1.alexa.unit.did...",
      "parentid" : "amzn1.alexa.unit.did...",
      "cache" : "campuswest.json"
    },

    asp-cli update-cache --include "units,endpoints"

    # same call without the defaults 
    asp-cli update-cache --include "units,endpoints" --parentid $parentid --cache $cache


delete all notifications of type 'DeviceNotification' for endpoints in a property

    asp-cli update-property-from-cache --apply delete-all-notifications --type DeviceNotification

add skills to every unit in property

    asp-cli update-property-from-cache --apply enable-skills-for-unit --skillids $skillid1,$skillid2

update address of every endpoint

    asp-cli update-property-from-cache --apply endpoint-feature --feature "address" --addressline1 "123 Main St" --city "Seattle" --stateorregion "WA" --postalcode 98104-2515 --countrycode "US"

notification for all rooms in property

    asp-cli update-property-from-cache --propertyid $propertyid  --cache "filename.json"  --apply notification --text "The East Building Cafe is closed today." 

Set the default music station for every unit in a property

    asp-cli update-property-from-cache --apply set-default-music-station --providerid I_HEART_RADIO --stationid 7193


## Recipe 11: Using the `--output` parameter

The `--output` parameter can be specified on any asp-cli for returning filtered results. 

The following cli call will return just the id.

    asp-cli create-unit --name "Room 207" --ouput id
    # result amzn1.alexa.unit.did...

The followin sets a script variable to a comma separated list of ids. 


    $ids = asp-cli get-units --parentid $parentid --ouput results[].id
    # $ids = amzn1.alexa.unit.did...,result amzn1.alexa.unit.did...,...

The following return just the model of an endpoint.

    # asp-cli get-endpoint --endpointid $endpointid --output model.value.text       
    # result Optimus

## Recipe 12: Reporting 

The cache file can be incrimentaly updated and can provide common reporting scenarios. For example, the following `update-cache` call will create a json cache of all the units and associated endpoints in a Property.

    propertyid=<specify propertyid>
    cachefile=<specify json file to create/update>

    asp-cli update-cache --propertyid $propertyid --cache $cachefile --include "units,endpoints"

The following cli action will iterate the cached units and make an ASP API call for each endpoint to check the connectivity status

    asp-cli update-cache --propertyid $propertyid --cache $cachefile --include "connectivity"


The json cache now included the "lastsampletime","connectivity","lastconnected" of every endpoint in a Property. This command couple be run at some frequecy to provide reporting on the current status of endpoint and when they had last connected successfully.


## Recipe 13: Using the project files for NodeJS apps. 

The js files in the utils/ folder can be used directly in other nodejs/javascript projects without dependancies other than axios. The following defaults need to be set on axios: 

    axios.defaults.headers.common['Authorization'] = "Bearer " + apiSettings.authToken;
    axios.defaults.headers.common['Asp-Cli'] = 'v1.0.0';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.defaults.headers.put['Content-Type'] = 'application/json';

  A good reference file to start is the [processes/createProperty.js](processes/createProperty.js) js file. This shows creating units and assigning skills which requires: aspProperty.js, aspSkills, and asp-api-helpers. 

## Recipe 14: Using Sample Scripts

The samples folder in the project contains bash shell and Powershell scripts to use as references. The files prefixed samples_ contain a variety of `asp-cli` calls and variations of parameters and optional parameters.


