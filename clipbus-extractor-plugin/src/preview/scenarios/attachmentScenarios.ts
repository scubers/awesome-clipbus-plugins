// Attachment preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per attachment renderer feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

const PLUGIN_ID = "plugin.extractor";
const ITEM_TAGS = ["extractor"];
const SOURCE_APP = "com.preview.editor";

const entitiesPayload = JSON.stringify({
  kind: "entities_preview",
  version: 1,
  urls: ["https://example.com", "https://foo.org"],
  emails: ["john@example.com"],
  ips: ["192.168.1.1"],
  totalCount: 4,
});

const urlParsedPayload = JSON.stringify({
  kind: "url_parsed",
  version: 1,
  inputType: "url",
  input:
    "https://example.com/article?utm_source=newsletter&utm_medium=email&fbclid=AbC123&id=42",
  href: "https://example.com/article?utm_source=newsletter&utm_medium=email&fbclid=AbC123&id=42",
  scheme: "https",
  username: "",
  host: "example.com",
  port: "",
  path: "/article",
  query: [
    { key: "utm_source", value: "newsletter" },
    { key: "utm_medium", value: "email" },
    { key: "fbclid", value: "AbC123" },
    { key: "id", value: "42" },
  ],
  queryJson: JSON.stringify({
    utm_source: "newsletter",
    utm_medium: "email",
    fbclid: "AbC123",
    id: "42",
  }, null, 2),
  hasDuplicateKeys: false,
  hash: "",
  cleanHref: "https://example.com/article?id=42",
  trackingParams: [
    { key: "utm_source", value: "newsletter" },
    { key: "utm_medium", value: "email" },
    { key: "fbclid", value: "AbC123" },
  ],
  display: {
    typeLabel: "URL",
    headline: "example.com",
    facts: [
      { label: "Scheme", value: "https" },
      { label: "Host", value: "example.com" },
      { label: "Path", value: "/article" },
    ],
  },
});

const queryStringPayload = JSON.stringify({
  kind: "url_parsed",
  version: 1,
  inputType: "query",
  input: "tag=one&tag=two&lang=zh-CN",
  href: "",
  scheme: "",
  username: "",
  host: "",
  port: "",
  path: "",
  query: [
    { key: "tag", value: "one" },
    { key: "tag", value: "two" },
    { key: "lang", value: "zh-CN" },
  ],
  queryJson: JSON.stringify({ tag: "two", lang: "zh-CN" }, null, 2),
  hasDuplicateKeys: true,
  hash: "",
  cleanHref: "",
  trackingParams: [],
  display: {
    typeLabel: "Query String",
    headline: "3 parameters",
    facts: [
      { label: "Pairs", value: "3" },
      { label: "Duplicate keys", value: "Yes" },
    ],
  },
});

const ipDetailsPayloadV4 = JSON.stringify({
  kind: "ip_details",
  version: 1,
  input: "192.168.1.10",
  inputType: "ipv4",
  ipVersion: 4,
  integer: 3232235786,
  hex: "0xC0A8010A",
  binary: "11000000.10101000.00000001.00001010",
  reverseDns: "10.1.168.192.in-addr.arpa",
  scope: "Private",
  legacyClass: "C",
});

const ipDetailsPayloadV4Cidr = JSON.stringify({
  kind: "ip_details",
  version: 1,
  input: "192.168.1.0/24",
  inputType: "ipv4cidr",
  ipVersion: 4,
  prefix: 24,
  netmask: "255.255.255.0",
  wildcardMask: "0.0.0.255",
  networkAddress: "192.168.1.0",
  broadcastAddress: "192.168.1.255",
  firstUsable: "192.168.1.1",
  lastUsable: "192.168.1.254",
  totalAddresses: 256,
  usableHostCount: 254,
  scope: "Private",
  legacyClass: "C",
});

const ipDetailsPayloadV6 = JSON.stringify({
  kind: "ip_details",
  version: 1,
  input: "2001:db8::1",
  inputType: "ipv6",
  ipVersion: 6,
  expanded: "2001:0db8:0000:0000:0000:0000:0000:0001",
  compressed: "2001:db8::1",
  scope: "Global Unicast",
});

const macAddressPayload = JSON.stringify({
  kind: "mac_address",
  version: 1,
  input: "00:1A:2B:3C:4D:5E",
  octets: [0, 26, 43, 60, 77, 94],
  colonLower: "00:1a:2b:3c:4d:5e",
  colonUpper: "00:1A:2B:3C:4D:5E",
  hyphen: "00-1A-2B-3C-4D-5E",
  ciscoDot: "001A.2B3C.4D5E",
  bare: "001a2b3c4d5e",
  oui: "00:1A:2B",
  nic: "3C:4D:5E",
  cast: "Unicast (individual)",
  administration: "Universal (OUI/vendor-assigned)",
  special: null,
});

