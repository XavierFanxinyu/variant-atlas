"use client";

import { useEffect, useState } from "react";
import {
  emptyReportDraft,
  reportScenarios,
  reportSectionIds,
  reportSections,
  type ReportDraft,
  type ReportExpectation,
  type ReportMode,
  type ReportPlatform,
  type ReportScenario,
  type ReportSectionId,
} from "./report-lab-data";

type StoredDrafts = Record<string, Partial<ReportDraft>>;
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

function expectationMet(text: string, expectation: ReportExpectation) {
  const normalized = text.toLowerCase();
  const matches = expectation.terms.map((term) => normalized.includes(term.toLowerCase()));
  return expectation.match === "all" ? matches.every(Boolean) : matches.some(Boolean);
}

export function auditReport(scenario: ReportScenario, draft: ReportDraft) {
  const allText = reportSectionIds.map((id) => draft[id]).join("\n");
  const completed = reportSections.filter((section) => draft[section.id].trim().length >= section.minChars);
  const completion = Math.round((completed.length / reportSections.length) * 25);

  const metExpectations = scenario.expectations.filter((item) => expectationMet(allText, item));
  const consistency = Math.round((metExpectations.length / scenario.expectations.length) * 25);

  const blockers = dangerousPatterns.filter((item) => item.pattern.test(allText)).map((item) => item.label);
  const metSafety = scenario.safetyTerms.filter((item) => expectationMet(allText, item));
  const safetyBase = Math.max(0, 15 - blockers.length * 5);
  const safety = safetyBase + Math.round((metSafety.length / Math.max(1, scenario.safetyTerms.length)) * 10);

  const traceChecks = [
    /GRCh38/i.test(allText),
    /(?:NM_|NR_|ENST)\d+(?:\.\d+)?/i.test(allText),
    /(?:c\.|m\.|g\.|exon|外显子)/i.test(allText),
    /(?:ACMG|ClinGen|VCEP|PVS1|PS\d|PM\d|PP\d|BA1|BS\d|BP\d)/i.test(allText),
    /(?:版本|检索日期|证据快照|报告版本)/i.test(allText),
  ];
  const traceability = traceChecks.filter(Boolean).length * 3;

  const actionText = `${draft.recommendations}\n${draft.limitations}\n${draft.review}`;
  const actionChecks = [
    /遗传咨询/.test(actionText),
    /(?:验证|复核|定相|亲缘)/.test(actionText),
    /(?:补充检测|WGS|RNA|CNV|缺失|重复|高深度)/i.test(actionText),
    /(?:重分析|随访|新表型|触发)/.test(actionText),
    /(?:专科|结合临床|临床评估)/.test(actionText),
  ];
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
    total: dimensions.reduce((sum, item) => sum + item.score, 0),
    blockers,
    unmetExpectations: scenario.expectations.filter((item) => !expectationMet(allText, item)),
    metSafety,
    completedSectionIds: new Set(completed.map((section) => section.id)),
  };
}

