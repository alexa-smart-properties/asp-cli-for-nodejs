# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

Write-Host "List of sample calls for for SNS Events Subscribing "
Exit 

$channelids = "arn:aws:sns:..."
$configurationid = "amzn1.alexa.aem.subscription...."
$unitid = "<unit id>"
$parentid = "<parent id>"
$skillid = "amzn1.ask.skill...."
$subscriptionid = "amzn1.alexa.aem.subscription...."

# skill id of the premium events enabler
$premiumeventsskillid = "amzn1.ask.skill...."


# create a subsciption 
# asp-cli create-subscription-configuration --type "SNS" --channelids $channelids
# asp-cli create-subscription-configuration --channelids $channelids
# create a new subscription and capture the id
$configurationid = (asp-cli create-subscription-configuration --channelids $channelids --output id)

# gets a subscription configuration by configurationid
asp-cli get-subscription-configuration --configurationid $configurationid

# gets all subscription configurations 
asp-cli get-subscription-configurations

# deletes a subscription configuration by configurationid
asp-cli delete-subscription-configuration --configurationid $configurationid

# Alexa.Automation.Execution.Completion
asp-cli create-subscription --configurationid $configurationid --eventnamespace "Alexa.Automation.Execution" --eventname "Completion" --unitid $unitid 

# Alexa.Enterprise.Subscription.Activation
asp-cli create-subscription --configurationid $configurationid --eventnamespace "Alexa.Enterprise.Subscription" --eventname "Activation" --parentid $parentid 

# Endpoint.Lifecycle events
asp-cli create-subscription --configurationid $configurationid --eventnamespace "Alexa.Endpoint.Lifecycle" --eventname "SetupCompletion" --unitid $unitid 

# Skill Interaction events
asp-cli "enable-skill-for-unit" --skillid $premiumeventsskillid --unitid $unitid --stage "live" # --partition --linkredirecturi --linkauthcode --nfilocales


# Role.Management Assignment & Revocation events
asp-cli create-subscription --configurationid $configurationid --eventnamespace "Alexa.Role.Management" --eventname "Assignment" --unitid $unitid 
asp-cli create-subscription --configurationid $configurationid --eventnamespace "Alexa.Role.Management" --eventname "Revocation" --unitid $unitid 

# Alexa.Enterprise.Endpoint.Activity events. premium events skill required for units 
asp-cli "enable-skill-for-unit" --skillid $premiumeventsskillid --unitid $unitid --stage "live" # --partition --linkredirecturi --linkauthcode --nfilocales

asp-cli create-subscription --configurationid $configurationid --eventnamespace "Alexa.Enterprise.Endpoint.Activity" --eventname "StateChange" --unitid $unitid 
asp-cli create-subscription --configurationid $configurationid --eventnamespace "Alexa.Enterprise.Endpoint.Activity" --eventname "Voice" --unitid $unitid 

# get a subscription by id
asp-cli get-subscription --subscriptionid $subscriptionid


# 3 different ways to query subscriptions
$eventnamespace = "Alexa.Enterprise.Subscription"
$eventname = "Activation"
asp-cli get-subscriptions --unitid $unitid 
asp-cli get-subscriptions --parentid $parentid 
asp-cli get-subscriptions --eventnamespace $eventnamespace --eventname $eventname 


# delete a sucscription by subscription id
asp-cli delete-subscription --subscriptionid $subscriptionid



