import { reportSections, reportSectionIds, type ReportDraft, type ReportExpectation, type ReportScenario } from "./report-lab-data";

type AuditDimension = { label: string; score: number; max: number; note: string };

const dangerousPatterns = [
  { label: "把阴性写成排除遗传病", pattern: /(?<!不能)(?<!无法)(?<!不应)排除(?:了)?遗传病/i },
  { label: "把VUS用于确诊或升级为致病", pattern: /VUS.{0,8}(?:确诊|诊断成立|致病)/i },
  { label: "默认两条杂合变异位于反式", pattern: /(?:两条|两个).{0,8}杂合.{0,10}(?:即|就是|因此).{0,6}反式/i },
  { label: "把父母未检出自动等同新发", pattern: /父母未检出.{0,10}(?:即|就是|因此).{0,6}新发/i },
  { label: "作出确定外显率或严重度预测", pattern: /(?:必然|一定|100%).{0,10}(?:发病|外显|严重)/i },
  { label: "跳过必要验证或复核", pattern: /无需.{0,10}(?:验证|复核|随访)/i },
  { label: "直接替代治疗或生育决策", pattern: /(?:直接|仅凭).{0,10}(?:治疗|生育).{0,8}(?:决定|决策|建议)/i },
];

export function unsafeReportExpressions(text: string): string[] {
  const clauses = text.split(/[。！？；;，,\n]|但是|然而/);
  return dangerousPatterns.filter(item => clauses.some(clause => {
    const match = item.pattern.exec(clause);
    if (!match) return false;
    const context = clause.slice(Math.max(0, match.index - 8), match.index + match[0].length);
    return !/(?:不能|不应|不得|不可|不宜|不代表|不等于|不足以|无法|未能|不一定|并非|不是)/.test(context);
  })).map(item => item.label);
}

function expectationMet(text: string, expectation: ReportExpectation) {
  const normalized = text.toLowerCase();
  const matches = expectation.terms.map((term) => normalized.includes(term.toLowerCase()));
  return expectation.match === "all" ? matches.every(Boolean) : matches.some(Boolean);
}

/** Teaching completeness checks only; each channel has different reference requirements. */
export type ReportCheck = { id: string; label: string; met: boolean; observations: string[] };
export function reportTraceDetails(scenario: ReportScenario, text: string): ReportCheck[] {
  const mt = /线粒体|mtDNA/i.test(scenario.category);
  const region = /CNV|UPD|倍性/.test(scenario.category);
  const str = scenario.category === "STR";
  const negative = scenario.id.endsWith("-negative");
  const rules: Array<{ label: string; patterns: RegExp[] }> = [
    { label: mt ? "线粒体参考序列（rCRS / NC_012920.1）" : "核基因组参考组装", patterns: [mt ? /NC_012920\.1|rCRS/i : /GRCh3[78]/i] },
    { label: mt ? "线粒体位点表示" : region ? "染色体标识" : str ? "重复扩增基因" : negative ? "未检出及不适用说明" : "含版本的转录本编号", patterns: [mt ? /m\.\d+/i : region ? /chr(?:[1-9]|1[0-9]|2[0-2]|X|Y)\b|染色体/i : str ? /DMPK/i : negative ? /未检出|未发现|不适用/ : /(?:NM_|NR_|ENST)\d+\.\d+/i] },
    { label: region ? "区间或拷贝状态记录" : str ? "CTG与可支持的重复范围" : negative ? "检测范围及限制" : "变异表示线索", patterns: region ? [/坐标|区间|断点|拷贝数|倍性/] : str ? [/CTG/i, /范围|下界|重复数/] : negative ? [/范围|覆盖|局限|限制/] : [/(?:c\.|m\.|g\.)\d+|exon|外显子/i] },
    { label: "规范或证据代码线索", patterns: [/ACMG|ClinGen|VCEP|PVS1|PS\d|PM\d|PP\d|BA1|BS\d|BP\d/i] },
    { label: "版本或检索日期记录线索", patterns: [/版本|检索日期|证据快照|报告版本/] },
  ];
  return rules.map((rule, index) => ({ id: "trace-" + index, label: rule.label, met: rule.patterns.every(pattern => pattern.test(text)), observations: rule.patterns.flatMap(pattern => { const match = text.match(pattern); return match ? [match[0]] : []; }) }));
}
export function reportTraceChecks(scenario: ReportScenario, text: string): boolean[] { return reportTraceDetails(scenario, text).map(item => item.met); }

