// Copyright 2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

"use strict";

import {getAPIResponse, getAPICombinedResults} from './asp-api-helpers.js';

/// Communication profiles /////////////////////////////////////////////////

export async function createCommunicationsProfile(entityId, profileName, type = 'UNIT') {
  const config = {
    method: 'post',
    url: '/v1/communications/profile',
    data: {
      entity: {
        type: type,
        id: `${entityId}`
      },
      name: profileName
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function createBulkCommunicationsProfiles(profiles) {
  const items = profiles.map((profile, index) => ({
    itemId: `uniqueRequestItemId${index + 1}`,
    entity: {
      type: 'UNIT',
      id: `amzn1.alexa.unit.did.${profile.unitId}`
    },
    name: profile.profileName
  }));

  const config = {
    method: 'post',
    url: '/v1/communications/profiles/batch',
    data: {
      items
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function updateCommunicationsProfile(profileId, profileName) {
  const config = {
    method: 'put',
    url: `/v1/communications/profile/${profileId}`,
    data: {
      name: profileName
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function getCommunicationProfile(profileId, entityId, entityType="UNIT") {
  const config = {
    method: 'get',
    url: `/v1/communications/profile/${profileId}`
  };

  if (entityId) { 
    config.url = `/v1/communications/profile?entity.type=${entityType}&entity.id=${entityId}`;
  }

  const data = await getAPIResponse(config);
  return data;
}
export async function deleteCommunicationProfile(profileId) {
  const config = {
    method: 'delete',
    url: `/v1/communications/profile/${profileId}`
  };

  const data = await getAPIResponse(config);
  return data;
}


/// Address Books /////////////////////////////////////////////////

export async function createAddressBook(addressBookName) {
  const config = {
    method: 'post',
    url: '/v1/addressBooks',
    data: {
      name: addressBookName
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function listAddressBooks() {
  const config = {
    method: 'get',
    url: `/v1/addressBooks?maxResults=100`
  };

  const data = await getAPICombinedResults(config);
  return data;
}

export async function getAddressBook(addressBookId) {
  const config = {
    method: 'get',
    url: `/v1/addressBooks/${addressBookId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function updateAddressBook(addressBookId,addressBookName) {
  const config = {
    method: 'put',
    url: `/v1/addressBooks/${addressBookId}`,
    data: {
      name: addressBookName
    }
  };

  const data = await getAPIResponse(config);
  return data;
}


export async function deleteAddressBook(addressBookId) {
  const config = {
    method: 'delete',
    url: `/v1/addressBooks/${addressBookId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

/// Manage contacts /////////////////////////////////////////////////

export async function createContact(addressBookId, contactName, phoneNumbers, communicationProfile, providerContact) {
  
  let numbers = null;

  if (phoneNumbers) {
    numbers = phoneNumbers.split(',').map(number => new Object({
      "number": number
    }));
  } 

  if (providerContact) {
    providerContact = {
        "id": providerContact
    };
  }

  const config = {
    method: 'post',
    url: `/v1/addressBooks/${addressBookId}/contacts`,
    data: {
      contact: {
        name: contactName,
        phoneNumbers: numbers,
        alexaCommunicationProfileId: communicationProfile,
        providerContact: providerContact
      }
    }
  };
  console.log(config.data.contact);

  const data = await getAPIResponse(config);
  return data;
}

export async function createBulkContacts(addressBookId, contacts) {
  const items = contacts.map((contact, index) => ({
    itemId: `uniqueRequestItemId${index + 1}`,
    contact: {
      name: contact.contactName,
      phoneNumbers: contact.phoneNumbers,
      alexaCommunicationProfileId: contact.communicationProfile,
      providerContact: contact.providerContact
    }
  }));

  const config = {
    method: 'post',
    url: `/v1/addressBooks/${addressBookId}/contacts/batch`,
    data: {
      items
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function listContacts(addressBookId) {

  const config = {
    method: 'get',
    url: `/v1/addressBooks/${addressBookId}/contacts?maxResults=100`
  };

  const data = await getAPICombinedResults(config);
  return data;
}

export async function getContact(addressBookId, contactId) {
  const config = {
    method: 'get',
    url: `/v1/addressBooks/${addressBookId}/contacts/${contactId}`
  };
 
  const data = await getAPIResponse(config);
  return data;
}


export async function updateContact(addressBookId, contactId, contactName, phoneNumbers, communicationProfile, providerContact) {
  
  let numbers = null;

  if (phoneNumbers) {
    numbers = phoneNumbers.split(',').map(number => new Object({
      "number": number
    }));
  } 

  if (providerContact) {
    providerContact = {
        "id": providerContact
    };
  }

  const config = {
    method: 'put',
    url: `/v1/addressBooks/${addressBookId}/contacts/${contactId}`,
    data: {
      contact: {
        name: contactName,
        phoneNumbers: numbers,
        alexaCommunicationProfileId: communicationProfile,
        providerContact: providerContact

      }
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function deleteContact(addressBookId, contactId) {
  const config = {
    method: 'delete',
    url: `/v1/addressBooks/${addressBookId}/contacts/${contactId}`
  };

  const data = await getAPIResponse(config);
  return data;
}


//////  Manage address book associations /////////////////////////////////////

export async function createAddressBookAssociation(addressBookId, unitId) {
  const config = {
    method: 'post',
    url: `/v1/addressBooks/${addressBookId}/unitAssociations`,
    data: {
      unitId: `${unitId}`
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function createBulkAddressBookAssociations(addressBookId, unitIds) {
  const items = unitIds.map((unitId, index) => ({
    itemId: `${index + 1}`,
    unitId: `${unitId}`
  }));

  const config = {
    method: 'post',
    url: `/v1/addressBooks/${addressBookId}/unitAssociations/batch`,
    data: {
      items
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function listAddressBookAssociations(unitId) {
  const config = {
    method: 'get',
    url: `/v1/addressBooks/unitAssociations?unitId=${unitId}&maxResults=100`//&nextToken=${nextToken}`
  };

  const data = await getAPICombinedResults(config);
  return data;
}

export async function getAddressBookAssociation(addressBookId, unitId) {
  const config = {
    method: 'get',
    url: `/v1/addressBooks/${addressBookId}/unitAssociations?unitId=${unitId}&maxResults=100`//&nextToken=${nextToken}`
  };

  const data = await getAPICombinedResults(config);
  return data;
}

export async function deleteAddressBookAssociation(addressBookId, unitId) {
  const config = {
    method: 'delete',
    url: `/v1/addressBooks/${addressBookId}/unitAssociations?unitId=${unitId}`
  };

  const data = await getAPIResponse(config);
  return data;
}


///////  Manage reciprocal associations for Inbound Calling  //////////////////////


export async function createReciprocalAssociation(profileId, contactId) {
  const config = {
    method: 'post',
    url: `/v1/communications/profile/${profileId}/reciprocalAssociations`,
    data: {
      contact: {
        id: `${contactId}`
      }
    }
  };

  const data = await getAPIResponse(config);
  return data;
}


export async function getReciprocalAssociationStatus(profileId, contactId) {
  const config = {
    method: 'get',
    url: `/v1/communications/profile/${profileId}/reciprocalAssociations?contactId=${contactId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function deleteReciprocalAssociation(profileId, contactId) {
  const config = {
    method: 'delete',
    url: `/v1/communications/profile/${profileId}/reciprocalAssociations?contactId=${contactId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

////// drop in preferences /////////////////////////////////////////////////

export async function setDropInPreference(sourceProfileId, targetProfileId, setting) {
  
  const config = {
    method: 'put',
    url: `/v1/communications/profile/${sourceProfileId}/contacts/settings/DropIn?alexaCommunicationProfileId=${targetProfileId}`,
    data: {
      value: setting
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function getDropInPreference(sourceProfileId, targetProfileId) {
  const config = {
    method: 'get',
    url: `/v1/communications/profile/${sourceProfileId}/contacts/settings/DropIn?alexaCommunicationProfileId=${targetProfileId}`
  };

  const data = await getAPIResponse(config);
  return data;
}

////// block rules /////////////////////////////////////////////////

export async function createBlockingRule(sourceProfileId, targetProfileId, setting) {

  const config = {
    method: 'put',
    url: `/v1/communications/profile/${sourceProfileId}/contacts/settings/Block?alexaCommunicationProfileId=${targetProfileId}`,
    data: {
      value: setting
    }
  };

  const data = await getAPIResponse(config);
  return data;
}

export async function getBlockingRule(profileId, value = 'ENABLED') {
  const config = {
    method: 'get',
    url: `/v1/communications/profile/${profileId}/contacts/settings/Block?value=${value}`
  };

  const data = await getAPICombinedResults(config);
  return data;
}

