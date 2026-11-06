"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

const {
  expandField,
  computeNextRuns,
  createCronPayload,
} = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES   = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

/** Parse a cron expression into CronField[] via createCronPayload. */
function parseFields(expr) {
  const payload = createCronPayload({
    item: { id: "i1", type: "text", tags: [], sourceAppID: "com.example" },
    content: { kind: "text", text: expr },
    attachments: [],
  });
  if (!payload) throw new Error(`Failed to parse cron expression: ${expr}`);
  return payload.fields;
}

// ── expandField ───────────────────────────────────────────────────────────────

test("expandField: */15 over minute (0,59) → [0,15,30,45]", () => {
  assert.deepEqual(expandField("*/15", 0, 59), [0, 15, 30, 45]);
});

test("expandField: 1-5 weekday → [1,2,3,4,5]", () => {
  assert.deepEqual(expandField("1-5", 0, 7, WEEKDAY_NAMES), [1, 2, 3, 4, 5]);
});

test("expandField: MON-FRI weekday via names → [1,2,3,4,5]", () => {
  assert.deepEqual(expandField("MON-FRI", 0, 7, WEEKDAY_NAMES), [1, 2, 3, 4, 5]);
});

test("expandField: */3 month (1,12) → [1,4,7,10]", () => {
  assert.deepEqual(expandField("*/3", 1, 12, MONTH_NAMES), [1, 4, 7, 10]);
});

test("expandField: '7' weekday normalises to 0", () => {
  // Both 7 and 0 represent Sunday; the set must use 0..6.
  assert.deepEqual(expandField("7", 0, 7, WEEKDAY_NAMES), [0]);
});

// ── computeNextRuns ────────────────────────────────────────────────────────────

test("*/15 * * * * — next 5 from 2024-01-01 00:00 → 00:15,00:30,00:45,01:00,01:15", () => {
  const from  = new Date(2024, 0, 1, 0, 0).getTime();
  const runs  = computeNextRuns(parseFields("*/15 * * * *"), from, 5);
  assert.deepEqual(runs, [
    new Date(2024, 0, 1, 0, 15).getTime(),
    new Date(2024, 0, 1, 0, 30).getTime(),
    new Date(2024, 0, 1, 0, 45).getTime(),
    new Date(2024, 0, 1, 1,  0).getTime(),
    new Date(2024, 0, 1, 1, 15).getTime(),
  ]);
});

test("0 9 * * 1-5 — from Sat 2024-01-06 12:00 → first = Mon 2024-01-08 09:00", () => {
  const from = new Date(2024, 0, 6, 12, 0).getTime(); // Saturday
  const runs = computeNextRuns(parseFields("0 9 * * 1-5"), from, 5);
  assert.ok(runs.length >= 1, "should find at least one run");
  assert.equal(runs[0], new Date(2024, 0, 8, 9, 0).getTime()); // Monday
});

test("0 0 1 1 * — Jan 1 midnight — from 2024-06-01 → first = 2025-01-01 00:00", () => {
  const from = new Date(2024, 5, 1, 0, 0).getTime();
  const runs = computeNextRuns(parseFields("0 0 1 1 *"), from, 5);
  assert.ok(runs.length >= 1, "should find at least one run");
  assert.equal(runs[0], new Date(2025, 0, 1, 0, 0).getTime());
});

test("DOM/DOW OR rule: '0 0 13 * 5' — from 2024-09-01 (Sun) → first run = Fri 2024-09-06 00:00", () => {
  // Sep 1 2024 is a Sunday. Next Friday is Sep 6 (DOW match).
  // Sep 13 is also a Friday AND the 13th (both conditions satisfied).
  const from = new Date(2024, 8, 1, 0, 0).getTime();
  const runs = computeNextRuns(parseFields("0 0 13 * 5"), from, 5);
  assert.ok(runs.length >= 1, "should find at least one run");
  assert.equal(runs[0], new Date(2024, 8, 6, 0, 0).getTime(), "first run should be Fri Sep 6");
  assert.ok(
    runs.includes(new Date(2024, 8, 13, 0, 0).getTime()),
    "Sep 13 (Friday AND 13th) should appear in results",
  );
});

test("DOM/DOW OR rule: non-Friday 13th still fires (DOM-only match)", () => {
  // Oct 13, 2024 is a Sunday (not a Friday). With OR rule, it fires because day=13.
  // Also verify regular Fridays appear.
  const from = new Date(2024, 9, 1, 0, 0).getTime(); // Oct 1, 2024 (Tuesday)
  const runs = computeNextRuns(parseFields("0 0 13 * 5"), from, 10);
  // Oct 4, 2024 → Friday → DOW match
  assert.ok(runs.includes(new Date(2024, 9, 4, 0, 0).getTime()), "Oct 4 (Fri) should appear");
  // Oct 11, 2024 → Friday → DOW match
  assert.ok(runs.includes(new Date(2024, 9, 11, 0, 0).getTime()), "Oct 11 (Fri) should appear");
  // Oct 13, 2024 → Sunday, day=13 → DOM match (non-Friday 13th)
  assert.ok(
    runs.includes(new Date(2024, 9, 13, 0, 0).getTime()),
    "Oct 13 (Sunday, 13th) should appear via DOM-only match",
  );
});

test("never-matches: '0 0 30 2 *' → computeNextRuns returns []", () => {
  // Feb never has a 30th day; the cap is reached and an empty array is returned.
  const from = new Date(2024, 0, 1, 0, 0).getTime();
  const runs = computeNextRuns(parseFields("0 0 30 2 *"), from, 5);
  assert.deepEqual(runs, []);
});
