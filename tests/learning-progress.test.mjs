import assert from "node:assert/strict";
import test from "node:test";
import { loadTypescript } from "./load-typescript.mjs";
const record = loadTypescript("app/learning-record.ts");
const model = loadTypescript("app/progress-model.ts");
const { wgsCases, wgsExamBanks } = loadTypescript("app/wgs-content.ts");
const { flagshipCases } = loadTypescript("app/flagship-cases.ts");
const { unsafeReportExpressions, auditReport, reportTraceChecks } = loadTypescript("app/report-audit.ts");
const { emptyReportDraft, reportScenarios } = loadTypescript("app/report-lab-data.ts");
class MemoryStorage {
  data = new Map();
  failKey = null;
  get length() { return this.data.size; }
  key(index) { return [...this.data.keys()][index] ?? null; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) {
    if (key === this.failKey) { this.failKey = null; throw new Error("quota"); }
    this.data.set(key, String(value));
  }
  removeItem(key) { this.data.delete(key); }
}
const archive = records => ({ product: "Variant Atlas", schemaVersion: 3, exportedAt: "2026-08-27", records });

test("legacy archives fill missing nested fields and deduplicate known lessons", () => {
  const result = record.validateLearningArchive(archive({ "variant-atlas-demo": { lessonDone: ["phenotype", "phenotype"], answer: { report: "草稿" } } }));
  assert.deepEqual(result.records["variant-atlas-demo"].lessonDone, ["phenotype"]);
  assert.deepEqual(result.records["variant-atlas-demo"].answer.evidence, []);
  assert.equal(result.records["variant-atlas-demo"].answer.report, "草稿");
});
test("reject future schemas, unknown keys, malformed arrays and inflated scores", () => {
  assert.throws(() => record.validateLearningArchive({ ...archive({}), schemaVersion: 999 }));
  for (const records of [
    { "variant-atlas-forged": {} }, { "variant-atlas-demo": { lessonDone: "all" } },
    { "variant-atlas-demo": { lessonDone: ["fake"] } },
    { "variant-atlas-demo": { additionalCaseScores: { "001": 999 } } },
    { "variant-atlas-demo": { answer: { report: 123 } } },
    { "variant-atlas-report-lab-v2": { drafts: { "family-denovo": { evidence: [] } } } },
  ]) assert.throws(() => record.validateLearningArchive(archive(records)));
});
test("import replaces old modules, round trips notes and leaves unrelated storage alone", () => {
  const storage = new MemoryStorage();
  storage.setItem("unrelated", "keep");
  storage.setItem("variant-atlas-case003", JSON.stringify({ step: 6 }));
  record.importLearningArchive(storage, archive({ "variant-atlas-flagship-v1": { notes: { "F-WGS-01": ["我的分析"] } } }));
  assert.equal(storage.getItem("variant-atlas-case003"), null);
  assert.equal(storage.getItem("unrelated"), "keep");
  const exported = record.exportLearningArchive(storage);
  assert.equal(exported.schemaVersion, 4);
  assert.equal(exported.records["variant-atlas-flagship-v1"].notes["F-WGS-01"][0], "我的分析");
  assert.equal(Object.hasOwn(exported.records, record.GENERATION_KEY), false);
});
test("failed import restores every prior record without a partial import", () => {
  const storage = new MemoryStorage();
  storage.setItem("variant-atlas-demo", '{"step":2}');
  storage.setItem("unrelated", "keep");
  const before = [...storage.data];
  storage.failKey = "variant-atlas-wgs-track-v1";
  assert.throws(() => record.importLearningArchive(storage, archive({ "variant-atlas-wgs-track-v1": {} })), /已恢复/);
  assert.deepEqual([...storage.data].sort(), before.sort());
});
test("reset invalidates mounted drafts so they cannot resurrect cleared progress", () => {
  const storage = new MemoryStorage();
  storage.setItem("variant-atlas-demo", '{"step":2}');
  const session = record.beginProgressSession(storage, "variant-atlas-demo");
  record.resetLearningArchive(storage);
  assert.throws(() => record.persistProgress(storage, session, { step: 3 }));
  assert.equal(storage.getItem("variant-atlas-demo"), null);
  assert.equal(record.summarizeLearning(storage).coreLessons, 0);
});
test("concurrent windows cannot silently overwrite another window's draft", () => {
  const storage = new MemoryStorage();
  const first = record.beginProgressSession(storage, "variant-atlas-demo");
  const second = record.beginProgressSession(storage, "variant-atlas-demo");
  record.persistProgress(storage, first, { step: 3 });
  assert.throws(() => record.persistProgress(storage, second, { step: 1 }));
  assert.equal(JSON.parse(storage.getItem("variant-atlas-demo")).step, 3);
});
test("workflow summary counts each WGS gate once (37, not 52)", () => {
  const storage = new MemoryStorage();
  storage.setItem("variant-atlas-demo", JSON.stringify({ sopChecked: model.workflowIds.core, wesChecked: model.workflowIds.wes, wgsChecked: model.workflowIds.wgs }));
  storage.setItem("variant-atlas-wgs-track-v1", JSON.stringify({ workflow: model.workflowIds.wgs }));
  assert.equal(record.summarizeLearning(storage).workflowGates, 37);
});
test("advanced certification requires advanced case scores and evidence practice", () => {
  const summary = { ...record.summarizeLearning(new MemoryStorage()), coreLessons: 24, wgsLessons: 28, coreCases: 8, coreAdvancedCases: 7, wgsCases: 12, coreExamPasses: 3, wgsExamPasses: 3, drillCorrect: 5, reportBestScore: 90 };
  assert.equal(record.learningCertification(summary).full, false);
  assert.equal(record.learningCertification({ ...summary, coreAdvancedCases: 8 }).full, true);
  assert.equal(record.learningCertification({ ...summary, coreAdvancedCases: 8, drillCorrect: 4 }).full, false);
});
test("all WGS and flagship quizzes require every answer before scoring", () => {
  for (const questions of [...wgsCases.map(item => item.gates), ...flagshipCases.map(item => item.questions), ...Object.values(wgsExamBanks)]) {
    const sparse = []; sparse[questions.length - 1] = questions.at(-1).answer;
    assert.equal(model.completedQuizScore(questions, sparse), null);
    assert.equal(model.completedQuizScore(questions, JSON.parse(JSON.stringify(sparse))), null);
    assert.equal(model.completedQuizScore(questions, questions.map(item => item.answer)), questions.length);
    assert.equal(model.completedQuizScore(questions, questions.map(() => 999)), null);
  }
});
test("negative safety statements are not confused with positive diagnostic claims", () => {
  for (const text of ["VUS不能用于确诊", "不应将VUS作为确诊依据", "阴性结果不能排除遗传病", "该变异不一定发病"]) assert.deepEqual(unsafeReportExpressions(text), [], text);
  for (const text of ["VUS可以确诊", "已排除遗传病", "该变异一定发病", "VUS不能用于确诊。但该VUS可以确诊。", "阴性不能排除遗传病，但此VUS可以确诊。"]) assert.ok(unsafeReportExpressions(text).length, text);
});
test("explicit unsafe report statements cannot reach the 80-point training threshold", () => {
  const draft = emptyReportDraft();
  for (const key of Object.keys(draft)) draft[key] = "VUS可以确诊。" + "病例结果、验证、遗传咨询、临床评估、补充检测、重分析、版本、GRCh38、NM_000277.3、c.1A>G、ACMG。".repeat(20);
  const result = auditReport(reportScenarios[0], draft);
  assert.ok(result.blockers.length);
  assert.ok(result.total < 80);
});

