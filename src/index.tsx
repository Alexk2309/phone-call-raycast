import {
  Action,
  ActionPanel,
  List,
  Icon,
} from "@raycast/api";

import { getAvatarIcon, runAppleScript } from '@raycast/utils';
import { useState, useEffect } from "react";
import { fetchAllContacts } from "swift:../swift/contacts";

type Contact = {
  id: string;
  givenName: string;
  familyName: string;
  phoneNumbers: string[];
  emailAddresses: string[];
  photo: string;
};

export default function Command() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);


  useEffect(() => {
    fetchAllContacts().then((fetchedContacts: Contact[]) => {
      setContacts(fetchedContacts);
    });
  }, []);

  function getName(contact: Contact) {
    return `${contact.givenName}${contact.familyName ? ` ${contact.familyName}` : ""}`;
  }

  useEffect(() => {
    setFilteredContacts(
      contacts.filter((contact) =>
        (contact.givenName || contact.familyName) &&
        `${contact.givenName} ${contact.familyName}`
          .toLowerCase()
          .includes(inputValue.toLowerCase())
      )
    );

  }, [inputValue, contacts]);

  function handleAction(item : Contact) {
    const phoneNumber = item.phoneNumbers[0];
    if (phoneNumber) {
      callNumber(phoneNumber);
    }
  }

  function callNumber(number: string) {
    runAppleScript(`
      open location "tel://${number}"
    `);
  }

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
          icon={
           Icon.Phone
          }
          actions={
            <ActionPanel>
              <Action title="" onAction={() => callNumber(inputValue)} />
            </ActionPanel>
          }
        />
      ) : (
        filteredContacts.map((contact) => (
          <List.Item
            key={contact.id}
            title={getName(contact)}
            icon={
              contact.photo
                ? `data:image/png;base64,${contact.photo}`
                : getAvatarIcon(getName(contact))
            }
            actions={
              <ActionPanel>
                <Action title="Select" onAction={() => handleAction(contact)} />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
