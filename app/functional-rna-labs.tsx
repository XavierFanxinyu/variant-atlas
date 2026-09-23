"use client";
import { useState } from "react";
import { emptyFunctional, emptyRNA, functionalChecks, functionalReviewedAt, functionalSources, reviewFunctional, reviewRNA, rnaChecks, type FunctionalInput, type RNAInput } from "./functional-rna-model";
import { useProgressPersistence } from "./use-progress-persistence";

function Sources({ kind }: { kind: "functional" | "splicing" }) {
  return <div className="strength-sources"><a href={functionalSources[kind]} target="_blank" rel="noreferrer">{kind === "functional" ? "Brnich 2020 · Figure 4 / Table 3" : "Walker 2023 · Table 3 / Figure 5"} ↗</a><a href={functionalSources.cspec} target="_blank" rel="noreferrer">核查VCEP适用规范 ↗</a><span>模块核查 {functionalReviewedAt}</span></div>;
}
function Checks({ definitions, checked, onChange }: { definitions: ReadonlyArray<readonly [string, string]>; checked: string[]; onChange: (value: string[]) => void }) {
  return <fieldset className="pm3-observation"><legend>逐项审核（勾选不等于平台核实）</legend>{definitions.map(([key, label]) => <label key={key} className="audit-check"><input type="checkbox" checked={checked.includes(key)} onChange={e => onChange(e.target.checked ? [...checked, key] : checked.filter(value => value !== key))} />{label}</label>)}</fieldset>;
}
export function FunctionalLab() {
  const [input, setInput] = useState<FunctionalInput>(emptyFunctional);
  useProgressPersistence("variant-atlas-functional-v1", input, saved => setInput(saved));
  const change = (patch: Partial<FunctionalInput>) => setInput(value => ({ ...value, checks: [], ...patch }));
  const result = reviewFunctional(input);
  return <section className="strength-calculator"><span className="eyebrow">PS3 / BS3 · AUDIT BEFORE WEIGHT</span><h2>功能实验审核与强度映射</h2><p>只映射已验证的OddsPath，不从p值、实验次数或活性百分比推算。先核查具体实验，再赋强度；纯RNA剪接实验请进入旁边的RNA审核。</p><Sources kind="functional" />
    <div className="pm3-fields"><label>功能实验原文定位<input maxLength={500} value={input.source} onChange={e => change({ source: e.target.value })} placeholder="DOI/PMID、表号、实验及变异编号" /></label><label>经校准的OddsPath<input inputMode="decimal" value={input.odds} maxLength={40} onChange={e => change({ odds: e.target.value })} placeholder="可用科学计数法；未知请留空" /></label><label>实验读数归类<select value={input.direction} onChange={e => change({ direction: e.target.value as FunctionalInput["direction"] })}><option value="unknown">尚未确认</option><option value="abnormal">异常功能区间</option><option value="normal">正常功能区间</option><option value="indeterminate">中间/不确定区间</option></select></label></div>
    <label className="stage-note">功能实验审核底稿<textarea rows={4} maxLength={3000} value={input.record} onChange={e => change({ record: e.target.value })} placeholder="基因–疾病、规范版本、实验机制、对照独立分类、校准方法、读数区间和证据依赖；不录入患者信息。" /></label>
    <label className="audit-check"><input type="checkbox" checked={input.conflict} onChange={e => change({ conflict: e.target.checked })} />存在冲突实验或尚未解释的中间表型</label>
    <Checks definitions={functionalChecks} checked={input.checks} onChange={checks => setInput(value => ({ ...value, checks }))} />
    <div className="strength-result" aria-live="polite"><strong>{result.strength}</strong>{result.issues.map(message => <p key={message}>{message}</p>)}<p>按Brnich表3严格不等号取满足的最高级：PS3 &gt;2.1 / &gt;4.3 / &gt;18.7 / &gt;350；BS3 &lt;0.48 / &lt;0.23 / &lt;0.053。0.48–2.1无方向性证据。本表不定义BS3_VeryStrong。</p><p>仅为选定通用框架下的教学映射。适用VCEP可能限制强度；BS3_Moderate不能直接塞进未经调整的2015组合表。不输出最终致病分类。</p></div>
    <details className="lab-trace"><summary>没有OddsPath时怎么办？</summary><p>回原文Figure 4核查对照、重复、验证对照数量与分类独立性；不能仅凭“≥11个对照”直接升强。历史认可实验也需按原文适用条件审核。本站暂不自动处理这些分支，留空并记录待补资料。</p></details><p>底稿自动本地保存并可统一备份。更改原文、读数或底稿会清空确认项，避免沿用旧审核结论。</p>
  </section>;
}
export function RNALab() {
  const [input, setInput] = useState<RNAInput>(emptyRNA);
  useProgressPersistence("variant-atlas-rna-v1", input, saved => setInput(saved));
  const change = (patch: Partial<RNAInput>) => setInput(value => ({ ...value, checks: [], ...patch }));
  const result = reviewRNA(input);
  return <section className="strength-calculator"><span className="eyebrow">RNA · EVIDENCE ROUTING</span><h2>RNA剪接证据审核</h2><p>这是一张资料与路径审核表，不是RNA强度计算器。正常、异常、残余和混合转录本需要不同的审核路线；不按任意百分比自动升级。</p><Sources kind="splicing" />
    <div className="pm3-fields"><label>RNA原文定位<input maxLength={500} value={input.source} onChange={e => change({ source: e.target.value })} placeholder="DOI/PMID、图表与实验编号" /></label><label>RNA实验材料<select value={input.material} onChange={e => change({ material: e.target.value as RNAInput["material"] })}><option value="unknown">尚未确认</option><option value="patient">患者非肿瘤组织</option><option value="minigene">minigene实验</option><option value="other">其他模型/材料</option></select></label><label>RNA观察结果<select value={input.outcome} onChange={e => change({ outcome: e.target.value as RNAInput["outcome"] })}><option value="unknown">尚未确认</option><option value="abnormal">可明确解释的异常剪接</option><option value="normal">未见剪接影响</option><option value="complex">混合转录本/残余表达/不确定</option></select></label><label>变异类型<select value={input.variant} onChange={e => change({ variant: e.target.value as RNAInput["variant"] })}><option value="unknown">尚未确认</option><option value="silent-intronic">同义或内含子变异</option><option value="protein-altering">同时涉及蛋白改变</option></select></label></div>
    <label className="stage-note">RNA审核底稿<textarea maxLength={3000} rows={5} value={input.record} onChange={e => change({ record: e.target.value })} placeholder="转录本版本、组织表达、实验对照、NMD处理、各产物比例/阅读框、残余转录本、检测限与规则版本；不录入患者信息。" /></label>
    <label className="audit-check"><input type="checkbox" checked={input.lof} onChange={e => change({ lof: e.target.checked })} />已确认该基因–疾病以功能丧失（LoF）为致病机制</label>
    <Checks definitions={rnaChecks} checked={input.checks} onChange={checks => setInput(value => ({ ...value, checks }))} />
    <div className="strength-result" aria-live="polite"><strong>{result.route}</strong>{result.issues.map(message => <p key={message}>{message}</p>)}</div>
    <details className="lab-trace"><summary>证据依赖与下一步</summary><p>把实测剪接产物带入PVS1路径并评估实际权重；不要把RNA效应同时记为PVS1和PS3。下游蛋白实验是否提供独立信息需另外审核，不做一概禁止或一概叠加。BP4与BP7(RNA)的组合按Walker Figure 5及适用VCEP判断，不用本页代替完整规范。</p></details><p>本机保存、统一备份；更改输入后须重新勾选审核项。所有结果均为教学提示，不能用于自动签发。</p>
  </section>;
}
