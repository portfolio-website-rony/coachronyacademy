export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_DOC_MIME = ["application/pdf"];
export const ALLOWED_UPLOAD_MIME = [...ALLOWED_IMAGE_MIME, ...ALLOWED_DOC_MIME];

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "pdf"];
const BLOCKED_EXT = [
  "exe", "js", "mjs", "ts", "php", "html", "htm", "svg", "sh", "bat",
  "cmd", "msi", "dll", "bin", "jar", "py", "rb", "zip", "rar", "7z", "tar", "gz",
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

export interface ValidateUploadResult {
  ok: boolean;
  error?: string;
}

export function validateUpload(
  file: File,
  opts: { kind?: "image" | "pdf" | "any" } = {},
): ValidateUploadResult {
  const kind = opts.kind ?? "any";
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() ?? "";

  if (BLOCKED_EXT.includes(ext)) {
    return { ok: false, error: `File type .${ext} is not allowed.` };
  }
  if (!ALLOWED_EXT.includes(ext)) {
    return { ok: false, error: `Only ${ALLOWED_EXT.join(", ")} files are allowed.` };
  }

  const isImage = ALLOWED_IMAGE_MIME.includes(file.type);
  const isPdf = ALLOWED_DOC_MIME.includes(file.type);

  if (kind === "image" && !isImage) {
    return { ok: false, error: "Only image files are allowed." };
  }
  if (kind === "pdf" && !isPdf) {
    return { ok: false, error: "Only PDF files are allowed." };
  }
  if (kind === "any" && !isImage && !isPdf) {
    return { ok: false, error: "Unsupported file type." };
  }

  const maxBytes = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / 1024 / 1024);
    return { ok: false, error: `File is too large. Max ${mb}MB.` };
  }

  return { ok: true };
}