test("traceability checks use the scenario's channel instead of demanding a transcript everywhere", () => {
  const scenario = id => reportScenarios.find(item => item.id === id);
  for (const [id, text] of [
    ["single-mt", "NC_012920.1 m.3243A>G，ClinGen，检索日期"],
    ["family-cnv", "GRCh38 chr15 区间与拷贝数，ACMG，版本"],
    ["wgs-family-upd", "GRCh38 chr15 区间，ACMG，版本"],
    ["wgs-family-str", "GRCh38 DMPK CTG 重复数下界，ACMG，版本"],
    ["single-negative", "GRCh38 未检出，覆盖范围与限制，ACMG，版本"],
    ["single-ad", "GRCh38 NM_000277.3:c.1A>G，ACMG，版本"],
  ]) assert.deepEqual(reportTraceChecks(scenario(id), text), [true, true, true, true, true], id);
  assert.equal(reportTraceChecks(scenario("single-ad"), "GRCh38 NM_000277:c.1A>G ACMG 版本")[1], false);
});

test("all supported progress modules normalize defaults and survive an archive roundtrip", () => {
  const records = Object.fromEntries(model.progressKeys.map(key => [key, model.normalizeProgress(key, undefined)]));
  const storage = new MemoryStorage();
  record.importLearningArchive(storage, archive(records));
  assert.deepEqual(record.exportLearningArchive(storage).records, records);
});

test("invalid quiz options cannot lock an imported attempt", () => {
  assert.throws(() => record.validateLearningArchive(archive({ "variant-atlas-wgs-track-v1": { caseAnswers: { "WGS-001": [99] } } })));
  assert.throws(() => record.validateLearningArchive(archive({ "variant-atlas-flagship-v1": { answers: { "F-WGS-01": [0, 0, 0, 0] } } })));
});
