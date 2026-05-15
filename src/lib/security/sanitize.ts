import DOMPurify from "isomorphic-dompurify";

// Strip all HTML — use for plain text fields rendered as text
export function stripHtml(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// Allow a small safe HTML subset (rich text)
const RICH_ALLOW_TAGS = [
  "b", "i", "em", "strong", "u", "br", "p",
  "ul", "ol", "li", "a", "blockquote", "code", "pre", "h3", "h4",
];
const RICH_ALLOW_ATTR = ["href", "target", "rel"];

export function sanitizeRichHtml(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: RICH_ALLOW_TAGS,
    ALLOWED_ATTR: RICH_ALLOW_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "style"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "srcdoc"],
  });
}

// Normalize whitespace and remove control chars
export function normalizeText(input: string): string {
  if (!input) return "";
  return input.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim();
}
