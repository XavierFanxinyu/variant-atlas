export const LEARNING_RECORD_SCHEMA = 3;
export const LEARNING_RECORD_EVENT = "variant-atlas-progress-updated";

export type LearningArchive = {
  product: "Variant Atlas";
  schemaVersion: number;
  exportedAt: string;
  records: Record<string, unknown>;
};

export type LearningSummary = {
  coreLessons: number;
  wgsLessons: number;
  coreCases: number;
  wgsCases: number;
  coreExamPasses: number;
  wgsExamPasses: number;
  workflowGates: number;
  reportBestScore: number;
  reportDrafts: number;
};

function parsed(value: string | null): unknown {
  if (!value) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function array(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }

function number(value: unknown): number { return Number.isFinite(Number(value)) ? Number(value) : 0; }

export function variantAtlasKeys(storage: Storage): string[] {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith("variant-atlas-")) keys.push(key);
  }
  return keys.sort();
}

export function exportLearningArchive(storage: Storage): LearningArchive {
  const records = Object.fromEntries(variantAtlasKeys(storage).map((key) => [key, parsed(storage.getItem(key))]));
  return { product: "Variant Atlas", schemaVersion: LEARNING_RECORD_SCHEMA, exportedAt: new Date().toISOString(), records };
}

export function ensureLearningSchema(storage: Storage): void {
  const current = object(parsed(storage.getItem("variant-atlas-progress-v3")));
  if (number(current.schemaVersion) === LEARNING_RECORD_SCHEMA) return;
  storage.setItem("variant-atlas-progress-v3", JSON.stringify({
    schemaVersion: LEARNING_RECORD_SCHEMA,
    migratedAt: new Date().toISOString(),
    preservedKeys: variantAtlasKeys(storage).filter((key) => key !== "variant-atlas-progress-v3"),
  }));
}

export function validateLearningArchive(value: unknown): LearningArchive {
  const archive = object(value);
  if (archive.product !== "Variant Atlas" || !archive.records || typeof archive.records !== "object" || Array.isArray(archive.records)) {
    throw new Error("这不是有效的 Variant Atlas 学习档案。");
  }
  const records = object(archive.records);
  if (Object.keys(records).some((key) => !key.startsWith("variant-atlas-"))) throw new Error("档案包含无法识别的记录键。");
  return {
    product: "Variant Atlas",
    schemaVersion: number(archive.schemaVersion) || 1,
    exportedAt: typeof archive.exportedAt === "string" ? archive.exportedAt : new Date().toISOString(),
    records,
  };
}

export function importLearningArchive(storage: Storage, value: unknown): LearningArchive {
  const archive = validateLearningArchive(value);
  Object.entries(archive.records).forEach(([key, record]) => storage.setItem(key, JSON.stringify(record)));
  storage.setItem("variant-atlas-progress-v3", JSON.stringify({ schemaVersion: LEARNING_RECORD_SCHEMA, importedAt: new Date().toISOString(), sourceSchema: archive.schemaVersion }));
  window.dispatchEvent(new Event(LEARNING_RECORD_EVENT));
  return archive;
}

export function resetLearningArchive(storage: Storage): void {
  variantAtlasKeys(storage).forEach((key) => storage.removeItem(key));
  window.dispatchEvent(new Event(LEARNING_RECORD_EVENT));
}

export function summarizeLearning(storage: Storage): LearningSummary {
  const core = object(parsed(storage.getItem("variant-atlas-demo")));
  const wgs = object(parsed(storage.getItem("variant-atlas-wgs-track-v1")));
  const report = object(parsed(storage.getItem("variant-atlas-report-lab-v2")));
  const coreScores = object(core.additionalCaseScores);
  const wgsScores = object(wgs.caseScores);
  const coreExams = object(core.examResults);
  const wgsExams = object(wgs.examBest);
  return {
    coreLessons: array(core.lessonDone).length,
    wgsLessons: array(wgs.completed).length,
    coreCases: Object.values(coreScores).filter((score) => number(score) >= 70).length,
    wgsCases: Object.values(wgsScores).filter((score) => number(score) >= 2).length,
    coreExamPasses: ["L1", "L2", "L3"].filter((level) => number(coreExams[level]) >= 80).length,
    wgsExamPasses: ["W1", "W2", "W3"].filter((level) => number(wgsExams[level]) >= 7).length,
    workflowGates: array(core.sopChecked).length + array(core.wesChecked).length + array(core.wgsChecked).length + array(wgs.workflow).length,
    reportBestScore: number(core.reportBestScore),
    reportDrafts: Object.keys(object(report.drafts)).filter((key) => Object.values(object(object(report.drafts)[key])).some((text) => String(text).trim().length > 0)).length,
  };
}

export function notifyLearningProgress(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(LEARNING_RECORD_EVENT));
}
