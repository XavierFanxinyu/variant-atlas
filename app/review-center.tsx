"use client";
import { useEffect, useState } from "react";
import { collectReviewItems, isReviewCurrent, type ReviewItem } from "./review-model";
import { LEARNING_RECORD_EVENT } from "./learning-record";
import { useProgressPersistence } from "./use-progress-persistence";

function ReviewCard({ item, reviewed, onReview }: { item: ReviewItem; reviewed: boolean; onReview: () => void }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [note, setNote] = useState("");
  return <article className="review-card"><header><span>{item.group}</span><b>{reviewed ? "已复习 · 非掌握认证" : "待复习"}</b></header><h2>{item.title}</h2><p>{item.prompt}</p>
    {item.options && <div className="review-options">{item.options.map((option, index) => <button key={option} disabled={answer !== null} className={answer === index ? "selected" : ""} onClick={() => setAnswer(index)}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>}
    {(answer !== null || !item.options) && <div className="review-feedback"><p>{item.options && <b>{answer === item.answer ? "本次判断正确。" : "请重新核对。"} 上次选择：{item.options[item.selected!] }；参考选择：{item.options[item.answer!]}。</b>}</p><p>{item.rationale}</p></div>}
    {item.options ? <div className="review-actions"><button className="secondary" disabled={answer === null} onClick={() => setAnswer(null)}>再试一次</button><button className="primary" disabled={answer !== item.answer || reviewed} onClick={onReview}>记录本次复习</button></div>
      : <><label className="stage-note">本次复核说明（临时文字，不进入学习档案）<textarea rows={3} value={note} onChange={event => setNote(event.target.value)} placeholder="写下需要回查的原文或修改方向。请勿填写患者身份信息。" /></label><button className="secondary" disabled={!note.trim() || reviewed} onClick={onReview}>标记已阅读并核对（自评）</button></>}
  </article>;
}

export default function ReviewCenter({ onReport, onExam }: { onReport: () => void; onExam: () => void }) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [reviewed, setReviewed] = useState<Record<string, string>>({});
  const [group, setGroup] = useState("全部");
  const [showDone, setShowDone] = useState(false);
  useProgressPersistence("variant-atlas-review-v1", { reviewed }, saved => setReviewed(saved.reviewed));
  useEffect(() => {
    const refresh = () => { try { setItems(collectReviewItems(window.localStorage)); } catch { setItems([]); } };
    refresh(); window.addEventListener(LEARNING_RECORD_EVENT, refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(LEARNING_RECORD_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const pending = items.filter(item => !isReviewCurrent(reviewed[item.id], item.signature));
  const shown = items.filter(item => (group === "全部" || group === item.group) && (showDone || !isReviewCurrent(reviewed[item.id], item.signature)));
  return <section className="review-center"><div className="section-heading"><div><span>UNIFIED REVIEW</span><h2>统一复习队列 · {pending.length}项待复习</h2></div><p>来自已提交测验、证据练习、WGS病例、旗舰审计与报告风险。复习不改动原始成绩，也不代表已经掌握。24小时后再次进入待复习；这是学习安排，不是医学规范要求。</p></div>
    <div className="review-toolbar"><label>来源<select value={group} onChange={event => setGroup(event.target.value)}>{["全部", "核心测验", "证据练习", "WGS测验", "WGS病例", "旗舰审计", "报告风险", "历史主题"].map(value => <option key={value}>{value}</option>)}</select></label><label><input type="checkbox" checked={showDone} onChange={event => setShowDone(event.target.checked)} />显示已复习</label><button className="secondary" onClick={onReport}>返回报告实验室</button><button className="secondary" onClick={onExam}>参加核心测验</button></div>
    {shown.length ? shown.map(item => <ReviewCard key={`${item.id}:${item.signature}`} item={item} reviewed={isReviewCurrent(reviewed[item.id], item.signature)} onReview={() => setReviewed(value => ({ ...value, [item.id]: item.signature + ":" + Date.now() }))} />) : <div className="empty-state"><h3>当前筛选下没有待复习项</h3><p>完成练习后返回这里；也可显示已复习内容。没有错题不等于能力认证通过。</p></div>}
  </section>;
}
