import { coreCaseIds, normalizeProgress, progressKeys, workflowIds } from "./progress-model";
import { evidenceDrills } from "./learning-content";

export const LEARNING_RECORD_SCHEMA = 4;
export const LEARNING_RECORD_EVENT = "variant-atlas-progress-updated";
export const LEARNING_REPLACED_EVENT = "variant-atlas-progress-replaced";
export const STORAGE_ERROR_EVENT = "variant-atlas-storage-error";
export const GENERATION_KEY = "variant-atlas-storage-generation";
export const MAX_ARCHIVE_BYTES = 5 * 1024 * 1024;
const metadataKey = "variant-atlas-progress-v3";
export type LearningArchive = { product: "Variant Atlas"; schemaVersion: number; exportedAt: string; records: Record<string, unknown> };
export type LearningSummary = {
  coreLessons: number; wgsLessons: number; coreCases: number; coreAdvancedCases: number;
  wgsCases: number; coreExamPasses: number; wgsExamPasses: number; workflowGates: number;
  reportBestScore: number; reportDrafts: number; flagshipCases: number; drillCorrect: number;
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const array = (value: unknown): string[] => Array.isArray(value) ? value : [];
const number = (value: unknown): number => typeof value === "number" && Number.isFinite(value) ? value : 0;
const event = (name: string) => { if (typeof window !== "undefined") window.dispatchEvent(new Event(name)); };
export function reportStorageError(message: string) {
  if (typeof window !== "undefined") queueMicrotask(() => window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: message })));
}
export function variantAtlasKeys(storage: Storage): string[] {
  return Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter((key): key is string => !!key?.startsWith("variant-atlas-")).sort();
}
export function exportLearningArchive(storage: Storage): LearningArchive {
  const records = Object.fromEntries(progressKeys.filter(key => storage.getItem(key) !== null).map(key => [key, JSON.parse(storage.getItem(key)!)]));
  return validateLearningArchive({ product: "Variant Atlas", schemaVersion: LEARNING_RECORD_SCHEMA, exportedAt: new Date().toISOString(), records });
}
export function ensureLearningSchema(storage: Storage): void {
  storage.setItem(metadataKey, JSON.stringify({ schemaVersion: LEARNING_RECORD_SCHEMA }));
}
export function validateLearningArchive(value: unknown): LearningArchive {
  const archive = object(value);
  if (archive.product !== "Variant Atlas" || !archive.records || Array.isArray(archive.records) || typeof archive.records !== "object") throw new Error("这不是有效的 Variant Atlas 学习档案。");
  if (!Number.isInteger(archive.schemaVersion) || number(archive.schemaVersion) < 1 || number(archive.schemaVersion) > LEARNING_RECORD_SCHEMA) throw new Error("不支持此档案版本。请使用当前或较早版本导出的档案。");
  if (new Blob([JSON.stringify(value)]).size > MAX_ARCHIVE_BYTES) throw new Error("档案超过5MB限制。");
  const records: Record<string, unknown> = {};
  for (const [key, record] of Object.entries(object(archive.records))) {
    if (key === metadataKey) continue;
    records[key] = normalizeProgress(key, record);
  }
  if (!Object.keys(records).length) throw new Error("档案没有可恢复的学习记录。");
  return { product: "Variant Atlas", schemaVersion: number(archive.schemaVersion), exportedAt: typeof archive.exportedAt === "string" ? archive.exportedAt : "未记录", records };
}

