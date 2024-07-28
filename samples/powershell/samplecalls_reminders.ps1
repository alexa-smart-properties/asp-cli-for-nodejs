# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

Write-Host "List of sample calls for the ASP Reminders APIs"
Exit 

$endpointid = "<valid endpointid>"

# create a simple reminder and capture the first reminderid created
$reminderid = asp-cli create-reminder --endpointids $endpointid --scheduledtime "2024-08-29T16:30:00.000" --timezoneid "America/Los_Angeles" --text  "Bingo starts at five p.m." --output "successResults[].reminderId"

# get all reminder by reminder id
asp-cli get-reminder --reminderid $reminderid

# update reminder with reminder id and single endpointid
asp-cli update-reminder --reminderid $reminderid --endpointid $endpointid --scheduledtime "2024-08-29T16:30:00.000" --timezoneid "America/Los_Angeles" --text  "Bingo starts at seven p.m." 

# delete reminder by reminder id 
asp-cli delete-reminder --reminderid $reminderid

# create reminder with recurrence rules
asp-cli create-reminder --endpointids $endpointid --timezoneid "America/Los_Angeles" --text  "Bingo starts at five p.m." `
--startdatetime "2024-08-01T00:00:00.000"  `
--enddatetime "2024-09-30T00:00:00.000" `
--recurrencerules "FREQ=MONTHLY;BYMONTHDAY=5;BYHOUR=16;BYMINUTE=30;INTERVAL=1;"

# update a reminder
asp-cli create-reminder --endpointids $endpointid --timezoneid "America/Los_Angeles" --text  "Bingo starts at six p.m." `
--startdatetime "2024-08-01T00:00:00.000"  `
--enddatetime "2024-09-30T00:00:00.000" `
--recurrencerules "FREQ=MONTHLY;BYMONTHDAY=5;BYHOUR=16;BYMINUTE=30;INTERVAL=1;"

# get all reminders by endpoint id
asp-cli get-reminders --endpointid $endpointid








