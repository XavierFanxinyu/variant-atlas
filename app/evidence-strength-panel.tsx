"use client";
import { useState } from "react";
import { evidenceSources, strengthDetails, strengthReviewedAt, strengthTables } from "./evidence-strength-data";
import { calculatePM3, emptyPM3Observation, type PM3Observation } from "./pm3-model";
import { useProgressPersistence } from "./use-progress-persistence";

export function PM3Calculator() {
  const [observations, setObservations] = useState<PM3Observation[]>([]);
  const [scopeConfirmed, setScopeConfirmed] = useState(false);
  useProgressPersistence("variant-atlas-pm3-v1", { observations, scopeConfirmed }, saved => { setObservations(saved.observations); setScopeConfirmed(saved.scopeConfirmed); });
  const result = calculatePM3(observations, scopeConfirmed);
  const change = (index: number, patch: Partial<PM3Observation>) => setObservations(items => items.map((row, i) => i === index ? { ...row, ...patch } : row));
  return <section className="strength-calculator" aria-labelledby="pm3-heading"><span className="eyebrow">PM3 · AUDITABLE POINTS</span><h2 id="pm3-heading">PM3逐例计分实验室</h2>
    <p>仅录入公开教学材料的编号和来源，不填写患者身份或自有病例信息。每次只评一个变异、一种疾病；更换评估对象请逐条删除旧记录。数据只保存在本机，可通过学习档案备份。</p>
    <label className="audit-check"><input type="checkbox" checked={scopeConfirmed} onChange={event => setScopeConfirmed(event.target.checked)} />我已核查适用的基因/疾病规范，本次采用PM3 v1.0通用模型；不是CNV、mtDNA或其他专门框架。</label>
    {observations.map((row, index) => <fieldset key={index} className="pm3-observation"><legend>观察 {index + 1}</legend><div className="pm3-fields">
      <label>家系去重号<input maxLength={100} value={row.family} placeholder="如公开文献 Family-A" onChange={event => change(index, { family: event.target.value })} /></label>
      <label>来源与原文定位<input maxLength={500} value={row.source} placeholder="DOI / PMID + 表格、行号" onChange={event => change(index, { source: event.target.value })} /></label>
      <label>观察类型<select value={row.kind} onChange={event => change(index, { kind: event.target.value as PM3Observation["kind"], verified: false })}><option value="heterozygous">两个杂合变异</option><option value="homozygous">待评估变异纯合</option></select></label>
      {row.kind === "heterozygous" && <><label>另一变异标识<input maxLength={150} value={row.otherVariant} placeholder="统一转录本/HGVS，或练习编号" onChange={event => change(index, { otherVariant: event.target.value, verified: false })} /></label><label>另一变异独立分类<select value={row.classification} onChange={event => change(index, { classification: event.target.value as PM3Observation["classification"], verified: false })}>{["VUS", "LP", "P", "B/LB"].map(value => <option key={value}>{value}</option>)}</select></label><label>相位<select value={row.phase} onChange={event => change(index, { phase: event.target.value as PM3Observation["phase"], verified: false })}><option value="unknown">未知</option><option value="trans">已确认反式</option><option value="cis">已确认顺式</option></select></label></>}
    </div><label className="audit-check"><input type="checkbox" checked={row.verified} onChange={event => change(index, { verified: event.target.checked })} />已核查：隐性病受累者、相关变异均足够稀有、非重复/相关先证者、另一变异分类无循环论证（纯合时核查真实纯合与质量）。</label><p className="pm3-reason">原始贡献 {result.rows[index].points} 分 · {result.rows[index].reason}</p><button className="secondary" onClick={() => setObservations(items => items.filter((_, i) => i !== index))}>删除观察 {index + 1}</button></fieldset>)}
    {!observations.length && <p className="empty-state">尚无观察。添加一条，按原始文献逐项填写并核查。</p>}
    <button className="secondary" disabled={observations.length >= 30} onClick={() => setObservations(items => [...items, emptyPM3Observation()])}>＋ 添加独立观察（{observations.length}/30）</button>
    <div className="strength-result" aria-live="polite"><span>封顶后教学合计</span><strong>{result.total} 分 · {result.strength}</strong><p>其他合格反式/未知相位贡献 {result.other} ＋ 纯合 {result.homozygous} ＋ 反式VUS {result.vus}</p>{result.warnings.map(message => <p className="strength-warning" key={message}>{message}</p>)}<p>结果仅覆盖已通过核查的行，不是变异最终分类，也不会自动送入下方2015组合练习台。输入确认是学习者自评，不代表平台已验证文献或病例。</p></div>
  </section>;
}

export default function EvidenceStrengthPanel({ code }: { code: string }) {
  const item = strengthDetails.find(detail => detail.code === code);
  if (!item) return null;
  const table = item.table ? strengthTables[item.table] : undefined;
  return <section className="strength-detail"><span className="eyebrow">STRENGTH SPECIFICATION</span><h2>{code} · 升降级细则</h2><p className="strength-scope">{item.scope}</p><dl><div><dt>允许强度 / 调整方式</dt><dd>{item.levels}</dd></div><div><dt>判断路径</dt><dd>{item.decision}</dd></div><div><dt>降级、不赋值或转人工</dt><dd>{item.stop}</dd></div><div><dt>应留底稿</dt><dd>{item.record}</dd></div></dl>
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to scroll the evidence table at narrow widths and 200% zoom. */}
    {table && <><div className="strength-table-scroll" tabIndex={0} role="region" aria-label={table.caption}><table><caption>{table.caption}</caption><thead><tr>{table.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div><p>{table.note}</p></>}
    <p className="strength-scope">来源核查：{strengthReviewedAt}。这是教学摘要，不宣称已穷尽所有VCEP；适用的基因–疾病规范须逐次核查，不能仅按发布日期选规则。</p><div className="strength-sources">{item.sources.map(id => <a href={evidenceSources[id].url} target="_blank" rel="noreferrer" key={id}>{evidenceSources[id].title} ↗</a>)}</div>
  </section>;
}
