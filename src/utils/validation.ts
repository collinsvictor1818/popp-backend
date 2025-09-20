// src/utils/validation.ts

import { z } from 'zod';

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
