# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import subprocess
import json
import csv

propertyid = "<propertyid>"
orgid = "<orgid>"
aspapidelay = 900
authToken = "<authToken>"

# "--aspapiurl", aspapiurl,
command = ["asp-cli", "init", "--propertyid", propertyid, "--orgid", orgid,  "--aspapidelay", "1000", "--authtoken", 'Hello|World' ]
subprocess.run(command, shell=True,capture_output=True, text=True)

parentid = propertyid
subprocess.run(["asp-cli", "get-units", "--parentid", parentid], shell=True)

# Execute the command and get the JSON output
process = subprocess.run(["asp-cli", "get-units", "--parentid", parentid], capture_output=True, text=True, shell=True)
json_output = json.loads(process.stdout)
print(json_output)

# Extract first unit ID
unitid = json_output['results'][0].get('id', None)
print("first unitid: " + unitid)

# Execute the command to create a new unit and get the JSON output
process = subprocess.run(["asp-cli", "create-unit", "--parentid", parentid, "--name", "new unit 121"], capture_output=True, text=True, shell=True)
json_output = json.loads(process.stdout)

# Extract the new unit ID
newunitid = json_output.get('id', None)
print("new unitid: " + newunitid)

quit()