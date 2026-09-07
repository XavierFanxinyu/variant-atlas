import test from "node:test";
import assert from "node:assert/strict";
import { loadTypescript } from "./load-typescript.mjs";
const { collectReviewItems, reviewSignature, isReviewCurrent, REVIEW_INTERVAL_MS } = loadTypescript("app/review-model.ts");
const { examBanks } = loadTypescript("app/learning-content.ts");
const { wgsCases, wgsExamBanks } = loadTypescript("app/wgs-content.ts");
const { flagshipCases } = loadTypescript("app/flagship-cases.ts");
const { auditReport, reportExpectationDetails, reportTraceDetails } = loadTypescript("app/report-audit.ts");
const { emptyReportDraft, reportScenarios } = loadTypescript("app/report-lab-data.ts");
const storage = records => ({ getItem: key => records[key] === undefined ? null : JSON.stringify(records[key]) });
const wrong = question => (question.answer + 1) % question.options.length;

test("review collects concrete errors from core, WGS exams, cases and flagship", () => {
  const core = examBanks.L1[0], exam = wgsExamBanks.W2[0], gate = wgsCases[0].gates[0], flagship = flagshipCases[0].questions[0];
  const items = collectReviewItems(storage({
    "variant-atlas-demo": { examResponses: { [core.id]: wrong(core) } },
    "variant-atlas-wgs-track-v1": { examResponses: { [exam.id]: wrong(exam) }, caseAnswers: { [wgsCases[0].id]: [wrong(gate)] } },
    "variant-atlas-flagship-v1": { answers: { [flagshipCases[0].id]: [wrong(flagship)] } },
  }));
  assert.equal(items.length, 4);
  assert.equal(new Set(items.map(item => item.id)).size, 4);
  assert.ok(items.every(item => item.selected !== item.answer && item.rationale && item.options));
});
test("correct answers and unfinished attempts do not create false errors", () => {
  const core = examBanks.L1[0], gate = wgsCases[0].gates[0];
  assert.deepEqual(collectReviewItems(storage({
    "variant-atlas-demo": { examResponses: { [core.id]: core.answer } },
    "variant-atlas-wgs-track-v1": { caseAnswers: { [wgsCases[0].id]: [gate.answer, null] } },
  })), []);
});
test("legacy topics retain their provenance instead of inventing original choices", () => {
  const [item] = collectReviewItems(storage({ "variant-atlas-demo": { mistakes: ["家系相位"] } }));
  assert.equal(item.group, "历史主题");
  assert.equal(item.options, undefined);
});
test("unsafe report text enters review and disappears after safe correction", () => {
  const key = "variant-atlas-report-lab-v2";
  const draft = { ...emptyReportDraft(), conclusion: "VUS可以确诊。" };
  assert.equal(collectReviewItems(storage({ [key]: { drafts: { "family-denovo": draft } } }))[0].group, "报告风险");
  draft.conclusion = "VUS不能用于确诊。";
  assert.deepEqual(collectReviewItems(storage({ [key]: { drafts: { "family-denovo": draft } } })), []);
});
test("review markers expire after 24 hours and changed observations reopen review", () => {
  const signature = reviewSignature([1, "old"]), now = 100000000;
  assert.equal(isReviewCurrent(signature + ":" + now, signature, now + 1000), true);
  assert.equal(isReviewCurrent(signature + ":" + now, signature, now + REVIEW_INTERVAL_MS), false);
  assert.equal(isReviewCurrent(signature + ":" + now, reviewSignature([2, "new"]), now), false);
  assert.equal(isReviewCurrent(signature + ":" + (now + 1), signature, now), false);
});
test("report criterion explanations expose actual matched text and missing all-terms", () => {
  const draft = { ...emptyReportDraft(), evidence: "已确认反式，仍需分类。" };
  const item = reportExpectationDetails({ label: "双要点", terms: ["反式", "致病"], match: "all" }, draft, "test");
  assert.equal(item.met, false);
  assert.ok(item.observations[0].includes("已确认反式"));
  assert.ok(item.observations.every(text => !text.includes("致病")));
});
test("trace explanations preserve channel-aware checks with inspectable matches", () => {
  const scenario = reportScenarios.find(item => item.id === "single-mt");
  const details = reportTraceDetails(scenario, "NC_012920.1 m.3243A>G ClinGen 版本");
  assert.ok(details.every(item => item.met && item.observations.length));
  assert.equal(details[0].observations[0], "NC_012920.1");
  const checks = auditReport(scenario, emptyReportDraft()).checks;
  assert.equal(new Set(checks.map(item => item.id)).size, checks.length);
});
