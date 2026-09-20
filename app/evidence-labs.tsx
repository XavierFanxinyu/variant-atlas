"use client";
import { useState } from "react";
import { PM3Calculator } from "./evidence-strength-panel";
import { calculateDeNovo, calculateSegregation, emptyDeNovo, emptySegregation, labReviewedAt, labSources, phenotypeLabels, type DeNovoRow, type SegregationInput } from "./evidence-lab-model";
import { pvs1Questions, pvs1Route, setPVS1Answer, type PVS1Answers } from "./pvs1-model";
import { useProgressPersistence } from "./use-progress-persistence";

function Sources({ kind }: { kind: keyof typeof labSources }) {
  return <div className="strength-sources"><a target="_blank" rel="noreferrer" href={labSources[kind]}>原始建议与表格 ↗</a><a target="_blank" rel="noreferrer" href={labSources.cspec}>核查基因–疾病特异规范 ↗</a><span>本模块核查 {labReviewedAt}</span></div>;
}
export function DeNovoLab() {
  const [rows, setRows] = useState<DeNovoRow[]>([]), [scope, setScope] = useState(false);
  useProgressPersistence("variant-atlas-denovo-v1", { rows, scope }, saved => { setRows(saved.rows); setScope(saved.scope); });
  const result = calculateDeNovo(rows, scope);
  const change = (index: number, patch: Partial<DeNovoRow>) => setRows(items => items.map((row, i) => i === index ? { ...row, verified: false, ...patch } : row));
  return <section className="strength-calculator"><span className="eyebrow">PS2 / PM6 · DE NOVO</span><h2>新发证据逐例计分</h2><p>ClinGen v1.1（2021-05-05），表1–2。一次只评同一变异、同一疾病；仅输入公开教学编号。亲缘“未确认”不等于父母未做变异检测。</p><Sources kind="denovo" />
    <label className="audit-check"><input type="checkbox" checked={scope} onChange={e => setScope(e.target.checked)} />已核查VCEP适用性，本次采用通用模型；各观察属于同一评估对象。</label>
    {rows.map((row, index) => <fieldset className="pm3-observation" key={index}><legend>独立观察 {index + 1}</legend><div className="pm3-fields">
      <label>家系去重号<input maxLength={100} value={row.family} onChange={e => change(index, { family: e.target.value })} placeholder="文献中的公开家系号" /></label>
      <label>来源定位<input maxLength={500} value={row.source} onChange={e => change(index, { source: e.target.value })} placeholder="DOI/PMID、表格/行号" /></label>
      <label>亲缘状态<select value={row.parentage} onChange={e => change(index, { parentage: e.target.value as DeNovoRow["parentage"] })}><option value="unknown">尚未核实</option><option value="confirmed">双亲亲缘已确认</option><option value="assumed">双亲亲缘假定、未确认</option></select></label>
      <label>表型依据<select value={row.phenotype} onChange={e => change(index, { phenotype: e.target.value as DeNovoRow["phenotype"] })}>{Object.entries(phenotypeLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
    </div><label className="audit-check"><input type="checkbox" checked={row.parentsNegative} onChange={e => change(index, { parentsNegative: e.target.checked })} />双亲均已检测该变异且结果阴性。</label>
      <label className="audit-check"><input type="checkbox" checked={row.special} onChange={e => change(index, { special: e.target.checked })} />涉及AR未找到另一P/LP、X连锁携带母亲新发或疑似生殖系嵌合/多个同胞。</label>
      <label className="audit-check"><input type="checkbox" checked={row.verified} onChange={e => change(index, { verified: e.target.checked })} />已核查独立性、质量与表型原文；不是重复发表的同一先证者。</label>
      <p className="pm3-reason">原始贡献 {result.details[index].points} 分 · {result.details[index].reason}</p><button className="secondary" onClick={() => setRows(items => items.filter((_, i) => i !== index))}>删除观察 {index + 1}</button></fieldset>)}
    {!rows.length && <p className="empty-state">添加公开文献中的独立观察。资料不足的行会显示原因，并暂停最终强度。</p>}
    <button className="secondary" disabled={rows.length >= 30} onClick={() => setRows(items => [...items, emptyDeNovo()])}>＋ 添加观察（{rows.length}/30）</button>
    <div className="strength-result" aria-live="polite"><strong>{result.total} 分 · {result.strength}</strong><p>其他合格观察 {result.ordinary} ＋ 高异质性类别 {result.heterogeneous} → 封顶后 {result.capped}。</p><p>0.5 / 1 / 2 / 4 对应 Supporting / Moderate / Strong / VeryStrong。混合亲缘状态合并一次计权，有确认亲缘的有效观察时标记PS2；不能再叠加PM6。</p><p>这是新发观察分，不是贝叶斯分类分。特殊模式须查原文第2页：AR缺另一P/LP需降一级；疑似生殖系嵌合需确认亲缘。本版不自动处理这些特殊观察，也不输出变异最终分类。</p></div>
  </section>;
}

export function SegregationLab() {
  const [input, setInput] = useState<SegregationInput>(emptySegregation);
  useProgressPersistence("variant-atlas-segregation-v1", input, saved => setInput(saved));
  const change = (patch: Partial<SegregationInput>) => setInput(value => ({ ...value, ...patch }));
  const result = calculateSegregation(input);
  return <section className="strength-calculator"><span className="eyebrow">PP1 / PP4 · SHARED LOCUS EVIDENCE</span><h2>共分离与表型联合练习</h2><p>Biesecker等，2024，表2–4。先数有效共分离，不数“家里有几个人”；先证者和用于建立相位的传递不重复计入。</p><Sources kind="segregation" />
    <label className="audit-check"><input type="checkbox" checked={input.scope} onChange={e => change({ scope: e.target.checked })} />基因–疾病关联为Strong/Definitive；已核查VCEP、相位和有效传递，本次适用简单家系通用模型。</label>
    <div className="pm3-fields"><label>遗传模式<select value={input.mode} onChange={e => change({ mode: e.target.value as SegregationInput["mode"], scope: false, rows: input.rows.map(row => ({ ...row, verified: false })) })}><option value="AD">常染色体显性</option><option value="AR">常染色体隐性</option><option value="XLR">X连锁隐性（本练习限男性观察）</option></select></label>
      <label>同一等位基因上合理候选数<input type="number" min={1} max={30} step={1} value={input.variants} onChange={e => change({ variants: e.target.value, scope: false })} /></label>
      <label>匹配表型和检测方法的检出率（%）<input type="number" min={0} max={100} step="any" value={input.yieldPercent} onChange={e => change({ yieldPercent: e.target.value, yieldVerified: false })} placeholder="未知留空，不奖励PP4" /></label>
      <label>检出率原文定位<input maxLength={500} value={input.yieldSource} onChange={e => change({ yieldSource: e.target.value, yieldVerified: false })} placeholder="检出率不能用HPO相似度替代" /></label></div>
    <label className="audit-check"><input type="checkbox" checked={input.yieldVerified} onChange={e => change({ yieldVerified: e.target.checked })} />检出率与本次表型、方法匹配，已完成该位点的适当分配；不是整组WES的总体阳性率。</label>
    <label className="audit-check"><input type="checkbox" checked={input.homogeneous} onChange={e => change({ homogeneous: e.target.checked, scope: false })} />该表型具有位点同质性（检出率&gt;90%时不叠加PP1）。</label>
    <label className="audit-check"><input type="checkbox" checked={input.fullyPenetrant} onChange={e => change({ fullyPenetrant: e.target.checked })} />对未受累者已确认完全外显并达到适当发病年龄。</label>
    <label className="audit-check"><input type="checkbox" checked={input.complex} onChange={e => change({ complex: e.target.checked })} />存在低外显率、高拟表型率、矛盾分离、近亲婚配/复杂家系。</label>
    <p>AR反式的两个等位基因不是这里的“两个顺式候选”。本练习不自动重新分配多位点证据，也不自动计X连锁女性携带者；这类情形需回原文专项分析。</p>
    {input.rows.map((row, index) => <fieldset className="pm3-observation" key={index}><legend>有效共分离 {index + 1}</legend><div className="pm3-fields"><label>家系–个体去重号<input value={row.person} maxLength={100} onChange={e => change({ rows: input.rows.map((item, i) => i === index ? { ...item, person: e.target.value, verified: false } : item) })} placeholder="如文献Family-A:II-3" /></label><label>原文/家系图定位<input value={row.source} maxLength={500} onChange={e => change({ rows: input.rows.map((item, i) => i === index ? { ...item, source: e.target.value, verified: false } : item) })} /></label><label>状态<select value={row.affected ? "affected" : "unaffected"} onChange={e => change({ rows: input.rows.map((item, i) => i === index ? { ...item, affected: e.target.value === "affected", verified: false } : item) })}><option value="affected">受累且共分离</option><option value="unaffected">未受累且符合分离预期</option></select></label></div><label className="audit-check"><input type="checkbox" checked={row.verified} onChange={e => change({ rows: input.rows.map((item, i) => i === index ? { ...item, verified: e.target.checked } : item) })} />已核对基因型、表型和有效传递；排除先证者/定相所用个体/重复记录；XLR时本条为男性。</label><p className="pm3-reason">{result.details[index].points} 分 · {result.details[index].reason}</p><button className="secondary" onClick={() => change({ rows: input.rows.filter((_, i) => i !== index) })}>删除共分离 {index + 1}</button></fieldset>)}
    <button className="secondary" disabled={input.rows.length >= 30} onClick={() => change({ rows: [...input.rows, { person: "", source: "", affected: true, verified: false }] })}>＋ 添加有效共分离（{input.rows.length}/30）</button>
    <div className="strength-result" aria-live="polite"><strong>{result.strength}</strong><p>PP4 {result.pp4} ＋ PP1 {result.pp1} ＝ {result.raw}；按同一等位基因合理候选数分配后 {Number(result.divided.toFixed(3))}，再封顶为 {Number(result.total.toFixed(3))} 分/变异。</p>{result.noSegregation && <p>本次高检出率位点同质，PP1贡献归零。</p>}{result.issues.map(message => <p className="strength-warning" key={message}>{message}</p>)}<p>先分配、再封顶5分。检出率按表2向下取档，不插值；低于19.1%不赋PP4。显示的是PP1/PP4共享证据上限，不自动指定两代码的分工，也不是最终致病分类。</p></div>
  </section>;
}

export function PVS1Lab() {
  const [answers, setAnswers] = useState<PVS1Answers>({}), [record, setRecord] = useState("");
  useProgressPersistence("variant-atlas-pvs1-v1", { answers, record }, saved => { setAnswers(saved.answers); setRecord(saved.record); });
  const route = pvs1Route(answers);
  const visible = route.trail.map(step => pvs1Questions.find(q => q.id === step.id)!);
  if (route.question) visible.push(route.question);
  return <section className="strength-calculator"><span className="eyebrow">PVS1 · TRACEABLE DECISION PATH</span><h2>PVS1逐步决策树</h2><p>按回答展开下一步；修改上游选择会清除下游分支。输入由学习者核实，本站不预测NMD、不运行剪接软件。2018基础树与2023更新提醒并存，特异规范优先。</p><Sources kind="pvs1" /><a href={labSources.splicing} target="_blank" rel="noreferrer">2023剪接建议与更新 ↗</a>
    <div className="pvs1-path">{visible.map(q => <fieldset key={q.id}><legend>{q.title}</legend><p>{q.help}</p><div className="tree-choices">{q.options.map(([value, label]) => <label key={value}><input type="radio" name={`pvs1-${q.id}`} value={value} checked={answers[q.id] === value} onChange={() => setAnswers(current => setPVS1Answer(current, q.id, value))} />{label}</label>)}</div></fieldset>)}</div>
    <div className="strength-result" aria-live="polite"><strong>{route.strength}</strong><p>{route.message}</p>{route.base > 0 && <p>基础路径等级：{["", "Supporting", "Moderate", "Strong", "VeryStrong"][route.base]}；机制条件{answers.mechanism === "down1" ? "降一级" : answers.mechanism === "down2" ? "降两级" : "不降级"}。仅为已选假设下的教学路径，未核查底稿前不能用于临床。</p>}<p>PVS1与同一剪接预测的PP3不重复；RNA实验证据需评组织、定量与残余转录本，不能自动按PVS1＋PS3叠加。</p></div>
    <details className="lab-trace"><summary>展开本次路径底稿（{route.trail.length}步）</summary><ol>{route.trail.map(step => <li key={step.id}>{step.question}：{step.choice}</li>)}</ol></details>
    <label className="stage-note">原文定位与待补依据<textarea rows={4} maxLength={3000} value={record} onChange={e => setRecord(e.target.value)} placeholder="记录公开变异、转录本版本、外显子、终止位点、功能区依据和规范版本；不要录入患者信息。" /></label><p>路径和底稿自动保存在本机，可随学习档案导出。修改选择会即时重算结果，不保留旧强度。</p>
  </section>;
}

export default function EvidenceLabs() {
  const [tab, setTab] = useState("pm3");
  return <section id="evidence-labs" className="evidence-labs" aria-labelledby="evidence-labs-title"><h2 id="evidence-labs-title">证据训练工作区</h2><div className="lab-tabs" role="group" aria-label="切换证据训练">{[["pm3", "PM3 反式"], ["denovo", "PS2 / PM6 新发"], ["segregation", "PP1 / PP4 联合"], ["pvs1", "PVS1 决策树"]].map(([id, label]) => <button className={tab === id ? "active" : ""} aria-pressed={tab === id} key={id} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === "pm3" ? <PM3Calculator /> : tab === "denovo" ? <DeNovoLab /> : tab === "segregation" ? <SegregationLab /> : <PVS1Lab />}</section>;
}
