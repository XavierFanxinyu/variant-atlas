"use client";
import { useState } from "react";
import { useProgressPersistence } from "./use-progress-persistence";
import { deepLessons } from "./deep-lessons";

export default function DeepLessonPanel({ lessonId }: { lessonId: string }) {
  const [notes, setNotes] = useState<Record<string, Record<string, string>>>({});
  useProgressPersistence("variant-atlas-workshop-v1", { notes }, saved => setNotes(saved.notes));
  const deep = deepLessons[lessonId];
  if (!deep) return null;
  return <section className="deep-lesson-panel">
    <header><div><span>{deep.level} · LONG FORM</span><h2>深度决策工作坊</h2></div><small>{deep.time}（含查阅原文和填写底稿，非纯阅读时长）</small><p>{deep.question}</p></header>
    <div className="deep-workflow">{deep.workflow.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2,"0")}</span><div><h3>{item.title}</h3><p>{item.body}</p><small>本步产物：{item.output}</small><label className="stage-note">我的工作底稿<textarea rows={4} maxLength={10000} value={notes[lessonId]?.[String(index)] ?? ""} onChange={event => setNotes(value => ({ ...value, [lessonId]: { ...value[lessonId], [String(index)]: event.target.value } }))} placeholder="将本步产物写在这里；记录判断、支持依据、反证和未解决问题。请勿输入患者信息。" /></label></div></article>)}</div>
    <div className="deep-example"><span>WORKED EXAMPLE</span><h3>{deep.workedExample.title}</h3><div><section><b>已知事实</b><ul>{deep.workedExample.facts.map((item) => <li key={item}>{item}</li>)}</ul></section><section><details><summary>完成底稿后，对照示例推理链</summary><ol>{deep.workedExample.reasoning.map((item) => <li key={item}>{item}</li>)}</ol></details></section></div><p><b>停止关口：</b>{deep.workedExample.stop}</p></div>
    <div className="deep-pitfalls"><b>高频误判雷达</b>{deep.pitfalls.map((item) => <span key={item}>{item}</span>)}</div>
  </section>;
}
