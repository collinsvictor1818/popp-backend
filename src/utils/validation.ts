// src/utils/validation.ts

/**
 * Validates a phone number based on a basic international format.
 * Assumes format: +<country_code><number> (e.g., +1234567890)
 *
 * @param phoneNumber The phone number string to validate.
 * @returns True if the phone number is valid, false otherwise.
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  // Regex for a basic international phone number format:
  // Starts with '+'
  // Followed by 1 to 3 digits for country code
  // Followed by 7 to 15 digits for the number itself
  // No spaces or other special characters allowed in the number part
  const phoneRegex = /^\+[1-9]{1}[0-9]{1,2}[0-9]{7,15}$/;

  // TODO: Consider more robust international phone number validation (e.g., using a library like 'libphonenumber-js')
  // TODO: Add specific country code validation if required (e.g., only +254 for Kenya)
  // TODO: Define exact length requirements based on business rules for specific countries

  return phoneRegex.test(phoneNumber);
}