/** Roll back a failed import; invalidate all old mounted drafts before replacing data. */
function replaceRecords(storage: Storage, records: Record<string, unknown>) {
  const before = new Map(variantAtlasKeys(storage).map(key => [key, storage.getItem(key)!]));
  const touched = new Set([...before.keys(), ...Object.keys(records), GENERATION_KEY, metadataKey]);
  try {
    storage.setItem(GENERATION_KEY, Date.now() + "-" + Math.random());
    for (const key of before.keys()) if (key !== GENERATION_KEY) storage.removeItem(key);
    for (const [key, record] of Object.entries(records)) storage.setItem(key, JSON.stringify(record));
    ensureLearningSchema(storage);
  } catch {
    try {
      for (const key of touched) storage.removeItem(key);
      for (const [key, value] of before) storage.setItem(key, value);
    } catch { throw new Error("写入失败且浏览器阻止恢复。请保留导出的备份文件，恢复存储权限后重新导入。"); }
    throw new Error("写入失败，已恢复原有记录。请检查浏览器存储权限或可用空间。");
  }
  event(LEARNING_REPLACED_EVENT);
  event(LEARNING_RECORD_EVENT);
}
export function importLearningArchive(storage: Storage, value: unknown): LearningArchive {
  const archive = validateLearningArchive(value);
  replaceRecords(storage, archive.records);
  return archive;
}
export function resetLearningArchive(storage: Storage): void { replaceRecords(storage, {}); }
export function beginProgressSession(storage: Storage, key: string) {
  return { key, generation: storage.getItem(GENERATION_KEY), previous: storage.getItem(key) };
}
export function persistProgress(storage: Storage, session: ReturnType<typeof beginProgressSession>, value: object): boolean {
  const serialized = JSON.stringify(value);
  if (serialized === session.previous) return false;
  if (storage.getItem(GENERATION_KEY) !== session.generation || storage.getItem(session.key) !== session.previous) throw new Error("此记录已在其他窗口更改。");
  storage.setItem(session.key, serialized);
  session.previous = serialized;
  return true;
}
function read(storage: Storage, key: string) {
  try { const raw = storage.getItem(key); return normalizeProgress(key, raw === null ? undefined : JSON.parse(raw)); }
  catch { return {}; }
}
export function summarizeLearning(storage: Storage): LearningSummary {
  const core = read(storage, "variant-atlas-demo"), wgs = read(storage, "variant-atlas-wgs-track-v1");
  const report = read(storage, "variant-atlas-report-lab-v2"), flagship = read(storage, "variant-atlas-flagship-v1");
  const scores = object(core.additionalCaseScores), exams = object(core.examResults), wgsExams = object(wgs.examBest);
  const wgsWorkflow = new Set([...array(core.wgsChecked), ...array(wgs.workflow)]);
  return {
    coreLessons: array(core.lessonDone).length, wgsLessons: array(wgs.completed).length,
    coreCases: coreCaseIds.filter(id => number(scores[id]) >= 70).length,
    coreAdvancedCases: coreCaseIds.filter(id => number(scores[id]) >= 85).length,
    wgsCases: Object.values(object(wgs.caseScores)).filter(score => number(score) >= 2).length,
    coreExamPasses: ["L1", "L2", "L3"].filter(level => number(exams[level]) >= 80).length,
    wgsExamPasses: ["W1", "W2", "W3"].filter(level => number(wgsExams[level]) >= 7).length,
    workflowGates: array(core.sopChecked).length + array(core.wesChecked).length + workflowIds.wgs.filter(id => wgsWorkflow.has(id)).length,
    reportBestScore: number(core.reportBestScore),
    reportDrafts: Object.values(object(report.drafts)).filter(draft => Object.values(object(draft)).some(text => typeof text === "string" && text.trim())).length,
    flagshipCases: Object.values(object(flagship.scores)).filter(score => number(score) >= 2).length,
    drillCorrect: evidenceDrills.filter(drill => array(core.drillCompleted).includes(drill.id) && drill.expected.includes(String(object(core.drillAnswers)[drill.id] ?? ""))).length,
  };
}
export function learningCertification(summary: LearningSummary) {
  const wgs = summary.wgsLessons === 28 && summary.wgsCases >= 12 && summary.wgsExamPasses === 3;
  return { wgs, full: wgs && summary.coreLessons === 24 && summary.coreAdvancedCases === 8 && summary.coreExamPasses === 3 && summary.drillCorrect >= 5 && summary.reportBestScore >= 80 };
}
export function notifyLearningProgress(): void { event(LEARNING_RECORD_EVENT); }
