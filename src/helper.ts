import { useCachedPromise } from '@raycast/utils';
import { fetchAllContacts } from "swift:../swift/contacts";
import { Contact } from "./interfaces";
import { useEffect } from "react";
import { showToast, Toast } from "@raycast/api"; // Ensure this import is correct

export function useContacts() {
  const { data: contacts, isLoading } = useCachedPromise(
    async () => {
      const contacts = await fetchAllContacts();
      return contacts as Contact[];
    },
    [],
    {
      failureToastOptions: {
        title: "Could not get contacts",
        message: "Make sure you have granted Raycast access to your contacts.",
        primaryAction: {
          title: "Open System Preferences",
          onAction() {
            open("x-apple.systempreferences:com.apple.preference.security?Privacy_Contacts");
          },
        },
      },
    }
  );

  return { contacts, isLoading };
}

export function useContactLoadingToast(isLoading: boolean) {
  useEffect(() => {
    if (isLoading) {
      showToast(Toast.Style.Animated, "Loading contacts...");
    } else {
      showToast(Toast.Style.Success, "Contacts loaded");
    }
  }, [isLoading]);
}