export default function ReportLab({ bestScore, onScore }: { bestScore: number; onScore: (score: number) => void }) {
  const [platform, setPlatform] = useState<ReportPlatform>("WES");
  const [mode, setMode] = useState<ReportMode>("family");
  const [scenarioId, setScenarioId] = useState("family-denovo");
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState<StoredDrafts>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("variant-atlas-report-lab-v2");
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      const savedScenario = reportScenarios.find((item) => item.id === state.scenarioId);
      /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration of local learning drafts */
      if (savedScenario) {
        setScenarioId(savedScenario.id);
        setMode(savedScenario.mode);
        setPlatform(savedScenario.platform ?? "WES");
      }
      if (state.drafts && typeof state.drafts === "object") setDrafts(state.drafts);
      if (Array.isArray(state.revealed)) setRevealed(state.revealed.filter((item: unknown) => typeof item === "string"));
      setStep(Math.max(0, Math.min(reportSections.length - 1, Number(state.step) || 0)));
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch { /* ignore damaged local practice data */ }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("variant-atlas-report-lab-v2", JSON.stringify({ scenarioId, drafts, revealed, step }));
  }, [scenarioId, drafts, revealed, step]);

  const scenarios = reportScenarios.filter((item) => item.mode === mode && (item.platform ?? "WES") === platform);
  const scenario = reportScenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const draft = { ...emptyReportDraft(), ...(drafts[scenario.id] ?? {}) };
  const section = reportSections[step];
  const audit = auditReport(scenario, draft);
  const revealKey = `${scenario.id}:${section.id}`;
  const isRevealed = revealed.includes(revealKey);

  function changeMode(nextMode: ReportMode) {
    const first = reportScenarios.find((item) => item.mode === nextMode && (item.platform ?? "WES") === platform);
    if (!first) return;
    setMode(nextMode);
    setScenarioId(first.id);
    setStep(0);
    setSubmitted(false);
  }

  function changePlatform(nextPlatform: ReportPlatform) {
    const first = reportScenarios.find((item) => (item.platform ?? "WES") === nextPlatform && item.mode === mode)
      ?? reportScenarios.find((item) => (item.platform ?? "WES") === nextPlatform);
    if (!first) return;
    setPlatform(nextPlatform);
    setMode(first.mode);
    setScenarioId(first.id);
    setStep(0);
    setSubmitted(false);
  }

  function changeScenario(nextId: string) {
    const next = reportScenarios.find((item) => item.id === nextId);
    if (!next) return;
    setScenarioId(next.id);
    setMode(next.mode);
    setPlatform(next.platform ?? "WES");
    setStep(0);
    setSubmitted(false);
  }

  function updateSection(id: ReportSectionId, value: string) {
    setDrafts((current) => ({ ...current, [scenario.id]: { ...(current[scenario.id] ?? {}), [id]: value } }));
    setSubmitted(false);
  }

  function submitAudit() {
    setSubmitted(true);
    onScore(audit.total);
  }

  return (
    <section className="page-section report-studio-page">
      <div className="report-studio-hero">
        <div>
          <span className="eyebrow">STRUCTURED WES / WGS REPORT STUDIO</span>
          <h1>从多通道病例底稿到可复核报告</h1>
          <p>按照WES/WGS报告的十个责任区逐步撰写。单人路径训练来源、相位与残余风险，家系路径训练成员基因型、复杂事件、来源、相位和亲缘确认。</p>
        </div>
        <div className="report-studio-metrics" aria-label="报告实验室概况">
          <span><b>2</b>检测平台</span><span><b>10</b>报告责任区</span><span><b>{reportScenarios.length}</b>高频情境</span><span><b>5</b>评分维度</span>
        </div>
      </div>

      <div className="report-boundary-note"><b>隐私与用途边界</b><p>仅使用站内教学情境，不要粘贴真实患者姓名、编号或可识别信息。评分用于训练，不代表临床签发资格，也不判断输入事实真伪。</p></div>

      <div className="report-platform-switch" aria-label="选择检测平台">
        <button className={platform === "WES" ? "active" : ""} onClick={() => changePlatform("WES")}><span>WES</span><b>外显子组报告</b><small>序列 · 外显子CNV · 单人/家系边界</small></button>
        <button className={platform === "WGS" ? "active" : ""} onClick={() => changePlatform("WGS")}><span>WGS</span><b>全基因组报告</b><small>CNV · SV · ROH/UPD · STR · mtDNA</small></button>
      </div>

      <div className="report-path-switch" aria-label="选择报告路径">
        <button className={mode === "family" ? "active" : ""} onClick={() => changeMode("family")} aria-pressed={mode === "family"}>
          <span>FAMILY</span><b>家系报告</b><small>成员关系 · 来源 · 相位 · 共分离 · 亲缘</small>
        </button>
        <button className={mode === "singleton" ? "active" : ""} onClick={() => changeMode("singleton")} aria-pressed={mode === "singleton"}>
          <span>SINGLETON</span><b>单人报告</b><small>来源未知 · 相位未定 · 残余风险 · 升级路径</small>
        </button>
      </div>

      <div className="report-scenario-bar">
        <label htmlFor="report-scenario"><span>训练情境</span><select id="report-scenario" value={scenario.id} onChange={(event) => changeScenario(event.target.value)}>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.category}｜{item.title}</option>)}</select></label>
        <div><span>结论边界</span><p>{scenario.expectedBoundary}</p></div>
      </div>

      <nav className="report-stepper" aria-label="报告章节">
        {reportSections.map((item, index) => (
          <button key={item.id} className={`${index === step ? "active" : ""} ${audit.completedSectionIds.has(item.id) ? "complete" : ""}`} onClick={() => setStep(index)} aria-current={index === step ? "step" : undefined}>
            <span>{audit.completedSectionIds.has(item.id) ? "✓" : item.no}</span><b>{item.shortTitle}</b>
          </button>
        ))}
      </nav>

      <div className="report-studio-grid">
        <article className="report-editor-card">
          <header><div><span>SECTION {section.no} / 10</span><h2>{section.title}</h2><p>{section.purpose}</p></div><i>{draft[section.id].trim().length}/{section.minChars}+</i></header>
          <div className="report-writing-brief"><b>本节任务</b><p>{section.prompt}</p><ul>{section.checks.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <label className="report-textarea-label"><span>你的报告内容</span><textarea value={draft[section.id]} onChange={(event) => updateSection(section.id, event.target.value)} placeholder={section.placeholder} aria-label={`${section.title}内容`} /></label>
          <div className="report-reference-toggle">
            <button onClick={() => setRevealed((current) => current.includes(revealKey) ? current.filter((item) => item !== revealKey) : [...current, revealKey])}>{isRevealed ? "收起检查要点" : "写完后揭示检查要点"}</button>
            {isRevealed && <div><b>复核时应能回答</b>{section.reference.map((item) => <p key={item}>— {item}</p>)}</div>}
          </div>
          <div className="report-editor-actions">
            <button className="secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>上一节</button>
            <span>当前草稿已在本机保存</span>
            {step < reportSections.length - 1 ? <button className="primary" onClick={() => setStep((current) => Math.min(reportSections.length - 1, current + 1))}>保存并继续 →</button> : <button className="primary" onClick={submitAudit}>提交完整审计</button>}
          </div>

          <details className="assembled-report">
            <summary>预览已组装报告 <span>{reportSectionIds.filter((id) => draft[id].trim()).length}/10节</span></summary>
            <div>{reportSections.map((item) => draft[item.id].trim() ? <section key={item.id}><h3>{item.title}</h3><p>{draft[item.id]}</p></section> : null)}</div>
          </details>
        </article>

        <aside className="report-audit-panel">
          <div className="report-case-file"><span>{scenario.category}</span><h2>{scenario.title}</h2><p>{scenario.brief}</p><ul>{scenario.caseFile.map((item) => <li key={item}>{item}</li>)}</ul><a href={scenario.source.url} target="_blank" rel="noreferrer">{scenario.source.label} ↗</a></div>
          <div className="report-live-score"><header><span>{submitted ? "提交得分" : "草稿就绪度"}</span><b>{audit.total}</b><small>/100 · 历史最高 {bestScore}</small></header>{audit.dimensions.map((item) => <div key={item.label}><i style={{ width: `${(item.score / item.max) * 100}%` }} /><p><b>{item.label}</b><span>{item.score}/{item.max}</span><small>{item.note}</small></p></div>)}</div>
          {(submitted || audit.blockers.length > 0) && <div className={`report-risk-panel ${audit.blockers.length ? "danger" : "safe"}`}><b>{audit.blockers.length ? "必须修正的高风险表达" : "安全边界检查通过"}</b>{audit.blockers.map((item) => <p key={item}>! {item}</p>)}{!audit.blockers.length && <p>未命中预设越界措辞；仍需人工核查医学事实和完整语境。</p>}</div>}
          {submitted && audit.unmetExpectations.length > 0 && <div className="report-missing-panel"><b>优先补足</b>{audit.unmetExpectations.slice(0, 5).map((item) => <p key={item.label}>○ {item.label}：{item.terms.join(" / ")}</p>)}</div>}
        </aside>
      </div>

      <div className="report-source-strip"><div><span>方法依据</span><h2>报告模板负责结构，当前指南负责判断</h2></div><p>本站保留生产报告的责任区和审核逻辑，不复制企业变量、内部阈值或固定声明。变异分类采用当前ClinGen分类指导；CNV、NGS和二级发现分别路由到对应规范。</p><div><a href="https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" target="_blank" rel="noreferrer">ClinGen分类指导</a><a href="https://pubmed.ncbi.nlm.nih.gov/33927380/" target="_blank" rel="noreferrer">ACMG NGS标准</a><a href="https://pubmed.ncbi.nlm.nih.gov/31690835/" target="_blank" rel="noreferrer">ACMG/ClinGen CNV</a><a href="https://search.clinicalgenome.org/kb/genes/acmgsf" target="_blank" rel="noreferrer">ACMG二级发现</a></div></div>
    </section>
  );
}
