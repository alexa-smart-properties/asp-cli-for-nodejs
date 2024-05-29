# Getting Started with the asp-cli

## Setup

Before you can start using the `asp-cli`, you need to set up your environment. Follow these steps:

1. Install NodeJS https://nodejs.org/en/download

2. If using the bash sample scripts you will need to install https://jqlang.github.io/jq/download/ for your platform. Do not install jq via the nodejs npm package manager. The jq tool is a  command-line JSON processor used in the samples to parse ids and values out of api results.

3. Clone this repository to your computer

   `clone git@github.com:alexa-smart-properties/[REPONAME_REPLACE]`

4. Update npm

    Run `npm update` in your terminal. 

5. Install asp-cli

   1. Navigate to directory where you have cloned or downloaded `asp-cli` on step 3. 
   2. Run `npm update` in the directory
   3. `npm install . -g` in your terminal. This command installs `asp-cli` globally on your machine, allowing you to run it from anywhere.

6. Configure

   Edit the file config/default.json and update <client_id>, <client_secret>, and <refresh_token>

   To create security profile to obtain client_id and client_secret, please refer https://developer.amazon.com/docs/login-with-amazon/register-web.html#create-a-new-security-profile

   

   *Please be aware that when executing the CLI, it expects a `config` directory in the current working directory. If you are running the CLI outside of the `asp-cli` directory, ensure that a `config` directory and a `default.json` file in a `config` directory are present in your current working directory.*

   The token_file is where the temporary access_token and expiration date.

   ```
   {
    "asp_cli": {
    "delay":  "800",
    "aspapibase": "https://api.amazonalexa.com",
    "auth": "oauthLocal"
    },
    "secretsManager" : {
      "secretNameForOAuth": "<secretname>",
      "versionStage": "AWSCURRENT",
      "regionName": "<region>"
    },
    "oauthLocal": {
      "client_id": "<client_id>",
      "client_secret": "<client_secret>",
      "refresh_token":"<refresh_token>",
      "cacheToken": true,
      "token_file": "token.json",
      "access_token":""
    }
   }
   ```

Options:

  The setting "auth": "..." can have the following settings:
  - `"auth": "oauthLocal"` - This will use the oauthLocal config section for auth and utilize a cached token file if enabled.
  - `"auth": "secretsManager"` - This will use the secretsManager config section for auth and utilize an AWS Secrets Manager. Refer to [secretsmanager.md](secretsmanager.md) for how to configure the AWS Secrets Manager and use it with the CLI.


## Uninstall

To uninstall the `asp-cli`, run the following command in your terminal:

`npm uninstall @amzn/asp-cli -g` 

## Usage

Note: unitId needs to be retrieved from `asp-cli` or API call.
### Get Endpoints

- `asp-cli get-endpoints [--unitid]`
  - This command retrieves all endpoints. If you provide a unit ID as an argument, it retrieves only the endpoints associated with that unit. If no unit ID is provided, it retrieves all endpoints owned by the caller.


### Properties

- `asp-cli get-units --parentid [--depth]`
  - This command retrieves units. You need to provide the parent ID and optional depth as arguments.

- `asp-cli get-unit --unitid`
  - This command retrieves a specific unit. You need to provide the unit ID as an argument.

- `asp-cli create-unit --parentid --name`
  - This command creates a new unit. You need to provide the parent ID and name as arguments.

- `asp-cli update-unit --unitid --name`
  - This command updates a specific unit. You need to provide the unit ID and new name as arguments.

- `asp-cli delete-unit --unitid`
  - This command deletes a specific unit. You need to provide the unit ID as an argument.


### Unit Settings

- `asp-cli get-default-music-station --unitid`
  - You will get default music station on the unit. You need to provide the unit ID as an augument.