const uuidDetailsPayload = JSON.stringify({
  kind: "uuid_details",
  version: 1,
  input: "550e8400-e29b-41d4-a716-446655440000",
  canonical: "550e8400-e29b-41d4-a716-446655440000",
  urn: "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
  uuidVersion: 4,
  versionLabel: "Random (v4)",
  special: null,
  variant: "RFC 4122/9562",
  timestamp: null,
  node: null,
});

const geoCoordinatesPayload = JSON.stringify({
  kind: "geo_coordinates",
  version: 1,
  input: "37.7749, -122.4194",
  lat: 37.7749,
  lng: -122.4194,
  decimal: "37.7749, -122.4194",
  latDms: "37°46'29.6\"N",
  lngDms: "122°25'9.8\"W",
  hemisphere: "N / W",
  osmUrl: "https://www.openstreetmap.org/?mlat=37.7749&mlon=-122.4194#map=12/37.7749/-122.4194",
  googleUrl: "https://maps.google.com/?q=37.7749,-122.4194",
});

/** Build an attachmentRenderer scenario; `view` routes to the feature component. */
function renderer(opts: {
  id: string;
  label: string;
  view: string;
  accentHex: string;
  attachmentType: string;
  payloadJson: string;
  min: number;
  max: number;
}): PreviewScenario {
  const item = {
    id: `item-${opts.id}`,
    type: "text",
    tags: ITEM_TAGS,
    sourceAppID: SOURCE_APP,
  };
  return {
    id: opts.id,
    label: opts.label,
    mode: "attachmentRenderer",
    pluginID: PLUGIN_ID,
    accentHex: opts.accentHex,
    view: opts.view,
    viewport: { heightPolicy: "bounded", min: opts.min, max: opts.max },
    item,
    attachment: {
      item,
      attachment: {
        historyID: `preview-${opts.id}`,
        owner: PLUGIN_ID,
        attachmentType: opts.attachmentType,
        attachmentKey: "primary",
        payloadJson: opts.payloadJson,
      },
    },
  };
}

export const attachmentScenarios: PreviewScenario[] = [
  renderer({
    id: "entities-renderer-mixed",
    label: "Extracted Entities: URL + Email + IP",
    view: "entities-renderer",
    accentHex: "#2563EB",
    attachmentType: "plugin.extractor.entities",
    min: 140,
    max: 420,
    payloadJson: entitiesPayload,
  }),
  renderer({
    id: "url-parsed-basic",
    label: "URL: tracking params removed",
    view: "url-parsed",
    accentHex: "#2563EB",
    attachmentType: "plugin.extractor.url",
    min: 140,
    max: 500,
    payloadJson: urlParsedPayload,
  }),
  renderer({
    id: "url-parsed-query-string",
    label: "Query String: duplicate keys",
    view: "url-parsed",
    accentHex: "#2563EB",
    attachmentType: "plugin.extractor.url",
    min: 140,
    max: 500,
    payloadJson: queryStringPayload,
  }),
  renderer({
    id: "ip-details-v4",
    label: "IP Address: IPv4 private host",
    view: "ip-details",
    accentHex: "#0891B2",
    attachmentType: "plugin.extractor.ip",
    min: 140,
    max: 380,
    payloadJson: ipDetailsPayloadV4,
  }),
  renderer({
    id: "ip-details-v4cidr",
    label: "IP Address: IPv4 CIDR /24",
    view: "ip-details",
    accentHex: "#0891B2",
    attachmentType: "plugin.extractor.ip",
    min: 140,
    max: 380,
    payloadJson: ipDetailsPayloadV4Cidr,
  }),
  renderer({
    id: "ip-details-v6",
    label: "IP Address: IPv6 global unicast",
    view: "ip-details",
    accentHex: "#0891B2",
    attachmentType: "plugin.extractor.ip",
    min: 140,
    max: 380,
    payloadJson: ipDetailsPayloadV6,
  }),
  renderer({
    id: "mac-address-unicast",
    label: "MAC Address: unicast universal",
    view: "mac-address",
    accentHex: "#7C3AED",
    attachmentType: "plugin.extractor.mac",
    min: 120,
    max: 320,
    payloadJson: macAddressPayload,
  }),
  renderer({
    id: "geo-coordinates-sf",
    label: "Coordinates: San Francisco decimal",
    view: "geo-coordinates",
    accentHex: "#16A34A",
    attachmentType: "plugin.extractor.geo",
    min: 120,
    max: 340,
    payloadJson: geoCoordinatesPayload,
  }),
  renderer({
    id: "uuid-details-v4",
    label: "UUID: random v4",
    view: "uuid-details",
    accentHex: "#7C3AED",
    attachmentType: "plugin.extractor.uuid",
    min: 120,
    max: 360,
    payloadJson: uuidDetailsPayload,
  }),
];
