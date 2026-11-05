import React from 'react';
import DOMPurify from 'dompurify';

interface SanitizedTextProps {
  children: React.ReactNode;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

export const SanitizedText: React.FC<SanitizedTextProps> = ({
  children,
  allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  allowedAttributes = [],
}) => {
  const sanitized = DOMPurify.sanitize(String(children), {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

interface SanitizedHtmlProps {
  html: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

export const SanitizedHtml: React.FC<SanitizedHtmlProps> = ({
  html,
  allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span', 'div'],
  allowedAttributes = ['href', 'target', 'rel', 'class', 'style'],
}) => {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};