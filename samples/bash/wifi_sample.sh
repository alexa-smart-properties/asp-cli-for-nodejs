# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/


wifiConfigurations="$(< ./samples/bash/wificonfig_sample.json)"

# CA, US credential-locker-service.amazon.com
# DE, ES, FR, IT, UK credential-locker-service.amazon.eu
# JP credential-locker-service.amazon.jp

# default host for cli credential-locker-service.amazon.com
asp-cli save-wifi-configurations --configurations "$wifiConfigurations"
# set-wifi-configuration with host set
asp-cli save-wifi-configurations --configurations $wifiConfigurations --host "credential-locker-service.amazon.eu"

# setting wifi on endpoint
endpointid=<endpointid> # replace with your endpointid
asp-cli set-wifi-configuration --endpointid $endpointid --ssid "wifi-ssid" --keymanagement "WPAPSK"

operationId=$(asp-cli set-wifi-configuration --endpointid $endpointid --ssid "wifi-ssid" --keymanagement "WPAPSK" | jq -r '.submittedOperationId')
# json='{"submittedOperationId": "operationId"}'
echo $operationId
asp-cli getWifiInstallationStatus --endpointid $endpointid --operationid $operationid

