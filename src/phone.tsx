import React, { useState, useEffect } from "react";
import { Action, ActionPanel, List, Icon, getPreferenceValues  } from "@raycast/api";
import { getAvatarIcon, runAppleScript } from '@raycast/utils';
import { fetchAllContacts } from "swift:../swift/contacts";
import Contacts from "./contacts";
import { Contact } from "./interfaces";

const preferences = getPreferenceValues<Preferences>();

export default function Command() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    fetchAllContacts().then((fetchedContacts: Contact[]) => {
      if (preferences.remove_duplicate_contacts) {
        const uniqueContacts = removeDuplicates(fetchedContacts);
        setContacts(uniqueContacts);
      } else {
        setContacts(fetchedContacts);
      }
    });
  }, []);

  function handleAction(contact: Contact) {
    const phoneNumber = contact.phoneNumbers[0];
    if (phoneNumber) {
      callNumber(phoneNumber);
    }
  }

  function removeDuplicates(contacts: Contact[]): Contact[] {
    const seen = new Set();
    return contacts.filter((contact) => {
      const identifier = `${contact.givenName} ${contact.familyName} ${contact.phoneNumbers.join(",")}`;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  }


  function callNumber(number: string) {
    runAppleScript(`
      open location "tel://${number}"
    `);
  }

  const filteredContacts = contacts.filter((contact) =>
    (contact.givenName || contact.familyName) &&
    `${contact.givenName} ${contact.familyName}`
      .toLowerCase()
      .includes(inputValue.toLowerCase())
  );

  return (
    <List
      filtering={false}
      onSearchTextChange={setInputValue}
      navigationTitle="Call Contact"
      searchBarPlaceholder="Give someone a call"
    >
      {inputValue && filteredContacts.length === 0 ? (
        <List.Item
          key="call-button"
          title={`${inputValue}`}
          icon={Icon.Phone}
          actions={
            <ActionPanel>
              <Action title="Call" onAction={() => callNumber(inputValue)} />
            </ActionPanel>
          }
        />
      ) : (
        <Contacts
          contacts={contacts}
          inputValue={inputValue}
          handleAction={handleAction}
          getAvatarIcon={getAvatarIcon}
        />
      )}
    </List>
  );
}