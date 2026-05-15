import { z } from "zod";

// Block obviously malicious / injection-y characters in identity-style fields
const UNSAFE_CHARS = /[<>{}\\;`$]/;

// Detect script/SQL injection payloads in any free text
const MALICIOUS_PATTERNS: RegExp[] = [
  /<\s*script/i,
  /<\s*iframe/i,
  /<\s*object/i,
  /<\s*embed/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /on\w+\s*=/i, // onerror=, onload=, onclick=
  /\beval\s*\(/i,
  /\bFunction\s*\(/,
  /document\.cookie/i,
  /document\.write/i,
  /window\.location/i,
  /\bsrcdoc\s*=/i,
  /\bDROP\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bUPDATE\s+\w+\s+SET\b/i,
  /\bSELECT\s+.*\bFROM\b/i,
  /\bUNION\s+SELECT\b/i,
  /--\s*$/m, // SQL line comment
];

export function isMalicious(input: string): boolean {
  if (!input) return false;
  return MALICIOUS_PATTERNS.some((re) => re.test(input));
}

export function assertSafe(input: string): string {
  if (isMalicious(input)) {
    throw new Error("Invalid or unsafe input detected.");
  }
  return input;
}

const safeTextRefiner = (val: string) => !isMalicious(val);
const SAFE_MSG = "Invalid or unsafe input detected.";

// Names: letters (incl. Bangla/Unicode), spaces, common punctuation
export const safeName = z
  .string()
  .trim()
  .min(1, "Required")
  .max(100, "Too long")
  .refine((v) => !UNSAFE_CHARS.test(v), SAFE_MSG)
  .refine(safeTextRefiner, SAFE_MSG);

export const safePhone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]{6,20}$/, "Invalid phone number");

export const safeOptionalPhone = z
  .string()
  .trim()
  .max(20)
  .regex(/^(\+?[0-9\s\-()]{6,20})?$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

export const safeEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email")
  .max(255);

export const safeOptionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email")
  .optional()
  .or(z.literal(""));

// Plain text (messages, notes, comments, post body)
export const safeText = (max = 5000) =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .max(max, `Max ${max} characters`)
    .refine(safeTextRefiner, SAFE_MSG);

export const safeOptionalText = (max = 5000) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(safeTextRefiner, SAFE_MSG)
    .optional()
    .or(z.literal(""));

export const safeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Invalid or unsafe URL")
  .optional()
  .or(z.literal(""));

export const safePassword = z
  .string()
  .min(8, "At least 8 characters")
  .max(128)
  .refine((v) => /[A-Z]/.test(v), "Must include an uppercase letter")
  .refine((v) => /[a-z]/.test(v), "Must include a lowercase letter")
  .refine((v) => /[0-9]/.test(v), "Must include a number");

export const safeSlug = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and dashes");

export const safeUuid = z.string().uuid();
