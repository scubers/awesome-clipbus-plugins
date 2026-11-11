import type { PluginRichTextHtml } from "@clipbus/plugin-sdk";

const allowedTags = new Set([
  "A", "ABBR", "B", "BDI", "BDO", "BIG", "BLOCKQUOTE", "BR", "CAPTION", "CENTER", "CITE", "CODE",
  "DD", "DEL", "DFN", "DIV", "DL", "DT", "EM", "FIGCAPTION", "FIGURE", "FONT", "H1", "H2", "H3",
  "H4", "H5", "H6", "HR", "I", "INS", "LI", "MARK", "OL", "P", "PRE", "Q", "S", "SMALL",
  "SPAN", "STRIKE", "STRONG", "SUB", "SUP", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD",
  "TIME", "TR", "U", "UL", "WBR",
]);
const dropWithContents = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "TEMPLATE", "NOSCRIPT"]);
const allowedStyles = new Set([
  "background-color", "color", "font-family", "font-size", "font-style", "font-weight",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border", "border-top", "border-right", "border-bottom", "border-left",
  "border-color", "border-style", "border-width", "border-collapse", "border-spacing",
  "line-height", "letter-spacing", "list-style-type", "list-style-position", "table-layout",
  "text-align", "text-decoration", "text-decoration-line", "text-indent", "text-transform",
  "vertical-align", "white-space", "word-break", "overflow-wrap",
]);
const lengthAttribute = /^\d{1,4}(?:\.\d+)?%?$/;
const integerAttribute = /^-?\d{1,4}$/;
const plainAttribute = /^[^\x00-\x1F]{1,200}$/;
const safeAttributes: Record<string, Record<string, RegExp>> = {
  "*": { dir: /^(ltr|rtl|auto)$/i, lang: /^[a-z0-9-]{1,35}$/i },
  FONT: { color: plainAttribute, face: plainAttribute, size: /^[1-7]$/ },
  LI: { value: integerAttribute },
  OL: { start: integerAttribute, reversed: /^$/, type: /^[1AaIi]$/ },
  UL: { type: /^(disc|circle|square)$/i },
  TABLE: { border: /^\d{1,2}$/, cellpadding: lengthAttribute, cellspacing: lengthAttribute, width: lengthAttribute },
  TD: { colspan: integerAttribute, rowspan: integerAttribute, width: lengthAttribute, align: /^(left|center|right|justify)$/i, valign: /^(top|middle|bottom|baseline)$/i },
  TH: { colspan: integerAttribute, rowspan: integerAttribute, width: lengthAttribute, align: /^(left|center|right|justify)$/i, valign: /^(top|middle|bottom|baseline)$/i },
  TR: { align: /^(left|center|right|justify)$/i, valign: /^(top|middle|bottom|baseline)$/i },
};
for (const tag of ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"]) {
  safeAttributes[tag] = { align: /^(left|center|right|justify)$/i };
}

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

function copySafeAttributes(source: HTMLElement, target: HTMLElement): void {
  for (const attributes of [safeAttributes["*"], safeAttributes[target.tagName]]) {
    for (const [name, pattern] of Object.entries(attributes ?? {})) {
      const value = source.getAttribute(name);
      if (value !== null && pattern.test(value)) target.setAttribute(name, value);
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
        copySafeAttributes(element, clean);
        appendSanitized(element, clean);
        parent.appendChild(clean);
      }
    }
  }

  appendSanitized(sourceDocument.body, result);
  return result;
}
