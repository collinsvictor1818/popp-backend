// src/utils/validation.ts

import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber as libPhoneIsValid, CountryCode } from 'libphonenumber-js';

/**
 * Validates a phone number using libphonenumber-js for robust international validation.
 * Supports specific country validation and business rules.
 *
 * @param phoneNumber The phone number string to validate.
 * @param allowedCountries Optional array of allowed country codes (e.g., ['KE', 'US'])
 * @returns True if the phone number is valid, false otherwise.
 */
export function isValidPhoneNumber(phoneNumber: string, allowedCountries?: CountryCode[]): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  try {
    // Parse the phone number using libphonenumber-js
    const parsedNumber = parsePhoneNumber(phoneNumber);
    
    // Check if the number is valid
    if (!libPhoneIsValid(parsedNumber.number)) {
      return false;
    }

    // If specific countries are allowed, validate against them
    if (allowedCountries && allowedCountries.length > 0) {
      const countryCode = parsedNumber.country;
      if (!countryCode || !allowedCountries.includes(countryCode)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    // If parsing fails, the number is invalid
    return false;
  }
}

/**
 * Validates a phone number specifically for Kenya (+254).
 * This is a convenience function for business rules that require Kenyan numbers only.
 *
 * @param phoneNumber The phone number string to validate.
 * @returns True if the phone number is a valid Kenyan number, false otherwise.
 */
export function isValidKenyanPhoneNumber(phoneNumber: string): boolean {
  return isValidPhoneNumber(phoneNumber, ['KE']);
}

// Schema for the nested Candidate object within the webhook payload
export const CandidateSchema = z.object({
  phone_number: z.string().min(7).max(18), // Basic length validation
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email_address: z.string().email(),
});

// Schema for the main ApplicationEvent webhook payload
export const ApplicationEventSchema = z.object({
  id: z.string().min(1), // Application ID
  job_id: z.string().min(1), // Associated Job ID
  candidate_id: z.string().min(1), // Candidate ID
  candidate: CandidateSchema, // Nested candidate object
});
