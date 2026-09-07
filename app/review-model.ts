import { normalizeProgress } from "./progress-model";
import { evidenceDrills, examBanks } from "./learning-content";
import { wgsCases, wgsExamBanks } from "./wgs-content";
import { flagshipCases } from "./flagship-cases";
import { auditReport } from "./report-audit";
import { emptyReportDraft, reportScenarios, type ReportDraft } from "./report-lab-data";

export type ReviewItem = { id: string; group: string; title: string; prompt: string; rationale: string; signature: string; options?: string[]; answer?: number; selected?: number };
export const REVIEW_INTERVAL_MS = 24 * 60 * 60 * 1000;
export function isReviewCurrent(marker: string | undefined, signature: string, now = Date.now()): boolean {
  if (!marker) return false;
  const [saved, timestamp] = marker.split(":");
  const time = Number(timestamp);
  return saved === signature && Number.isFinite(time) && time <= now && now - time < REVIEW_INTERVAL_MS;
}
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const read = (storage: Storage, key: string) => {
  try { return normalizeProgress(key, JSON.parse(storage.getItem(key) ?? "{}")); } catch { return {}; }
};
/** Fingerprint the observation, not just its topic, so changed answers reopen review. */
export function reviewSignature(value: unknown): string {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}
export function collectReviewItems(storage: Storage): ReviewItem[] {
  const result: ReviewItem[] = [];
  const core = read(storage, "variant-atlas-demo"), wgs = read(storage, "variant-atlas-wgs-track-v1"), flagship = read(storage, "variant-atlas-flagship-v1");
  const addQuestion = (id: string, group: string, title: string, q: { options: string[]; answer: number; rationale: string }, prompt: string, selected: unknown) => {
    if (typeof selected !== "number" || !Number.isInteger(selected) || selected < 0 || selected >= q.options.length || selected === q.answer) return;
    result.push({ id, group, title, prompt, options: q.options, answer: q.answer, selected, rationale: q.rationale, signature: reviewSignature([selected, q.answer, q.rationale]) });
  };
  const coreResponses = object(core.examResponses);
  for (const [level, questions] of Object.entries(examBanks)) for (const question of questions) addQuestion(`core:${question.id}`, "核心测验", `${level} · ${question.tag}`, question, question.q, coreResponses[question.id]);
  // v1.3 kept topics only; retain them transparently without inventing the original answer.
  const coveredTopics = new Set(Object.values(examBanks).flat().filter(question => Object.hasOwn(coreResponses, question.id)).map(question => question.tag));
  for (const topic of array(core.mistakes)) if (typeof topic === "string" && !coveredTopics.has(topic)) result.push({ id: `legacy:${topic}`, group: "历史主题", title: topic, prompt: "旧版只保存了错误主题，没有原始作答。请回到对应课程或证据规则复习。", rationale: "重新参加核心测验后，错题本会记录具体题目和选择。", signature: reviewSignature(topic) });
  for (const drill of evidenceDrills) {
    if (!array(core.drillCompleted).includes(drill.id)) continue;
    const selected = drill.options.indexOf(String(object(core.drillAnswers)[drill.id] ?? ""));
    addQuestion(`drill:${drill.id}`, "证据练习", drill.title, { options: drill.options, answer: drill.options.findIndex(option => drill.expected.includes(option)), rationale: drill.explanation }, drill.stem, selected);
  }
  const wgsResponses = { ...(wgs.examSubmitted ? object(wgs.examAnswers) : {}), ...object(wgs.examResponses) };
  for (const [level, questions] of Object.entries(wgsExamBanks)) for (const question of questions) addQuestion(`wgs-exam:${question.id}`, "WGS测验", `${level} · ${question.tag}`, question, question.q, wgsResponses[question.id]);
  for (const item of wgsCases) item.gates.forEach((gate, index) => addQuestion(`wgs-case:${item.id}:${index}`, "WGS病例", `${item.id} · ${item.title}`, gate, gate.question, array(object(wgs.caseAnswers)[item.id])[index]));
  for (const item of flagshipCases) item.questions.forEach((question, index) => addQuestion(`flagship:${item.id}:${index}`, "旗舰审计", `${item.id} · ${item.title}`, question, question.q, array(object(flagship.answers)[item.id])[index]));
  const report = read(storage, "variant-atlas-report-lab-v2");
  for (const scenario of reportScenarios) {
    const draft = { ...emptyReportDraft(), ...object(object(report.drafts)[scenario.id]) } as ReportDraft;
    if (!Object.values(draft).some(text => text.trim())) continue;
    const audit = auditReport(scenario, draft);
    for (const [index, label] of audit.blockers.entries()) result.push({ id: `report:${scenario.id}:${index}`, group: "报告风险", title: scenario.title, prompt: label, rationale: "这是规则式风险提醒，不是医学裁决。请回到报告实验室核对命中文本、完整语境和来源，修订草稿。", signature: reviewSignature([label, draft]) });
  }
  return result;
}
