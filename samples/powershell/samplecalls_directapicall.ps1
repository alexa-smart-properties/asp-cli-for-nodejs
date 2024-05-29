Write-Host "List of sample calls for for API Output and "
Exit 



# create a campaign query 
$unitid = "<valid unitid>"
$background="https://example.location.com/SkyBackground.png"

$optionlistdata=@"
[
    {
        "src": "https://d23s5n5cwecxv6.cloudfront.net/pva/WineTasting.png",
        "primaryText": "Napa & Sonoma Wine Country Full-Day Tour",
        "secondaryText": "from 160 per adult",
        "actions": [
            {
                "type": "DismissCardAction"
            }
        ]
    },
    {
        "src": "https://d23s5n5cwecxv6.cloudfront.net/pva/HotAirBalloon.png",
        "primaryText": "Nap Valley Aloft",
        "secondaryText": "from 280 per adult",
        "actions": [
            {
                "type": "DismissCardAction"
            }
        ]
    },
    {
        "src": "https://d23s5n5cwecxv6.cloudfront.net/pva/Golfing.png",
        "primaryText": "Chardonnay Golf Club and Vineyards",
        "secondaryText": "pricing varies",
        "actions": [
            {
                "type": "DismissCardAction"
            }
        ]
    }
]
"@
$optionlistdata = ($optionlistdata | ConvertTo-Json).Replace('\n','')  | ConvertFrom-Json
echo $optionlistdata 

$menuNotification = asp-cli send-notification --unitids $unitid --type pva --template optionlist --primarytext "wrapping alert" --secondarytext "secondary text" `
                                              --optionlistdata $optionlistdata --starttime "2024-05-10T00:16:53.818Z" --dismissalminutes 90 --includeapicall --output results[0].apicall

$menuNotification > "menuNotification.json"  

$menuNotification = Get-Content "menuNotification.json" | Out-String | ConvertFrom-Json

$variant = $menuNotification.data.notification.variants[0]

$optionlist = $variant.content.variants[0].values[0].datasources.optionlist
$optionlist[0].src = $background
$optionlist[0].primaryText = "Avocado Toast"
$optionlist[0].secondaryText = "2 dollars"

$optionlist[1].src = $background
$optionlist[1].primaryText = "Fruit Bowl"
$optionlist[1].secondaryText = "3 dollars"

$optionlist[2].src = $background
$optionlist[2].primaryText = "Quiche"
$optionlist[2].secondaryText = "4 dollars"
$variant.content.variants[0].values[0].datasources.optionlist = $optionlist

$activationWindow = $variant.scheduling.activationWindow
$activationWindow.start = (Get-Date).ToUniversalTime().ToString("o")
$activationWindow.end = (Get-Date).AddMinutes(90).ToUniversalTime().ToString("o")

$variant.scheduling.activationWindow = $activationWindow
$menuNotification.data.notification.variants[0] = $variant

$menuNotificationString = $menuNotification | ConvertTo-Json -Depth 20

asp-cli direct-api-call --config $menuNotificationString 