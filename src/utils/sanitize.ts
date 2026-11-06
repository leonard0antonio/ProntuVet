import DOMPurify from "dompurify";

const defaultAllowedTags = ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"];
const defaultAllowedAttributes: string[] = [];

export const sanitizeHtml = (
  html: string,
  allowedTags: string[] = defaultAllowedTags,
  allowedAttributes: string[] = defaultAllowedAttributes
): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
  });
};

export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

export const sanitizeForAttribute = (value: string): string => {
  return value
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/\//g, "&#x2F;");
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
};
