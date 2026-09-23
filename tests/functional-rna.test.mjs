import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTypescript } from "./load-typescript.mjs";
const m = loadTypescript("app/functional-rna-model.ts");
const { normalizeProgress } = loadTypescript("app/progress-model.ts");
const { validateLearningArchive } = loadTypescript("app/learning-record.ts");
const functional = patch => ({ ...m.emptyFunctional(), source: "DOI Table 3", record: "Verified calibration and applicable general specification", odds: "20", direction: "abnormal", checks: m.functionalChecks.map(([id]) => id), ...patch });
const rna = patch => ({ ...m.emptyRNA(), source: "Walker Table 3", record: "Tissue, transcript, quantification, NMD and applicable specification reviewed", material: "patient", outcome: "abnormal", variant: "silent-intronic", lof: true, checks: m.rnaChecks.map(([id]) => id), ...patch });

test("OddsPath mapping retains strict boundaries in both directions", () => {
  for (const [value, expected] of [[351,"PS3_VeryStrong"],[350,"PS3_Strong"],[18.7001,"PS3_Strong"],[18.7,"PS3_Moderate"],[4.3001,"PS3_Moderate"],[4.3,"PS3_Supporting"],[2.1001,"PS3_Supporting"],[2.1,"不赋方向性证据"],[0.48,"不赋方向性证据"],[0.479,"BS3_Supporting"],[0.23,"BS3_Supporting"],[0.229,"BS3_Moderate"],[0.053,"BS3_Moderate"],[0.0529,"BS3_Strong"],[0.778,"不赋方向性证据"]]) assert.equal(m.oddsPathStrength(value), expected);
  for (const value of [NaN, Infinity, -1, 0]) assert.equal(m.oddsPathStrength(value), null);
});
test("functional prerequisites and directional conflicts block assignment", () => {
  assert.equal(m.reviewFunctional(functional()).strength, "PS3_Strong");
  for (const [id] of m.functionalChecks) assert.equal(m.reviewFunctional(functional({ checks: m.functionalChecks.map(([key]) => key).filter(key => key !== id) })).strength, "暂缓赋值");
  for (const patch of [{ source: " " }, { record: "" }, { conflict: true }, { direction: "normal" }, { direction: "unknown" }, { direction: "indeterminate" }]) assert.equal(m.reviewFunctional(functional(patch)).strength, "暂缓赋值");
  assert.equal(m.reviewFunctional(functional({ odds: "0.01" })).strength, "暂缓赋值");
  assert.equal(m.reviewFunctional(functional({ odds: "8.7e-5", direction: "normal" })).strength, "BS3_Strong");
  assert.equal(m.reviewFunctional(functional({ odds: "0.778" })).strength, "不赋方向性证据");
});
test("functional numeric input rejects malformed, blank, nonfinite and nondecimal forms", () => {
  for (const odds of ["", " ", "0", "Infinity", "NaN", "0x10", "1/20", "1,000", "<0.05", "1e999", "1e-999", "-0.1"]) assert.equal(m.reviewFunctional(functional({ odds })).strength, "暂缓赋值");
});
test("RNA routing does not auto-assign strength; LoF and protein consequences matter", () => {
  assert.match(m.reviewRNA(rna()).route, /PVS1\(RNA\).*待定/);
  assert.match(m.reviewRNA(rna({ lof: false })).route, /暂缓/);
  assert.match(m.reviewRNA(rna({ outcome: "normal" })).route, /BP7\(RNA\).*待定/);
  assert.match(m.reviewRNA(rna({ outcome: "normal", variant: "protein-altering" })).route, /不排除蛋白/);
  assert.match(m.reviewRNA(rna({ outcome: "complex" })).route, /专项人工/);
  assert.match(m.reviewRNA(rna({ material: "minigene" })).issues.join(" "), /不能默认/);
  assert.match(m.reviewRNA(rna({ material: "other" })).issues.join(" "), /不能默认/);
});
test("RNA requires each quality checkpoint and source metadata", () => {
  for (const [id] of m.rnaChecks) assert.match(m.reviewRNA(rna({ checks: m.rnaChecks.map(([key]) => key).filter(key => key !== id) })).route, /暂缓/);
  for (const patch of [{ source: " " }, { record: "" }, { material: "unknown" }, { outcome: "unknown" }, { variant: "unknown" }]) assert.match(m.reviewRNA(rna(patch)).route, /暂缓/);
});
test("functional and RNA progress roundtrip in v7 with strict enums and retained v6", () => {
  const records = { "variant-atlas-functional-v1": functional(), "variant-atlas-rna-v1": rna() };
  for (const [key, value] of Object.entries(records)) assert.deepEqual(normalizeProgress(key, value), value);
  assert.deepEqual(validateLearningArchive({ product: "Variant Atlas", schemaVersion: 7, records }).records, records);
  assert.doesNotThrow(() => validateLearningArchive({ product: "Variant Atlas", schemaVersion: 6, records: { "variant-atlas-packets-v1": { activeId: "packet-pah" } } }));
  for (const [key, value] of Object.entries(records)) assert.throws(() => normalizeProgress(key, { ...value, checks: ["made-up"] }));
  assert.throws(() => normalizeProgress("variant-atlas-rna-v1", { outcome: "always-strong" }));
});
test("new labs render safe initial state, source links and no clinical result", () => {
  const labs = loadTypescript("app/functional-rna-labs.tsx");
  for (const Component of [labs.FunctionalLab, labs.RNALab]) {
    const html = renderToStaticMarkup(createElement(Component));
    assert.match(html, /暂缓/); assert.match(html, /2026-09-23/); assert.match(html, /https:/);
    assert.doesNotMatch(html, /<strong>PS3_Strong<\/strong>/);
  }
});
