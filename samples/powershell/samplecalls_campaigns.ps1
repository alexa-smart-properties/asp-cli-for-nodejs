# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/

Write-Host "List of sample calls for the Campaigns"
Exit 

$actionuri="connection://AMAZON.ColdLaunch/1?provider=amzn1.ask.skill.2f3c39f9-740b-4204-b4af-ba9e70ca0cd8"
$thumbnailimage="https://d23s5n5cwecxv6.cloudfront.net/pva/MainMenuBackground.png"

# textwrapping
asp-cli create-campaign --type "textwrapping" --unitids $unitid --headertext "My Header" --primarytext "My Primary" --backgroundimage "https://www.example.com/image.jpg" --attributiontext "attribution text"
asp-cli create-campaign --type "textwrapping" --unitids $unitid --headertext "My Header" --primarytext "My Primary" --backgroundimage "https://www.example.com/image.jpg" --attributionimage "https://www.example.com/image.jpg"

# create media campaign
asp-cli create-campaign --type "media" --unitids $unitid --primarytext "Primary Text"

# create media campaign and capture campaignId
$campaignId = asp-cli create-campaign --type "media" --unitids $unitid --primarytext "Primary Text" --output campaignId
echo $campaignId

# get the new campaign by campaignid
asp-cli get-campaign --campaignid $campaignId

# delete the campaign by campaign
asp-cli delete-campaign --campaignid $campaignId

# get all campaigns
asp-cli get-campaigns 

# get campaignIds of all campaigns via --output
$campaignIds = asp-cli get-campaigns --output results[].campaignId
echo $campaignIds

# media with all values and two units and 70 minutes dismissal --attributiontext "Attribution Text"
asp-cli create-campaign --type "media" --unitids "$unitid,$unitid" --headertext "Header Text" `
                                       --primarytext "Primary Text" --secondarytext "Secondary Text" --tertiarytext "Ternary Text" --hinttext "Hint Text" `
                                       --thumbnailimage $thumbnailimage --backgroundimage $thumbnailimage --attributionimage $thumbnailimage --dismissalminutes 70


# rating
asp-cli create-campaign --type "rating" --unitids $unitid --primarytext "Primary Text"
# rating with ratings
asp-cli create-campaign --type "rating" --unitids $unitid --primarytext "Primary Text" --headertext "Heading Text" --ratingnumber 5 --ratingtext "rating" --hinttext "Hint" --backgroundimage $thumbnailimage

# foryourday with 3 buttons
asp-cli create-campaign --type "foryourday" --unitids $unitid --primarytext "Primary Text" --headertext "Heading Text" `
                                            --ratingnumber 5 --ratingtext "rating" --hinttext "Hint" `
                                            --listhinttexts "Hint,Hint,Hint" --listthumbnailimages "$thumbnailimage,$thumbnailimage,$thumbnailimage" `
                                            --actionuri $actionuri

asp-cli create-campaign --type "onthisday" --unitids $unitid --primarytext "Primary Text" --headertext "Heading Text" --ratingnumber 5 --ratingtext "rating" --hinttext "Hint" --actionuri $actionuri


# photocard
asp-cli create-campaign --type "photocard" --unitids $unitid `
                                           --primarytext "Primary Text" --secondarytext "Second Text" --headertext "Heading Text" `
                                           --ratingnumber 5 --ratingtext "rating" --hinttext "Hint" `
                                           --actionuri $actionuri

asp-cli create-campaign --type "photocard" --unitids $unitid --primarytext "Primary Text" --secondarytext "Second" --headertext "Heading Text" --hinttext "Hint" `
                                           --actionuri $actionuri --actioninput "some input" --backgroundimage $thumbnailimage

# create a campaign query 
$unitid = "<valid unitid>"
$query = @"
{
    "and" : [{
            "match": {
                "targeting.values.id": "$unitid"
            }
        },
        {
            "match": {
                "targeting.type": "UNITS"
            }
        }
    ]
}
"@
$query = ($query | ConvertTo-Json).Replace('\n','')
#echo $query

# run the query to see campains using this unitid
asp-cli query-campaigns --query $query