import React, { useState} from "react";
import { Action, ActionPanel, List, Icon  } from "@raycast/api";
import { getAvatarIcon, runAppleScript } from '@raycast/utils';
import Contacts from "./contacts";
import { Contact } from "./interfaces"
import { useContactLoadingToast, useContacts } from "./helper";

export default function Command() {
  const { contacts, isLoading } = useContacts();
  const [inputValue, setInputValue] = useState<string>("");
  useContactLoadingToast(isLoading);

  function handleAction(contact: Contact) {
    const phoneNumber = contact.phoneNumbers[0];
    if (phoneNumber) {
      callNumber(phoneNumber);
    }
  }

  function callNumber(number: string) {
    runAppleScript(`
      open location "tel://${number}"
    `);
  }

  const filteredContacts = contacts?.filter((contact) =>
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
      {inputValue && filteredContacts?.length === 0 ? (
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
          contacts={contacts ?? []}
          inputValue={inputValue}
          handleAction={handleAction}
          getAvatarIcon={getAvatarIcon}
        />
      )}
    </List>
  );
}