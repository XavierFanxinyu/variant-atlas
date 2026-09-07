"use client";

import { useState } from "react";
import { flagshipCases } from "./flagship-cases";
import { useProgressPersistence } from "./use-progress-persistence";
import { completedQuizScore } from "./progress-model";

export default function FlagshipCaseLab() {
  const [activeId, setActiveId] = useState(flagshipCases[0].id);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Record<string, Array<number | null>>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [reviewed, setReviewed] = useState<Record<string, string[]>>({});
  useProgressPersistence("variant-atlas-flagship-v1", { activeId, revealed, answers, scores, notes, reviewed }, saved => {
    setActiveId(saved.activeId); setRevealed(saved.revealed); setAnswers(saved.answers);
    setScores(saved.scores); setNotes(saved.notes); setReviewed(saved.reviewed);
  });

  const current = flagshipCases.find(item => item.id === activeId) ?? flagshipCases[0];
  const visible = revealed[current.id] ?? 1;
  const currentAnswers = answers[current.id] ?? [];
  const currentNotes = notes[current.id] ?? [];
  const currentReviewed = reviewed[current.id] ?? [];
  const score = completedQuizScore(current.questions, currentAnswers);
  const readyForQuiz = current.stages.every((_, index) => currentReviewed.includes(String(index)));

  function answer(index: number, option: number) {
    if (currentAnswers[index] != null) return;
    const next = Array.from({ length: current.questions.length }, (_, i) => currentAnswers[i] ?? null);
    next[index] = option;
    setAnswers(value => ({ ...value, [current.id]: next }));
    const result = completedQuizScore(current.questions, next);
    if (result !== null) setScores(value => ({ ...value, [current.id]: Math.max(value[current.id] ?? 0, result) }));
  }
  function updateNote(index: number, text: string) {
    const next = Array.from({ length: current.stages.length }, (_, i) => currentNotes[i] ?? "");
    next[index] = text;
    setNotes(value => ({ ...value, [current.id]: next }));
  }
  function retry() {
    if (!window.confirm("重新训练本例将清空本轮分析底稿和答案，保留最高成绩。确定继续？")) return;
    setAnswers(value => ({ ...value, [current.id]: [] }));
    setNotes(value => ({ ...value, [current.id]: [] }));
    setReviewed(value => ({ ...value, [current.id]: [] }));
    setRevealed(value => ({ ...value, [current.id]: 1 }));
  }

  return <section className="flagship-lab">
    <div className="section-heading"><div><span>GUIDELINE-BASED WORKSHOP · TEACHING RECONSTRUCTION</span><h2>6个旗舰病例</h2></div><p>先记录判断，再对照参考边界。文字底稿与答案随进度保存在本设备；不上传患者信息。</p></div>
    <div className="flagship-layout">
      <aside>{flagshipCases.map(item => <button key={item.id} className={item.id === current.id ? "active" : ""} onClick={() => setActiveId(item.id)}><span>{item.id}{scores[item.id] !== undefined ? ` · 最高 ${scores[item.id]}/3` : ""}</span><b>{item.title}</b><small>{item.route}</small></button>)}</aside>
      <article className="flagship-case">
        <header><span>{current.id} · 分阶段分析底稿</span><h2>{current.title}</h2><p>{current.route}</p></header>
        <div className="flagship-provenance"><b>来源性质：规范驱动的教学情境，不是原始患者病例</b><p>{current.provenance}</p><small>{current.boundary} 本例尚未提供可核对到单一患者的完整原始数据，不能当作真实病例证据计数。</small></div>
        <div className="flagship-stages">{current.stages.slice(0, visible).map((stage, index) => {
          const shown = currentReviewed.includes(String(index));
          return <section key={stage.title}><span>{String(index + 1).padStart(2, "0")}</span><div>
            <h3>{stage.title}</h3><ul>{stage.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>
            <p className="stage-task"><b>本步任务：</b>{stage.task}</p>
            <label className="stage-note">我的分析底稿（请先写下判断与依据）
              <textarea rows={5} maxLength={10000} value={currentNotes[index] ?? ""} onChange={event => updateNote(index, event.target.value)} placeholder="当前结论是什么？依据支持到哪一步？哪些证据还缺失？下一步如何验证？请勿填写患者身份信息。" />
            </label>
            <small>底稿用于自我复盘，不以字数或关键词认定医学判断正确。</small>
            {shown ? <div className="stage-reference"><b>参考边界</b><p>{stage.answer}</p><p>请用原文核对适用性，再修订上方底稿。参考表达不是可直接出具的临床报告。</p></div>
              : <button className="secondary" disabled={!(currentNotes[index] ?? "").trim()} onClick={() => setReviewed(value => ({ ...value, [current.id]: [...currentReviewed, String(index)] }))}>保存判断并揭示参考</button>}
          </div></section>;
        })}</div>
        {visible < current.stages.length && <button className="primary flagship-next" disabled={!currentReviewed.includes(String(visible - 1))} onClick={() => setRevealed(value => ({ ...value, [current.id]: visible + 1 }))}>完成对照，进入下一阶段 →</button>}
        {visible === current.stages.length && !readyForQuiz && <p className="flagship-next">请完成各阶段分析并揭示参考后，进入最终审计。</p>}
        {readyForQuiz && <div className="flagship-quiz"><span>FINAL AUDIT · 3 GATES</span>
          {current.questions.map((question, index) => <section key={question.q}><h3>{index + 1}. {question.q}</h3>{question.options.map((option, optionIndex) => <button key={option} disabled={currentAnswers[index] != null} className={`${currentAnswers[index] === optionIndex ? "selected" : ""} ${currentAnswers[index] != null && question.answer === optionIndex ? "correct" : ""}`} onClick={() => answer(index, optionIndex)}>{String.fromCharCode(65 + optionIndex)}. {option}</button>)}{currentAnswers[index] != null && <p>{question.rationale}</p>}</section>)}
          <p role="status">{score === null ? "完成全部三题后记录本轮得分。" : `本轮 ${score}/3 · 历史最高 ${scores[current.id] ?? score}/3`}</p>
        </div>}
        <div className="flagship-sources"><b>规范依据与适用范围</b><p>以下来源支持分类方法与检测边界，不直接证明本例每项教学观察。请在底稿注明采用的章节、版本与检索日期。</p>{current.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
        <div className="flagship-next"><button className="secondary" onClick={retry}>重新训练本例（保留最高分）</button></div>
      </article>
    </div>
  </section>;
}
