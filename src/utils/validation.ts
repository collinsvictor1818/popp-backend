export function isValidPhoneNumber(phone: string): boolean {
  // E.164-ish: + followed by 10-15 digits
  return /^\+\d{10,15}$/.test(phone);
}
