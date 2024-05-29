# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

Write-Host "List of reference calls with multi api cli calls"
Exit 

$unitid="<unitid>"
$unitid2="<unitid>"
$skillid="<skillid>"
$stage="live"
$unitids = "$unitid,$unitid2"

asp-cli "get-skill-enablement" --unitid $unitid --skillid $unitid2

asp-cli "get-skill-enablements" --unitid $unitid


asp-cli "get-skill-enablement-multiple-units" --unitids $unitids

asp-cli "enable-skill-for-unit" --skillid $skillid --unitid $unitid # --stage --partition --linkredirecturi --linkauthcode --nfilocales

asp-cli "enable-skill-multiple-units" --skillid $skillid --unitids $unitids # --stage --partition --linkredirecturi --linkauthcode --nfilocales

asp-cli "disable-skill-for-unit" --skillid $skillid --unitid $unitid --stage $stage

asp-cli "disable-skill-multiple-units" --skillid $skillid --unitids $unitids --stage $stage


asp-cli "create-discovery-session" --skillid $skillid --unitid $unitid

$sessionid = "amzn1.alexa.discoverySession.8ee1734d-fac3-4a59-8dc7-c47bd740e029"
asp-cli "get-discovery-session-status" --sessionid $sessionid