- `asp-cli set-default-music-station --unitid --providerid --stationid`
  - You can set default music station on the unit. You need to provide the unit ID, provider ID, and station ID.
    - [Provider and station ID Reference](https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/unit-api.html#provider-station-id)
- `asp-cli delete-all-reminders --unitid`
  - You can delete all reminder on the unit. You need to provide the unit ID.
- `asp-cli delete-all-alarms --unitid`
  - You can delete all alarms on the unit. You need to provide the unit ID.
- `asp-cli delete-all-timers --unitid`
  - You can delete all timer on the unit. You need to provide the unit ID.

### Skill Settings

- `asp-cli get-skill-enablement --unitid --skillid`
  - Get the skill enablement record for a specific skill for a unit. You need to provide unit ID and skill ID.
- `asp-cli get-skill-enablements --unitid`
  - list the skill enablement record for the unit. You need to provide unit ID.
- `asp-cli get-skill-enablement-multiple-units --unitids`
  - Get the skill enablement for multiple units. You need to provide unit IDs separeted by comma. 
- `asp-cli enable-skill-for-unit --skillid --unitid --stage --partition --linkredirecturi --linkauthcode --nfilocales`
  - Enable a skill to a unit. You need to provide skill ID, unit ID, and skill stage (development/live)
  - --partition, --linkredirecturi, --linkauthcode, --nfilocales are optional
- `asp-cli enable-skill-multiple-units --skillid --unitids --stage --partition --linkredirecturi --linkauthcode --nfilocales`
  - Enable a skill to multiple units. You need to provide skill ID, unit IDs(comma separated), and skill stage (development/live)
  - --partition, --linkredirecturi, --linkauthcode, --nfilocales are optional
- `asp-cli disable-skill-for-unit --unitid --skillId --stage`
  - Disable a skill to a unit. You need to provide unit ID, skill ID, and skill stage (development/live)
- `asp-cli disable-skill-multiple-units --skillId --unitids --stage`
  - Disable a skill to units. You need to provide unit IDs (comma separated), skill ID, and skill stage (development/live)

### Notifications

- `asp-cli delete-all-notifications --unitids [--type]`
  - This command deletes all notifications. You need to provide the unit IDs as arguments. The type defaults to type options are `DeviceNotification`,`PersistentVisualAlert`.

- `asp-cli send-notification --unitids --type --text --locale [--template] [--headertext] [--primarytext] [--secondarytext] [--tertiarytext] [--hinttext] [--attributiontext] [--ratingtext] [--rating] [--background] [--thumbnail] [--attributionimage] [--coloroverlay] [--dismissaltime]`
  - This command sends a notification. You need to provide the unit IDs, type, text, and locale as arguments. The notification types are notification,announcement,alert.


### Communications

- `asp-cli create-comms-profile --unitid --profilename`
  - Create a communication profile for a unit. You need to provide unit ID and profile name. It enables the communication capability and creates a profileId for a unit.
- `asp-cli update-comms-profile --profileid --profilename`
  - Update a communication profile. 
- `asp-cli get-comms-profile --profileid`
  - Get a communication profile by profile ID.
- `asp-cli get-comms-profile-by-entity --entityid`
  - Get a coommunnication profile by entity ID.
- `asp-cli delete-comms-profile --profileid`
  - Delete a communication profile.
- `asp-cli create-address-book --name`
  - Create address book.
- `asp-cli list-address-books`
  - List address books.
- `asp-cli get-address-book --addressbookid`
  - Get address book by address book ID.
- `asp-cli create-contact --addressbookid --name --phone`
  - Create contact to an address book. 
- `asp-cli list-contacts --addressbookid`
  - List contacts under an address book.
- `asp-cli get-contact --contactid`
  - Get contact by contact ID.
- `asp-cli update-contact --contactid --name --phone`
  - update contact. You need to provide contact ID, name and phone.
- `asp-cli delete-contact --contactid`
  - Delete contact by contact ID.
- `asp-cli create-address-book-association --addressbookid --unitid`
  - Associate an address book with a unit. You need to provide address book ID and address book ID.
- `asp-cli list-address-book-associations --addressbookid`
  - List address book associations.
- `asp-cli get-address-book-association --associationid`
  - Get address book association by association ID.
- `asp-cli delete-address-book-association --associationid`
  - Delete address book association.
- `asp-cli create-reciprocal-association --entityid1 --entityid2`
  - Create a reciprocal association between profileId of a property unit and contactId of an external contact to provide the external contact the ability to place inbound calls to devices associated with the property unit
- `asp-cli get-reciprocal-association-status --entityid1 --entityid2`
  - Get reciprocal association status between entity IDs.
- `asp-cli delete-reciprocal-association --entityid1 --entityid2`
  - Delete reciprocal association between entity IDs.
- `asp-cli set-drop-in-preference --entityid --preference`
  - Set drop-in preference. [NeedToCheck]
- `asp-cli get-drop-in-preference --profileId --targetprofileid --value`
  - Get the current state of drop-in permission from Alexa Unit to another.
- `asp-cli create-blocking-rule --profileId --targetprofileid --value`
  - Creates a blocking rule to disable calling and messaging between two property units. You need to provide profile ID, taget ID and value(ENABLED/DISABLED). 
- `asp-cli get-blocking-rule --profileid --value`
  - Get a blocking rule that enables or disables calling and messaging between two property units. You need to provide profile ID. 

### Bluetooth

- `asp-cli get-bluetooth-features --endpointid`
  - Get the Bluetooth properties of the specified endpoint.
- `asp-cli unpair-all-bluetooth-devices --endpointid`
  - Unpair all Bluetooth devices from the specified Alexa-enabled endpoint.

### Endpoints

- `asp-cli get-endpoints --unitid`
  - This command retrieves all endpoints. If you provide a unit ID as an argument, it retrieves only the endpoints associated with that unit. 
- `asp-cli get-endpoint --endpointid`
  - Get an endpoint. You need to provide endpoint ID. 
- `asp-cli associate-unit --endpointid --unitid`
  - Associate a device to a unit. You need to provide endpoint ID and unit ID.
- `asp-cli disassociate-unit --endpointid`
  - Disassoaciate a device from a unit.
- `asp-cli get-endpoint-connectivity --endpointid`
  - Get the connection status of the specified endpoint.
- `asp-cli get-endpoint-settings --endpointid --keys`
  - You get endpoint settings.
  - Please refer https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/endpoint-settings-api.html#get-multiple-settings-request-header-parameters for keys.
- `asp-cli update-endpoint --endpointid --setting --value`
  - Update settings
  - Please refer https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/endpoint-settings-api.html#put-alexacaptions-setting for setting and value.

#### Convenience actions instead of `update-endpoint`

- `asp-cli set-donotdisturb --endpointid --value`
  - Update the DoNotDisturb setting for the specified endpoint. You need to provide endpoint ID and value(true/false)
- `asp-cli set-locales --endpointid --value`
  - Update the preferred locales for the specified endpoint. You can set multipl local with comma seprated input.
- `asp-cli set-wakewords --endpointid --value`
  - Update wake word. You need to provide endpoint ID and value(ALEXA, AMAZON, COMPUTER, ECHO). COMPUTER isn't supported by fr-FR.
- `asp-cli set-wakewordconfirmation --endpointid --value`
  - Update the start-of-request wake-word confirmation setting for the specified endpoint. This setting specifies whether to play an audible tone in addition to the visual indicator when Alexa detects the wake word. The tone indicates that Alexa is now listening and capturing the request. You need to provide endpoint ID and value(TONE/NONE)
- `asp-cli set-speechconfirmation --endpointid --value`
  - Update the end-of-request sound confirmation setting for the specified endpoint. This setting allows the user to specify whether they want a short tone to play at the end of their request to Alexa to indicate that Alexa has finished listening to and capturing the request. You need to provide endpoint ID and value(TONE/NONE)
- `asp-cli set-followup --endpointid --value`
  - Update the follow-up mode setting for the specified endpoint. If enabled, this setting allows Alexa to listen for a subsequent request from the user without requiring the user to say the wake word. You need to provide endpoint ID and value(true/false)
- `asp-cli set-temperatureunit --endpointid --value`
  - Update the temperature scale setting for the specified endpoint. You need to provide endpoint ID and value(CELSIUS/FAHRENHEIT)
- `asp-cli set-distanceunits --endpointid --value`
  - Update the distance units (metric or imperial) setting for the specified endpoint. You need to provide endpoint ID and value(IMPERIAL/METRIC)
- `asp-cli set-magnifier --endpointid --value`
  - Update the magnifier setting for the specified endpoint. This setting gives the user the ability to enlarge items on Alexa-devices with a screen to improve readability. You need to provide endpoint ID and value(DISABLED/ENABLED)
- `asp-cli set-closedcaptions --endpointid --value`
  - Update the closed caption setting for the specified endpoint. This setting controls whether a multimedia device displays closed captions for video content. you need to provide endpoint ID and value(DISABLED/ENABLED).
- `asp-cli set-alexacaptions --endpointid --value`
  - Update the Alexa caption setting on the specified endpoint. This setting controls whether a multimedia device displays the following information:
    - Alexa captions, which provide the text version of what Alexa speaks through the SpeechSynthesizer interface. All domains that use Alexa Voice Service (AVS) should provide captions.
    - Captions that accompany AudioPlayer directives.
    - You need to provide endpoint ID and value(DISABLED/ENABLED)
- `asp-cli set-colorinversion --endpointid --value`
  - Update the screen color inversion setting for the specified endpoint. This setting gives the device user the ability to invert the screen display colors to improve readability. You need to provide endpoint ID and value(DISABLED/ENABLED)
- `asp-cli set-timezone --endpointid --value`
  - Update the time zone setting for the specified endpoint. You need to provide endpoint ID and value(https://www.iana.org/time-zones. i.e. "America/New_York")
- `asp-cli set-speakingrate --endpointid --value`
  - Update the speaking-rate setting for the specified endpoint. This setting adjusts Alexa's speech to a preferred pace on an Alexa-enabled device. You need to provide endpoint ID and value(0.75, 0.85, 1, 1.25, 1.5, 1.75, 2)
- `asp-cli set-errorsuppression --endpointid --value`
  - Update the list of errors that Alexa suppresses for the specified endpoint. This setting controls whether the device plays error audio cues, such as brief, distinctive sounds, when errors occur. You need to provide endpoint ID and value(CONNECTIVITY)
- `asp-cli set-maximumvolume --endpointid --value`
  - Update the maximum volume-limit setting for the specified endpoint. You need to provide endpoint ID and value(0–100)
- `asp-cli set-timeformat --endpointid --value`
  - Update the clock time-format setting for the specified endpoint. You need to provide endpoint ID and value(12_HOURS/24_HOURS)
  
  


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the Amazon Software License.

