"use client";

import { useState } from "react";
import { auditReport } from "./report-audit";
import { useProgressPersistence } from "./use-progress-persistence";
import {
  emptyReportDraft,
  reportScenarios,
  reportSectionIds,
  reportSections,
  type ReportDraft,
  type ReportMode,
  type ReportPlatform,
  type ReportSectionId,
} from "./report-lab-data";

type StoredDrafts = Record<string, Partial<ReportDraft>>;
export default function ReportLab({ bestScore, onScore }: { bestScore: number; onScore: (score: number) => void }) {
  const [platform, setPlatform] = useState<ReportPlatform>("WES");
  const [mode, setMode] = useState<ReportMode>("family");
  const [scenarioId, setScenarioId] = useState("family-denovo");
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState<StoredDrafts>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useProgressPersistence("variant-atlas-report-lab-v2", { scenarioId, drafts, revealed, step }, state => {
    const savedScenario = reportScenarios.find(item => item.id === state.scenarioId);
    if (savedScenario) { setScenarioId(savedScenario.id); setMode(savedScenario.mode); setPlatform(savedScenario.platform ?? "WES"); }
    setDrafts(state.drafts); setRevealed(state.revealed); setStep(state.step);
  });

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

      <div className="report-boundary-note"><b>隐私与用途边界</b><p>仅使用站内教学情境，不要粘贴真实患者姓名、编号或可识别信息。评分是本地规则与关键词辅助检查，不判断输入事实真伪或医学结论是否正确；未提示风险不等于安全。检出预设高风险表达时，得分上限为79，须修订后再提交。</p></div>

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
            <span>草稿保存在本机；保存失败时页面会提示</span>
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
          {(submitted || audit.blockers.length > 0) && <div className={`report-risk-panel ${audit.blockers.length ? "danger" : "safe"}`}><b>{audit.blockers.length ? "必须修正的高风险表达" : "未检出预设高风险表达"}</b>{audit.blockers.map((item) => <p key={item}>! {item}</p>)}{!audit.blockers.length && <p>未命中预设越界措辞；仍需人工核查医学事实和完整语境。</p>}</div>}
          <details className="report-check-details"><summary>查看逐项评分依据</summary><p>以下仅显示文本规则命中，不验证医学事实、坐标或规范版本是否正确。</p>{audit.checks.map(check => <section key={check.id}><h3>{check.met ? "✓ 文本满足" : "○ 待核对"} · {check.label}</h3>{check.observations.length ? check.observations.map((text, index) => <p key={index}>{text}</p>) : <p>尚未识别到对应信息，请核对正文和本情境要求。</p>}</section>)}</details>
          {submitted && audit.unmetExpectations.length > 0 && <div className="report-missing-panel"><b>优先补足</b>{audit.unmetExpectations.slice(0, 5).map((item) => <p key={item.label}>○ {item.label}：{item.terms.join(" / ")}</p>)}</div>}
        </aside>
      </div>

      <div className="report-source-strip"><div><span>方法依据</span><h2>报告模板负责结构，当前指南负责判断</h2></div><p>本站保留生产报告的责任区和审核逻辑，不复制企业变量、内部阈值或固定声明。变异分类采用当前ClinGen分类指导；CNV、NGS和二级发现分别路由到对应规范。</p><div><a href="https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" target="_blank" rel="noreferrer">ClinGen分类指导</a><a href="https://pubmed.ncbi.nlm.nih.gov/33927380/" target="_blank" rel="noreferrer">ACMG NGS标准</a><a href="https://pubmed.ncbi.nlm.nih.gov/31690835/" target="_blank" rel="noreferrer">ACMG/ClinGen CNV</a><a href="https://search.clinicalgenome.org/kb/genes/acmgsf" target="_blank" rel="noreferrer">ACMG二级发现</a></div></div>
    </section>
  );
}
