import React, { useState, useEffect } from "react";
import { List, getPreferenceValues  } from "@raycast/api";
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
      setContacts(fetchedContacts);
    });
  }, []);

  function handleAction(contact: Contact) {
    const phoneNumber = contact.phoneNumbers[0];
    if (phoneNumber) {
      callNumber(phoneNumber);
    }
  }

  function callNumber(number: string) {
    const removeConfirmation =
    `-- Get the localized name of the button "Call"
      tell application "FaceTime" to set Call_loc to localized string "Call"
      tell window 1
        click button Call_loc
      end tell`;
    const appleScript = `
      do shell script "open facetime://" & quoted form of "${number}"
      tell application "System Events" to tell process "FaceTime"
        set frontmost to true
        repeat until exists window 1
          delay 0.1
        end repeat
        ${preferences.no_confirmation ? removeConfirmation : ''}
      end tell
    `;
    runAppleScript(appleScript);
  }

  return (
    <List
      filtering={false}
      onSearchTextChange={setInputValue}
      navigationTitle="Call Contact"
      searchBarPlaceholder="Give someone a call"
    >
      <Contacts
        contacts={contacts}
        inputValue={inputValue}
        handleAction={handleAction}
        getAvatarIcon={getAvatarIcon}
      />
    </List>
  );
}