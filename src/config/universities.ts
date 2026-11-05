// University email-domain allow-list used by registration validation.
// Only addresses ending in one of a university's allowed domains can register.
// TODO: verify real domain — every entry below is a placeholder until the real
// institutional domains are confirmed with each university. Replace the
// placeholder domains (and extend the list) as they are verified.
export interface University {
  name: string;
  emailDomains: string[];
}

export const UNIVERSITIES: University[] = [
  { name: "IUBAT — International University of Business Agriculture and Technology", emailDomains: ["iubat.edu"] }, // TODO: verify real domain — placeholder
  { name: "BUET", emailDomains: ["buet.ac.bd"] }, // TODO: verify real domain — placeholder
  { name: "University of Dhaka", emailDomains: ["du.ac.bd"] }, // TODO: verify real domain — placeholder
  { name: "BRAC University", emailDomains: ["bracu.ac.bd"] }, // TODO: verify real domain — placeholder
  { name: "North South University", emailDomains: ["northsouth.edu"] }, // TODO: verify real domain — placeholder
];

export function findUniversity(name: string): University | undefined {
  return UNIVERSITIES.find((u) => u.name === name);
}
