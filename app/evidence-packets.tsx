"use client";
import { useState } from "react";
import { evidencePackets, packetDecisionComplete, packetDecisionCorrect, reviewActions, type PacketDecision } from "./evidence-packets-data";
import { labReviewedAt } from "./evidence-lab-model";
import { useProgressPersistence } from "./use-progress-persistence";

export default function EvidencePackets({ onReview }: { onReview: () => void }) {
  const [activeId, setActiveId] = useState(evidencePackets[0].id), [revealed, setRevealed] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PacketDecision>>({}), [submitted, setSubmitted] = useState<Record<string, PacketDecision>>({});
  useProgressPersistence("variant-atlas-packets-v1", { activeId, revealed, drafts, submitted }, saved => { setActiveId(saved.activeId); setRevealed(saved.revealed); setDrafts(saved.drafts); setSubmitted(saved.submitted); });
  const packet = evidencePackets.find(item => item.id === activeId)!;
  const opened = revealed.includes(activeId);
  const correct = evidencePackets.flatMap(item => item.items).filter(item => packetDecisionCorrect(item, submitted[item.id])).length;
  const change = (id: string, patch: Partial<PacketDecision>) => setDrafts(values => ({ ...values, [id]: { ...(values[id] ?? { action: -1, strength: "", note: "" }), ...patch } }));
  return <section className="packet-lab"><div className="section-heading"><div><span>PUBLIC EVIDENCE PACKETS</span><h2>公开证据包 · 人工审核实战</h2></div><p>{evidencePackets.length}份证据包 · {evidencePackets.flatMap(item => item.items).length}条待审输出 · 参考决定正确 {correct}/{evidencePackets.flatMap(item => item.items).length}</p></div><p>事实来自下列公开原文；所有“候选输出”均是本站为审核训练设置的假设，不是实际软件运行结果。未补造病例资料；不纳入完整真实病例数量。原有证据包核查 {labReviewedAt}；新增包核查日期见各包来源定位。</p>
    <div className="lab-tabs" role="group" aria-label="选择公开证据包">{evidencePackets.map(item => <button key={item.id} className={activeId === item.id ? "active" : ""} aria-pressed={activeId === item.id} onClick={() => setActiveId(item.id)}>{item.title}</button>)}</div>
    <article className="packet-body"><span className="eyebrow">{packet.provenance}</span><h3>{packet.title}</h3><p><a href={packet.url} target="_blank" rel="noreferrer">{packet.sourceTitle} ↗</a> · {packet.locator}</p>
      <h4>第一步 · 待审核候选输出</h4>{packet.items.map(item => <blockquote key={item.id}><b>{item.code}</b>：{item.candidate}</blockquote>)}
      <button className="secondary" disabled={opened} onClick={() => setRevealed(items => [...items, activeId])}>{opened ? "原文事实已揭示" : "第二步 · 展开原文事实与资料边界"}</button>
      {opened && <><div className="packet-facts"><h4>原文事实（转述）</h4><ul>{packet.facts.map(fact => <li key={fact}>{fact}</li>)}</ul><p><b>材料边界：</b>{packet.missing}</p></div><h4>第三步 · 逐条审核并留底稿</h4>
        {packet.items.map(item => {
          const done = !!submitted[item.id], value = submitted[item.id] ?? drafts[item.id] ?? { action: -1, strength: "", note: "" };
          return <fieldset className="packet-decision" key={item.id}><legend>{item.code}</legend><p>{item.candidate}</p><div className="tree-choices">{reviewActions.map((label, index) => <label key={label}><input type="radio" name={item.id} checked={value.action === index} disabled={done} onChange={() => change(item.id, { action: index })} />{label}</label>)}</div><label>审核后强度 / 状态<select value={value.strength} disabled={done} onChange={e => change(item.id, { strength: e.target.value })}><option value="">请选择</option>{item.strengths.map(strength => <option key={strength}>{strength}</option>)}</select></label><label className="stage-note">理由与原文定位（至少20字）<textarea rows={3} maxLength={3000} disabled={done} value={value.note} onChange={e => change(item.id, { note: e.target.value })} placeholder="引用具体事实，区分缺资料与不适用，说明剩余不确定性。" /></label><button className="primary" disabled={done || !packetDecisionComplete(item, value)} onClick={() => { if (packetDecisionComplete(item, drafts[item.id])) setSubmitted(items => ({ ...items, [item.id]: { ...drafts[item.id] } })); }}>提交本条并揭示参考审核</button>
            {done && <div className="audit-feedback" aria-live="polite"><h4>{packetDecisionCorrect(item, value) ? "参考决定与强度正确" : "需要复习"}</h4><p>参考：{reviewActions[item.answer]} · {item.target}</p><p>{item.rationale}</p><p>理由仅检查完整度，未由AI或临床专家自动评分。错误决定/强度进入统一复习队列；本次原始提交保留。</p></div>}</fieldset>;
        })}<button className="secondary" onClick={onReview}>到统一错题队列复习</button></>}
    </article>
  </section>;
}
