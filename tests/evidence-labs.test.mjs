import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTypescript } from "./load-typescript.mjs";
const { calculateDeNovo, deNovoStrength, emptyDeNovo, calculateSegregation, emptySegregation, phenotypePoints, yieldPoints } = loadTypescript("app/evidence-lab-model.ts");
const { pvs1Route, setPVS1Answer } = loadTypescript("app/pvs1-model.ts");
const { normalizeProgress } = loadTypescript("app/progress-model.ts");
const { evidencePackets, packetDecisionComplete, packetDecisionCorrect } = loadTypescript("app/evidence-packets-data.ts");
const { collectReviewItems } = loadTypescript("app/review-model.ts");
const deNovo = (family, patch = {}) => ({ ...emptyDeNovo(), family, source: "Public guideline p1", parentage: "confirmed", parentsNegative: true, phenotype: "specific", verified: true, ...patch });
const segregation = patch => ({ ...emptySegregation(), scope: true, ...patch });
const relative = (person, patch = {}) => ({ person, source: "Public figure", affected: true, verified: true, ...patch });
const tree = patch => ({ scope: "general", mechanism: "full", type: "truncating", exon: "yes", nmd: "yes", ...patch });

test("de novo table matrix, mixed parental status and exact thresholds", () => {
  for (const [phenotype, expected] of [["specific",2],["consistent",1],["heterogeneous",0.5],["inconsistent",0]]) {
    assert.equal(calculateDeNovo([deNovo("A", { phenotype })], true).total, expected);
    assert.equal(calculateDeNovo([deNovo("A", { phenotype, parentage: "assumed" })], true).total, expected / 2);
  }
  const mixed = calculateDeNovo([deNovo("A"), deNovo("B", { parentage: "assumed" }), deNovo("C", { parentage: "assumed" })], true);
  assert.equal(mixed.total, 4); assert.equal(mixed.strength, "PS2_VeryStrong");
  for (const [n, strength] of [[0.49,"未满足新发证据"],[0.5,"PM6_Supporting"],[1,"PM6_Moderate"],[2,"PM6_Strong"],[4,"PM6_VeryStrong"]]) assert.equal(deNovoStrength(n, false), strength);
});
test("de novo cap, duplicate families and missing evidence pause strength", () => {
  const rows = ["A","B","C"].map(id => deNovo(id, { phenotype: "heterogeneous" }));
  const capped = calculateDeNovo(rows, true);
  assert.equal(capped.heterogeneous, 1.5); assert.equal(capped.total, 1); assert.equal(capped.strength, "PS2_Moderate");
  for (const patch of [{ source: "" }, { verified: false }, { parentsNegative: false }, { parentage: "unknown" }, { special: true }]) {
    const result = calculateDeNovo([deNovo("A"), deNovo("B", patch)], true);
    assert.equal(result.total, 2); assert.equal(result.pending, true); assert.match(result.strength, /待人工/);
  }
  assert.equal(calculateDeNovo([deNovo("A"), deNovo(" a ")], true).total, 0);
  assert.equal(calculateDeNovo([deNovo("A")], false).total, 0);
});
test("PP4 uses exact lower bins, rejects invalid yield and apportions before capping", () => {
  for (const [yieldValue, points] of yieldPoints) assert.equal(phenotypePoints(yieldValue), points);
  assert.equal(phenotypePoints(19), 0); assert.equal(phenotypePoints(95.8), 7);
  for (const invalid of [NaN, Infinity, -1, 101]) assert.equal(phenotypePoints(invalid), null);
  const input = segregation({ homogeneous: true, yieldPercent: "95.8", yieldSource: "matching public yield", yieldVerified: true, variants: "2", rows: [relative("A")] });
  const result = calculateSegregation(input);
  assert.equal(result.pp1, 0); assert.equal(result.pp4, 7); assert.equal(result.divided, 3.5); assert.equal(result.total, 3.5);
  assert.equal(result.strength, "Moderate＋Supporting");
  assert.equal(calculateSegregation({ ...input, variants: "1" }).total, 5);
  for (const patch of [{ yieldPercent: "101" }, { yieldSource: "" }, { yieldVerified: false }, { variants: "0" }, { variants: "1.5" }]) assert.match(calculateSegregation({ ...input, ...patch }).strength, /待人工/);
});
test("PP1 respects inheritance, unaffected restrictions, shared ceiling and complex-family stop", () => {
  const rows = [relative("A"), relative("B", { affected: false })];
  assert.equal(calculateSegregation(segregation({ mode: "AR", rows, fullyPenetrant: true })).pp1, 2.4);
  for (const mode of ["AD", "XLR"]) assert.equal(calculateSegregation(segregation({ mode, rows, fullyPenetrant: true })).pp1, 2);
  assert.match(calculateSegregation(segregation({ rows })).strength, /待人工/);
  assert.match(calculateSegregation(segregation({ complex: true })).strength, /待人工/);
  assert.equal(calculateSegregation(segregation({ rows: [relative("A"), relative(" a ")] })).pp1, 0);
  const capped = calculateSegregation(segregation({ mode: "AR", rows: ["A","B","C","D"].map(id => relative(id)) }));
  assert.equal(capped.raw, 8); assert.equal(capped.total, 5); assert.doesNotMatch(capped.strength, /VeryStrong/);
});
test("PVS1 branches cover NMD, truncation, initiation, duplication and clinical stops", () => {
  assert.equal(pvs1Route(tree()).strength, "PVS1（VeryStrong）");
  assert.equal(pvs1Route(tree({ mechanism: "down1" })).strength, "PVS1_Strong");
  assert.equal(pvs1Route(tree({ mechanism: "down2" })).strength, "PVS1_Moderate");
  assert.equal(pvs1Route(tree({ nmd: "no", critical: "yes" })).strength, "PVS1_Strong");
  assert.equal(pvs1Route(tree({ nmd: "no", critical: "no", proportion: "under" })).strength, "PVS1_Moderate");
  assert.equal(pvs1Route(tree({ nmd: "no", critical: "no", proportion: "boundary" })).review, true);
  assert.equal(pvs1Route(tree({ exon: "no" })).strength, "不赋PVS1");
  assert.equal(pvs1Route(tree({ type: "start", alternative: "no", upstream: "yes" })).strength, "PVS1_Moderate");
  assert.equal(pvs1Route(tree({ type: "start", alternative: "no", upstream: "no" })).strength, "PVS1_Supporting");
  assert.equal(pvs1Route(tree({ type: "start", alternative: "yes" })).strength, "不赋PVS1");
  assert.equal(pvs1Route(tree({ type: "start", alternative: "no", upstream: "no", mechanism: "down1" })).level, 0);
  const duplication = tree({ type: "duplication", length: "yes", location: "tandem", frame: "out" });
  assert.equal(pvs1Route(duplication).level, 4);
  assert.equal(pvs1Route({ ...duplication, location: "unknown" }).level, 3);
  assert.equal(pvs1Route({ ...duplication, frame: "in" }).level, 0);
  assert.equal(pvs1Route({ ...duplication, length: "unknown" }).review, true);
  assert.equal(pvs1Route(tree({ type: "splice", rescue: "unknown" })).review, true);
  assert.equal(pvs1Route(tree({ type: "splice", rescue: "yes", frame: "in", critical: "yes" })).review, true);
  assert.equal(pvs1Route(tree({ type: "deletion", frame: "out" })).level, 4);
  assert.equal(pvs1Route(tree({ scope: "specific" })).review, true);
});
test("PVS1 upstream changes remove stale branches and never jump unanswered gates", () => {
  const changed = setPVS1Answer(tree(), "type", "start");
  assert.deepEqual(changed, { scope: "general", mechanism: "full", type: "start" });
  assert.equal(pvs1Route(changed).question.id, "exon");
  assert.equal(pvs1Route({ nmd: "yes" }).question.id, "scope");
  assert.equal(pvs1Route({ scope: "general", mechanism: "nonsense" }).question.id, "mechanism");
});
test("all new progress modules roundtrip, reject corruption and retain earlier schemas", () => {
  const values = {
    "variant-atlas-denovo-v1": { rows: [deNovo("A")], scope: true },
    "variant-atlas-segregation-v1": segregation({ rows: [relative("A")] }),
    "variant-atlas-pvs1-v1": { answers: tree(), record: "公开来源底稿" },
  };
  for (const [key, value] of Object.entries(values)) assert.deepEqual(normalizeProgress(key, value), value);
  assert.throws(() => normalizeProgress("variant-atlas-denovo-v1", { rows: Array(31).fill(deNovo("A")) }));
  assert.throws(() => normalizeProgress("variant-atlas-pvs1-v1", { answers: { nmd: "always" } }));
  assert.throws(() => normalizeProgress("variant-atlas-pvs1-v1", { answers: { injected: "yes" } }));
  const { validateLearningArchive } = loadTypescript("app/learning-record.ts");
  for (let schemaVersion = 1; schemaVersion <= 6; schemaVersion++) assert.doesNotThrow(() => validateLearningArchive({ product: "Variant Atlas", schemaVersion, exportedAt: "2026-09-21T00:00:00.000Z", records: { "variant-atlas-demo": {} } }));
});
test("packets distinguish decisions and strengths, freeze snapshots and feed review", () => {
  const note = "依据公开原文逐项审核计分、强度与资料边界，并记录所需补充证据。";
  for (const item of evidencePackets.flatMap(packet => packet.items)) {
    const decision = { action: item.answer, strength: item.target, note };
    assert.equal(packetDecisionComplete(item, decision), true); assert.equal(packetDecisionCorrect(item, decision), true);
    assert.equal(packetDecisionComplete(item, { ...decision, note: "太短" }), false);
    const saved = normalizeProgress("variant-atlas-packets-v1", { submitted: { [item.id]: { ...decision, action: (item.answer + 1) % 4 } } });
    const queue = collectReviewItems({ getItem: key => key === "variant-atlas-packets-v1" ? JSON.stringify(saved) : null });
    assert.equal(queue.length, 1); assert.equal(queue[0].answer, item.answer);
    assert.throws(() => normalizeProgress("variant-atlas-packets-v1", { submitted: { [item.id]: { ...decision, strength: "PVS1_invalid" } } }));
    assert.throws(() => normalizeProgress("variant-atlas-packets-v1", { submitted: { [item.id]: {} } }));
  }
});
test("labs and packets render safe initial states without leaking reference feedback", () => {
  const modules = loadTypescript("app/evidence-labs.tsx");
  for (const name of ["DeNovoLab", "SegregationLab", "PVS1Lab"]) {
    const html = renderToStaticMarkup(createElement(modules[name]));
    assert.match(html, /2026-09-21/); assert.match(html, /https:/);
    assert.doesNotMatch(html, /<strong>PVS1（VeryStrong）<\/strong>/);
  }
  const Packet = loadTypescript("app/evidence-packets.tsx").default;
  const html = renderToStaticMarkup(createElement(Packet, { onReview: () => {} }));
  assert.match(html, /候选输出/); assert.match(html, /第二步 · 展开原文事实/);
  assert.doesNotMatch(html, /原文事实（转述）|参考决定与强度正确|需要复习/);
});
