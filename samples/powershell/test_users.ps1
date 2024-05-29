# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/
Write-Host "List of reference calls users/roles api cli calls"
Exit 

$orgid="<orgid>"
$userid="<userid>"

asp-cli create-user --orgid $orgid

asp-cli get-users --orgid $orgid

asp-cli delete-user --userid $userid