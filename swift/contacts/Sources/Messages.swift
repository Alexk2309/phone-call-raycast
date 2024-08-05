import Contacts
import RaycastSwiftMacros

struct ContactItem: Codable {
  let id: String
  let givenName: String
  let familyName: String
  let phoneNumbers: [String]
  let emailAddresses: [String]
  let photo: Data?
}

enum MessagesError: Error {
  case accessDenied
  case noContacts
}

@raycast func fetchAllContacts() async throws -> [ContactItem] {
  let store = CNContactStore()

  do {
    let authorized = try await store.requestAccess(for: .contacts)
    guard authorized else {
      throw MessagesError.accessDenied
    }
  } catch {
    throw MessagesError.accessDenied
  }

  let keys = [
    CNContactGivenNameKey,
    CNContactFamilyNameKey,
    CNContactPhoneNumbersKey,
    CNContactEmailAddressesKey,
    CNContactIdentifierKey,
    CNContactThumbnailImageDataKey
  ] as [CNKeyDescriptor]

  let request = CNContactFetchRequest(keysToFetch: keys)
  var contactsDict: [String: ContactItem] = [:]

  do {
    try store.enumerateContacts(with: request) { contact, _ in
      let phoneNumbers = contact.phoneNumbers.map { $0.value.stringValue }
      let emailAddresses = contact.emailAddresses.map { $0.value as String }

      let contactKey = contact.identifier

      if contactsDict[contactKey] == nil {
        contactsDict[contactKey] = ContactItem(
          id: contact.identifier,
          givenName: contact.givenName,
          familyName: contact.familyName,
          phoneNumbers: phoneNumbers,
          emailAddresses: emailAddresses,
          photo: contact.thumbnailImageData
        )
      }
    }
  } catch {
    throw MessagesError.noContacts
  }

  let contacts = Array(contactsDict.values)
  return contacts.sorted { $0.givenName < $1.givenName }
}