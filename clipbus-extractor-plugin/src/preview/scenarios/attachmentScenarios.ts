// Attachment preview scenarios for the dev workbench.
// Add entries here as you implement attachment renderer features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

export interface AttachmentScenario {
  id: string;
  label: string;
  rendererComponent: "compact" | "expanded";
  searchTerms: string[];
  accentHex: string;
  bootstrap: Record<string, unknown>;
}

const urlParsedPayload = JSON.stringify({
  kind: "url_parsed",
  version: 1,
  input: "https://user@example.com:8080/path/to/page?q=clip&lang=en#section",
  href: "https://user@example.com:8080/path/to/page?q=clip&lang=en#section",
  scheme: "https",
  username: "user",
  host: "example.com",
  port: "8080",
  path: "/path/to/page",
  query: [
    { key: "q", value: "clip" },
    { key: "lang", value: "en" },
  ],
  hash: "#section",
  display: {
    typeLabel: "URL",
    headline: "example.com",
    facts: [
      { label: "Scheme", value: "https" },
      { label: "Host", value: "example.com" },
      { label: "Port", value: "8080" },
      { label: "Path", value: "/path/to/page" },
      { label: "Hash", value: "#section" },
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

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "entities-renderer-mixed",
    label: "Extracted Entities: URL + Email + IP",
    rendererComponent: "compact",
    searchTerms: ["extract", "url", "email", "ip"],
    accentHex: "#2563EB",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "entities_preview",
          version: 1,
          urls: ["https://example.com", "https://foo.org"],
          emails: ["john@example.com"],
          ips: ["192.168.1.1"],
          totalCount: 4,
        }),
      },
    },
  },
  {
    id: "url-parsed-basic",
    label: "URL: parsed structure",
    rendererComponent: "compact",
    searchTerms: ["url", "host", "query"],
    accentHex: "#2563EB",
    bootstrap: {
      attachment: {
        historyID: "preview-url",
        owner: "plugin.extractor",
        attachmentType: "plugin.extractor.url",
        attachmentKey: "primary",
        payloadJson: urlParsedPayload,
      },
    },
  },
  {
    id: "ip-details-v4",
    label: "IP Address: IPv4 private host",
    rendererComponent: "compact",
    searchTerms: ["ip", "ipv4", "private", "address"],
    accentHex: "#0891B2",
    bootstrap: {
      attachment: {
        historyID: "preview-ip-v4",
        owner: "plugin.extractor",
        attachmentType: "plugin.extractor.ip",
        attachmentKey: "primary",
        payloadJson: ipDetailsPayloadV4,
      },
    },
  },
  {
    id: "ip-details-v4cidr",
    label: "IP Address: IPv4 CIDR /24",
    rendererComponent: "compact",
    searchTerms: ["ip", "cidr", "subnet", "netmask"],
    accentHex: "#0891B2",
    bootstrap: {
      attachment: {
        historyID: "preview-ip-v4cidr",
        owner: "plugin.extractor",
        attachmentType: "plugin.extractor.ip",
        attachmentKey: "primary",
        payloadJson: ipDetailsPayloadV4Cidr,
      },
    },
  },
  {
    id: "ip-details-v6",
    label: "IP Address: IPv6 global unicast",
    rendererComponent: "compact",
    searchTerms: ["ip", "ipv6", "global", "unicast"],
    accentHex: "#0891B2",
    bootstrap: {
      attachment: {
        historyID: "preview-ip-v6",
        owner: "plugin.extractor",
        attachmentType: "plugin.extractor.ip",
        attachmentKey: "primary",
        payloadJson: ipDetailsPayloadV6,
      },
    },
  },
  {
    id: "mac-address-unicast",
    label: "MAC Address: unicast universal",
    rendererComponent: "compact",
    searchTerms: ["mac", "address", "ethernet", "oui"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        historyID: "preview-mac",
        owner: "plugin.extractor",
        attachmentType: "plugin.extractor.mac",
        attachmentKey: "primary",
        payloadJson: macAddressPayload,
      },
    },
  },
  {
    id: "geo-coordinates-sf",
    label: "Coordinates: San Francisco decimal",
    rendererComponent: "compact",
    searchTerms: ["geo", "coordinates", "latitude", "longitude"],
    accentHex: "#16A34A",
    bootstrap: {
      attachment: {
        historyID: "preview-geo-sf",
        owner: "plugin.extractor",
        attachmentType: "plugin.extractor.geo",
        attachmentKey: "primary",
        payloadJson: geoCoordinatesPayload,
      },
    },
  },
];
