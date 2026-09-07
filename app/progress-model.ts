import { evidenceDrills, examBanks, supplementalLessons } from "./learning-content";
import { flagshipCases } from "./flagship-cases";
import { reportScenarios, reportSectionIds } from "./report-lab-data";
import { sopWorkflowSteps, wesCaseWorkflowSteps, wgsCaseWorkflowSteps } from "./sop-workflow";
import { wgsCases, wgsModules, wgsExamBanks } from "./wgs-content";

export const coreLessonIds = ["phenotype", "quality", "hgvs", "acmg", "case-level", "report", ...supplementalLessons.map(item => item.id)];
export const coreCaseIds = Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(3, "0"));
export const wgsLessonIds = wgsModules.flatMap(module => module.lessons.map(item => item.id));
export const workflowIds = { core: sopWorkflowSteps.map(item => item.id), wes: wesCaseWorkflowSteps.map(item => item.id), wgs: wgsCaseWorkflowSteps.map(item => item.id) };
export type ProgressRecord = Record<string, unknown>;
type Parser = (value: unknown) => unknown;
const fail = (): never => { throw new Error("学习记录字段格式或取值不正确，请使用原始备份文件。"); };
const object = (value: unknown): ProgressRecord => value === undefined ? {} : value !== null && typeof value === "object" && !Array.isArray(value) ? value as ProgressRecord : fail();
const str: Parser = value => value === undefined ? "" : typeof value === "string" && value.length <= 50000 ? value : fail();
const integer = (max: number, min = 0): Parser => value => value === undefined ? min : typeof value === "number" && Number.isInteger(value) && value >= min && value <= max ? value : fail();
const choice = (values: string[]): Parser => value => value === undefined ? values[0] : typeof value === "string" && values.includes(value) ? value : fail();
const bool: Parser = value => value === undefined ? false : typeof value === "boolean" ? value : fail();
const list = (parser: Parser, max = 500): Parser => value => value === undefined ? [] : Array.isArray(value) && value.length <= max ? value.map(parser) : fail();
const ids = (values?: string[]): Parser => value => [...new Set(list(values ? choice(values) : str)(value) as string[])];
const shape = (fields: Record<string, Parser>): Parser => value => {
  const record = object(value);
  return Object.fromEntries(Object.entries(fields).map(([key, parse]) => [key, parse(record[key])]));
};
const map = (parser: Parser, keys?: string[]): Parser => value => {
  const entries = Object.entries(object(value));
  if (entries.length > 500) fail();
  return Object.fromEntries(entries.map(([key, item]) => {
    if (["__proto__", "constructor", "prototype"].includes(key) || (keys && !keys.includes(key))) fail();
    return [key, parser(item)];
  }));
};
const stringFields = (names: string[]) => Object.fromEntries(names.map(name => [name, str]));
const coreAnswer = shape({ ...stringFields(["inheritance", "classification", "report"]), evidence: ids() });
const quizMap = (sets: Array<{ id: string; questions: Array<{ options: string[] }> }>): Parser => value => {
  return Object.fromEntries(Object.entries(object(value)).map(([id, answers]) => {
    const quiz = sets.find(item => item.id === id);
    if (!quiz || !Array.isArray(answers) || answers.length > quiz.questions.length) fail();
    return [id, (answers as unknown[]).map((answer, index) => answer === null ? null : integer(quiz!.questions[index].options.length - 1)(answer))];
  }));
};
const wgsCaseIds = wgsCases.map(item => item.id);
const flagshipIds = flagshipCases.map(item => item.id);
const drillIds = evidenceDrills.map(item => item.id);
const schemas: Record<string, Parser> = {
  "variant-atlas-demo": shape({
    step: integer(6), answer: coreAnswer, activeCaseId: choice(coreCaseIds), pahStep: integer(6),
    pahAnswer: shape(stringFields(["inheritance", "phase", "variant1Class", "variant2Class", "rationale1", "rationale2", "conclusion", "report"])),
    lessonDone: ids(coreLessonIds), practiceRevealed: ids(coreLessonIds), examResults: map(integer(100), ["L1", "L2", "L3"]),
    examResponses: map(integer(3), Object.values(examBanks).flatMap(bank => bank.map(item => item.id))),
    mistakes: ids(), drillAnswers: map(str, drillIds), drillRationales: map(str, drillIds), drillCompleted: ids(drillIds),
    reportBestScore: integer(100), additionalCaseScores: map(integer(100), coreCaseIds),
    sopChecked: ids(workflowIds.core), wesChecked: ids(workflowIds.wes), wgsChecked: ids(workflowIds.wgs), sopBranch: choice(["sequence", "cnv-loss", "cnv-gain"]),
  }),
  "variant-atlas-wgs-track-v1": shape({
    tab: choice(["overview", "course", "workflow", "cases", "flagship", "exam", "standards"]),
    completed: ids(wgsLessonIds), revealed: ids(wgsLessonIds), workflow: ids(workflowIds.wgs), caseScores: map(integer(3), wgsCaseIds),
    examResponses: map(integer(3), Object.values(wgsExamBanks).flatMap(bank => bank.map(item => item.id))),
    examBest: map(integer(8), ["W1", "W2", "W3"]), lessonId: choice(wgsLessonIds), caseId: choice(wgsCaseIds), caseStep: integer(2),
    caseAnswers: quizMap(wgsCases.map(item => ({ id: item.id, questions: item.gates }))), examLevel: choice(["W1", "W2", "W3"]),
    examAnswers: map(integer(3), Object.values(wgsExamBanks).flatMap(bank => bank.map(item => item.id))), examSubmitted: bool,
  }),
  "variant-atlas-flagship-v1": shape({
    activeId: choice(flagshipIds), revealed: map(integer(6, 1), flagshipIds), answers: quizMap(flagshipCases), scores: map(integer(3), flagshipIds),
    notes: map(list(str, 6), flagshipIds), reviewed: map(ids(["0", "1", "2", "3", "4", "5"]), flagshipIds),
  }),
  "variant-atlas-report-lab-v2": shape({
    scenarioId: choice(reportScenarios.map(item => item.id)), drafts: map(shape(stringFields([...reportSectionIds])), reportScenarios.map(item => item.id)),
    revealed: ids(reportScenarios.flatMap(item => reportSectionIds.map(section => `${item.id}:${section}`))), step: integer(9),
  }),
  "variant-atlas-case003": shape({ step: integer(6), answer: shape({ ...stringFields(["inheritance", "pvs1", "classification", "conflict", "report"]), evidence: ids() }) }),
  "variant-atlas-case004": shape({ step: integer(6), answer: shape({ ...stringFields(["interpretation", "nextTest", "report", "reanalysis"]), differential: ids() }) }),
  ...Object.fromEntries(coreCaseIds.slice(4).map(id => [`variant-atlas-case${id}`, shape({ step: integer(6), answer: shape({ choices: map(str), report: str }) })])),
  "variant-atlas-review-v1": shape({ reviewed: map(str) }),
  "variant-atlas-workshop-v1": shape({ notes: map(map(str), coreLessonIds.concat(wgsLessonIds)) }),
};

export const progressKeys = Object.keys(schemas);
export function normalizeProgress(key: string, value: unknown): ProgressRecord {
  if (!Object.hasOwn(schemas, key)) throw new Error(`无法识别的学习记录：${key}`);
  return schemas[key](value) as ProgressRecord;
}

/** A sparse array or JSON null is unanswered, not a completed attempt. */
export function completedQuizScore(questions: ReadonlyArray<{ answer: number; options: string[] }>, answers: ReadonlyArray<number | null | undefined>): number | null {
  if (!questions.every((question, index) => Number.isInteger(answers[index]) && Number(answers[index]) >= 0 && Number(answers[index]) < question.options.length)) return null;
  return questions.filter((question, index) => question.answer === answers[index]).length;
}
