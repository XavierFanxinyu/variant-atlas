"use client";
import { useState } from "react";
import { automationExercises, automationWorkflow } from "./automation-review-data";
import { evidenceSources, strengthReviewedAt } from "./evidence-strength-data";
import { useProgressPersistence } from "./use-progress-persistence";

export default function AutomationReview({ onEvidence, onReview }: { onEvidence: (code: string) => void; onReview: () => void }) {
  const [activeId, setActiveId] = useState(automationExercises[0].id);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, number>>({});
  useProgressPersistence("variant-atlas-automation-v1", { activeId, revealed, answers, notes, submitted }, saved => { setActiveId(saved.activeId); setRevealed(saved.revealed); setAnswers(saved.answers); setNotes(saved.notes); setSubmitted(saved.submitted); });
  const item = automationExercises.find(value => value.id === activeId)!;
  const opened = revealed.includes(activeId), done = Object.hasOwn(submitted, activeId);
  const correct = automationExercises.filter(value => submitted[value.id] === value.answer).length;
  return <section className="automation-page"><div className="automation-hero"><span className="eyebrow">HUMAN IN THE LOOP · WES / WGS</span><h1>自动化给出候选，<br />人工承担可追溯的判断。</h1><p>学习审核软件或AI产生的注释、候选证据和报告草稿。本平台不连接真实自动解读引擎、不接收患者资料，也不会自动签发诊断报告。</p><div className="automation-stats"><span>6 个审核关口</span><span>10 道逐步揭示练习</span><span>28 条证据强度细则</span></div></div>
    <aside className="automation-boundary"><h2>先分清“计算正确”与“临床成立”</h2><p>软件能够按规则算分，不代表输入、适用规范、相位、表型或文献独立性已得到确认。以下工作分工是平台依据指南整理的教学流程，不是ACMG发布的统一自动化分级标准；实际职责、验证和签发要求按实验室受控SOP。</p><p>任何修改都应保留：自动输出 → 人工决定（接受 / 修改 / 暂缓 / 不适用）→ 原文依据 → 剩余不确定性。无法核实的证据保持待审核，不能为了得到分类而补齐假设。</p></aside>
    <div className="automation-workflow">{automationWorkflow.map(gate => <article key={gate.title}><h2>{gate.title}</h2><dl><div><dt>可自动辅助</dt><dd>{gate.automatic}</dd></div><div><dt>人工复核</dt><dd>{gate.human}</dd></div><div className="audit-stop"><dt>停止关口</dt><dd>{gate.stop}</dd></div><div><dt>留存产物</dt><dd>{gate.artifact}</dd></div></dl></article>)}</div>
    <section className="automation-practice"><div className="section-heading"><div><span>REVIEW PRACTICE</span><h2>先审输出，再揭示证据</h2></div><p>根据原文规则设计的抽象边界练习，不是真实患者病例，不进入真实病例覆盖计数。参考判断正确 {correct}/{automationExercises.length}；已提交 {Object.keys(submitted).length}。这是练习记录，不是临床资质认证。</p></div><div className="audit-practice-layout"><nav aria-label="人工审核练习">{automationExercises.map((exercise, index) => <button className={exercise.id === activeId ? "active" : ""} aria-pressed={exercise.id === activeId} key={exercise.id} onClick={() => setActiveId(exercise.id)}><span>{String(index + 1).padStart(2, "0")}</span>{exercise.title}<small>{Object.hasOwn(submitted, exercise.id) ? submitted[exercise.id] === exercise.answer ? "参考判断正确" : "待复习" : "未提交"}</small></button>)}</nav>
      <article className="audit-exercise"><span className="eyebrow">{item.code}</span><h2>{item.title}</h2><h3>第一步 · 软件候选输出</h3><blockquote>{item.output}</blockquote><p>先想一想：这个结论依赖哪些输入？哪些尚未核实？</p><button className="secondary" disabled={opened} onClick={() => setRevealed(values => [...values, activeId])}>{opened ? "补充信息已揭示" : "第二步 · 揭示底层信息"}</button>
        {opened && <><div className="audit-reveal"><p>{item.reveal}</p></div><h3>{item.q}</h3><div className="review-options">{item.options.map((option, index) => <button key={option} disabled={done} className={answers[activeId] === index ? "selected" : ""} aria-pressed={answers[activeId] === index} onClick={() => setAnswers(values => ({ ...values, [activeId]: index }))}>{String.fromCharCode(65 + index)}. {option}</button>)}</div><label className="stage-note">人工审核理由（至少20字，仅核对完整度，不自动评价医学语义）<textarea maxLength={3000} rows={4} disabled={done} value={notes[activeId] ?? ""} onChange={event => setNotes(values => ({ ...values, [activeId]: event.target.value }))} placeholder="写明保留/修改/暂缓的证据、适用规范、强度和待补资料；不要输入患者信息。" /></label><button className="primary" disabled={done || answers[activeId] === undefined || (notes[activeId] ?? "").trim().length < 20} onClick={() => setSubmitted(values => ({ ...values, [activeId]: answers[activeId] }))}>第三步 · 提交并核对参考审核</button></>}
        {done && <div className="audit-feedback" aria-live="polite"><h3>{submitted[activeId] === item.answer ? "参考判断正确" : "需要复核"}</h3><p>{item.rationale}</p><p><b>审核底稿：</b>{item.record}</p><div className="strength-sources">{item.sources.map(id => <a key={id} href={evidenceSources[id].url} target="_blank" rel="noreferrer">{evidenceSources[id].title} ↗</a>)}</div><div className="review-actions"><button className="secondary" onClick={() => onEvidence(item.code.split(" / ")[0] === "病例级解释" ? "PM3" : item.code.split(" / ")[0])}>查看相关强度细则</button><button className="secondary" onClick={onReview}>前往统一错题复习</button></div></div>}
      </article></div></section>
    <div className="strength-sources"><p>来源核查 {strengthReviewedAt} · 练习答案保留，重做请到统一复习队列；不改动原始成绩。</p><a href={evidenceSources.hub.url} target="_blank" rel="noreferrer">ClinGen建议汇总 ↗</a><a href={evidenceSources.cspec.url} target="_blank" rel="noreferrer">核查适用VCEP与版本 ↗</a></div>
  </section>;
}