export function reportExpectationDetails(expectation: ReportExpectation, draft: ReportDraft, id: string): ReportCheck {
  const observations = expectation.terms.flatMap(term => reportSections.flatMap(section => {
    const text = draft[section.id];
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    return index < 0 ? [] : [section.shortTitle + "：“" + text.slice(Math.max(0, index - 16), index + term.length + 32) + "”"];
  }));
  return { id, label: expectation.label + (expectation.match === "all" ? "（所有要点）" : "（任一要点）"), met: expectationMet(Object.values(draft).join("\n"), expectation), observations };
}

export function auditReport(scenario: ReportScenario, draft: ReportDraft) {
  const allText = reportSectionIds.map((id) => draft[id]).join("\n");
  const completed = reportSections.filter((section) => draft[section.id].trim().length >= section.minChars);
  const completion = Math.round((completed.length / reportSections.length) * 25);

  const metExpectations = scenario.expectations.filter((item) => expectationMet(allText, item));
  const consistency = Math.round((metExpectations.length / scenario.expectations.length) * 25);

  const blockers = unsafeReportExpressions(allText);
  const metSafety = scenario.safetyTerms.filter((item) => expectationMet(allText, item));
  const safetyBase = Math.max(0, 15 - blockers.length * 5);
  const safety = safetyBase + Math.round((metSafety.length / Math.max(1, scenario.safetyTerms.length)) * 10);

  const traceChecks = reportTraceChecks(scenario, allText);
  const traceability = traceChecks.filter(Boolean).length * 3;

  const actionText = `${draft.recommendations}\n${draft.limitations}\n${draft.review}`;
  const actionRules: Array<[string, RegExp]> = [
    ["遗传咨询", /遗传咨询/], ["验证、复核或定相", /验证|复核|定相|亲缘/],
    ["补充检测路径", /补充检测|WGS|RNA|CNV|缺失|重复|高深度/i],
    ["重分析或随访触发", /重分析|随访|新表型|触发/], ["临床评估", /专科|结合临床|临床评估/],
  ];
  const actionDetails = actionRules.map(([label, pattern], index) => ({ id: "action-" + index, label: "后续行动：" + label, met: pattern.test(actionText), observations: actionText.match(pattern)?.slice(0, 1) ?? [] }));
  const actionChecks = actionDetails.map(item => item.met);
  const actionability = actionChecks.filter(Boolean).length * 2;

  const dimensions: AuditDimension[] = [
    { label: "章节完整性", score: completion, max: 25, note: `${completed.length}/10节达到最低完整度` },
    { label: "病例逻辑一致性", score: consistency, max: 25, note: `${metExpectations.length}/${scenario.expectations.length}项情境要点匹配` },
    { label: "临床安全边界", score: safety, max: 25, note: blockers.length ? `${blockers.length}项高风险表达需修正` : "未检出预设高风险表达" },
    { label: "可追溯性", score: traceability, max: 15, note: `${traceChecks.filter(Boolean).length}/5项记录要素齐全` },
    { label: "后续行动", score: actionability, max: 10, note: `${actionChecks.filter(Boolean).length}/5类行动已覆盖` },
  ];

  return {
    dimensions,
    checks: [
      ...reportSections.map(section => ({ id: "section-" + section.id, label: section.title + "最低完整度", met: draft[section.id].trim().length >= section.minChars, observations: [draft[section.id].trim().length + "字 / 训练最低" + section.minChars + "字（字数不代表正确）"] })),
      ...scenario.expectations.map((item, index) => reportExpectationDetails(item, draft, "expectation-" + index)),
      ...scenario.safetyTerms.map((item, index) => reportExpectationDetails(item, draft, "safety-" + index)),
      ...reportTraceDetails(scenario, allText),
      ...actionDetails,
    ],
    // A high keyword score must never override an explicit safety warning.
    total: Math.min(blockers.length ? 79 : 100, dimensions.reduce((sum, item) => sum + item.score, 0)),
    blockers,
    unmetExpectations: scenario.expectations.filter((item) => !expectationMet(allText, item)),
    metSafety,
    completedSectionIds: new Set(completed.map((section) => section.id)),
  };
}
