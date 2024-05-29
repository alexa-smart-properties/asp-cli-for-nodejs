# Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
# Licensed under the Amazon Software License  http://aws.amazon.com/asl/


asp-cli list-address-books

asp-cli list-address-books > addressbooks.json

$addressbook_json = Get-Content addressbooks.json | Out-String | ConvertFrom-Json
foreach($addressBook in $addressbook_json.results)
{
    Write-Host ("`n id:`t" + $addressBook.addressBookId + "`n name:`t" + $addressBook.name + "`n")

    asp-cli get-address-book --addressbookid $addressBook.addressBookId
}

$createResponse = asp-cli create-address-book --name "staff address book 2" | Out-String | ConvertFrom-Json
$newAddressBookId = $createResponse.addressBookId
echo $newAddressBookId

asp-cli create-contact --addressbookid $newAddressBookId --name "Lin Thomas" --phone "+11112345602"

# create a contact with multiple phone numbers and capture the contact id
$createResponse = asp-cli create-contact --addressbookid $newAddressBookId --name "Jane Ray" --phone "+11112345602,+11112345602" | Out-String | ConvertFrom-Json
$newContactId = $createResponse.contactId
echo $newContactId

asp-cli get-contact --addressbookid $newAddressBookId --contactid $newContactId

asp-cli update-contact --addressbookid $newAddressBookId --contactid $newContactId  --name "Jane Rayes" --phone "+11112345607" 


$sample_contacts_path = ".\samples\csv\sample_contacts.csv"

Import-Csv -Path $sample_contacts_path

$createResponse = asp-cli create-address-book --name "staff address book 3" | Out-String | ConvertFrom-Json
$newAddressBookId = $createResponse.addressBookId
echo $newAddressBookId

Import-Csv -Path $sample_contacts_path | ForEach-Object {
    If ($_.type -eq "number") {
        asp-cli create-contact --addressbookid $newAddressBookId --name $_.name --phone $_.value
    } 
    If ($_.type -eq "profile") {
        asp-cli create-contact --addressbookid $newAddressBookId --name $_.name --profile $_.value
    } 
}

asp-cli list-contacts --addressbookid $newAddressBookId > "staff address book 3 "contacts.json

asp-cli delete-address-book --addressbookid $newAddressBookId

$unitid="<unitid>"
$profileId="<profileid>"
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

$contactId="<contactid>"

asp-cli create-reciprocal-association       --profileid $newProfileId --contactid $contactId
asp-cli get-reciprocal-association-status   --profileid $newProfileId --contactid $contactId
asp-cli delete-reciprocal-association       --profileid $newProfileId --contactid $contactId
asp-cli set-drop-in-preference  --profileid $newProfileId --targetprofileid $newProfileId --value ENABLED   
asp-cli get-drop-in-preference  --profileId $newProfileId --targetprofileid $newProfileId
asp-cli create-blocking-rule    --profileId $newProfileId --targetprofileid 111 --value ENABLED
asp-cli get-blocking-rule       --profileid  $newProfileId  --value ENABLED