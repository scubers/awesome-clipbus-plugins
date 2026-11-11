import type { PluginRichTextHtml } from "@clipbus/plugin-sdk";

const allowedTags = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "CODE", "DEL", "DIV", "EM", "H1", "H2", "H3", "H4", "H5", "H6",
  "HR", "I", "INS", "LI", "OL", "P", "PRE", "S", "SPAN", "STRIKE", "STRONG", "SUB", "SUP",
  "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "U", "UL",
]);
const dropWithContents = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "TEMPLATE", "NOSCRIPT"]);
const allowedStyles = new Set([
  "background-color", "color", "font-family", "font-size", "font-style", "font-weight",
  "text-align", "text-decoration", "text-decoration-line", "vertical-align", "white-space",
]);

export function htmlFragment(html: PluginRichTextHtml): string {
  if (!html.fragment) return html.document;
  const bytes = new TextEncoder().encode(html.document);
  return new TextDecoder().decode(bytes.slice(html.fragment.startUtf8, html.fragment.endUtf8));
}

function safeHref(value: string): string | null {
  return /^(https?:\/\/|mailto:)/i.test(value.trim()) ? value.trim() : null;
}

function copySafeStyles(source: HTMLElement, target: HTMLElement): void {
  for (const property of allowedStyles) {
    const value = source.style.getPropertyValue(property);
    // No URLs, CSS imports or script-like values are needed for text formatting.
    if (value && !/url\s*\(|expression\s*\(|@import|behavior\s*:|[<>]/i.test(value)) {
      target.style.setProperty(property, value);
    }
  }
}

/** Build fresh DOM nodes instead of trusting clipboard HTML with innerHTML. */
export function sanitizedFragment(html: string, targetDocument: Document): DocumentFragment {
  const sourceDocument = new DOMParser().parseFromString(html, "text/html");
  const result = targetDocument.createDocumentFragment();

  function appendSanitized(source: Node, parent: Node): void {
    for (const child of source.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        parent.appendChild(targetDocument.createTextNode(child.nodeValue ?? ""));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        if (dropWithContents.has(element.tagName)) continue;
        if (!allowedTags.has(element.tagName)) {
          appendSanitized(element, parent);
          continue;
        }
        const clean = targetDocument.createElement(element.tagName);
        if (element.tagName === "A") {
          const href = safeHref(element.getAttribute("href") ?? "");
          if (href) clean.setAttribute("href", href);
        }
        copySafeStyles(element, clean);
        appendSanitized(element, clean);
        parent.appendChild(clean);
      }
    }
  }

  appendSanitized(sourceDocument.body, result);
  return result;
}
