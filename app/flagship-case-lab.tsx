"use client";

import { useEffect, useState } from "react";
import { flagshipCases } from "./flagship-cases";
import { notifyLearningProgress } from "./learning-record";

type FlagshipState = { revealed?: Record<string, number>; answers?: Record<string, number[]>; scores?: Record<string, number> };

export default function FlagshipCaseLab() {
  const [activeId, setActiveId] = useState(flagshipCases[0].id);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => { try { const saved=JSON.parse(window.localStorage.getItem("variant-atlas-flagship-v1") ?? "{}") as FlagshipState; /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration of local case progress */ if(saved.revealed) setRevealed(saved.revealed); if(saved.answers) setAnswers(saved.answers); if(saved.scores) setScores(saved.scores); /* eslint-enable react-hooks/set-state-in-effect */ } catch { /* ignore damaged progress */ } }, []);
  useEffect(() => { window.localStorage.setItem("variant-atlas-flagship-v1", JSON.stringify({revealed,answers,scores})); notifyLearningProgress(); }, [revealed,answers,scores]);

  const current = flagshipCases.find((item) => item.id === activeId) ?? flagshipCases[0];
  const visible = revealed[current.id] ?? 1;
  const currentAnswers = answers[current.id] ?? [];

  function answer(index: number, option: number) {
    if (currentAnswers[index] !== undefined) return;
    const next=[...currentAnswers]; next[index]=option;
    setAnswers((value)=>({...value,[current.id]:next}));
    if(next.filter((value, questionIndex)=>value===current.questions[questionIndex].answer).length >= 0 && next.length===current.questions.length) setScores((value)=>({...value,[current.id]:next.filter((answerValue,questionIndex)=>answerValue===current.questions[questionIndex].answer).length}));
  }

  return <section className="flagship-lab">
    <div className="section-heading"><div><span>FULL-LENGTH WGS CASES · TEACHING RECONSTRUCTION</span><h2>6个旗舰病例</h2></div><p>每例依次揭示临床问题、检测信号、专项规范、病例整合和报告边界。教学重组不作为新的病例证据。</p></div>
    <div className="flagship-layout"><aside>{flagshipCases.map((item)=><button key={item.id} className={item.id===current.id?"active":""} onClick={()=>setActiveId(item.id)}><span>{item.id}{scores[item.id]!==undefined?` · ${scores[item.id]}/3`:""}</span><b>{item.title}</b><small>{item.route}</small></button>)}</aside><article className="flagship-case"><header><span>{current.id} · FULL CASE</span><h2>{current.title}</h2><p>{current.route}</p></header><div className="flagship-provenance"><b>来源性质</b><p>{current.provenance}</p><small>{current.boundary}</small></div><div className="flagship-stages">{current.stages.slice(0,visible).map((stage,index)=><section key={stage.title}><span>{String(index+1).padStart(2,"0")}</span><div><h3>{stage.title}</h3><ul>{stage.facts.map((fact)=><li key={fact}>{fact}</li>)}</ul><details><summary>完成任务后揭示参考边界</summary><p><b>任务：</b>{stage.task}</p><p><b>参考：</b>{stage.answer}</p></details></div></section>)}</div>{visible<current.stages.length&&<button className="primary flagship-next" onClick={()=>setRevealed((value)=>({...value,[current.id]:visible+1}))}>揭示下一阶段 →</button>}{visible===current.stages.length&&<div className="flagship-quiz"><span>FINAL AUDIT · 3 GATES</span>{current.questions.map((question,index)=><section key={question.q}><h3>{index+1}. {question.q}</h3>{question.options.map((option,optionIndex)=><button key={option} disabled={currentAnswers[index]!==undefined} className={`${currentAnswers[index]===optionIndex?"selected":""} ${currentAnswers[index]!==undefined&&question.answer===optionIndex?"correct":""}`} onClick={()=>answer(index,optionIndex)}>{String.fromCharCode(65+optionIndex)}. {option}</button>)}{currentAnswers[index]!==undefined&&<p>{question.rationale}</p>}</section>)}</div>}<div className="flagship-sources"><b>公开来源</b>{current.sources.map((source)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div></article></div>
  </section>;
}
