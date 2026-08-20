"use client";

import { useEffect, useMemo, useState } from "react";
import { wgsCases, wgsExamBanks, wgsLessonCount, wgsModules, wgsSources, type WgsCase } from "./wgs-content";
import { wgsCaseWorkflowSteps } from "./sop-workflow";

type Tab = "overview" | "course" | "workflow" | "cases" | "exam" | "standards";
type ExamLevel = keyof typeof wgsExamBanks;
type StoredState = { completed?: string[]; revealed?: string[]; workflow?: string[]; caseScores?: Record<string, number>; lessonId?: string };

const channels = ["SNV / indel", "Non-coding", "CNV", "Aneuploidy", "SV", "LOH / ROH", "STR", "mtDNA"];
const tabs: Array<[Tab, string]> = [["overview", "专项首页"], ["course", "28课课程"], ["workflow", "15步工作流"], ["cases", "18例矩阵"], ["exam", "三级测验"], ["standards", "规范中心"]];

function SourceLinks({ keys }: { keys: string[] }) {
  return <div className="wgs-source-links">{keys.map((key) => wgsSources[key] ? <a key={key} href={wgsSources[key].url} target="_blank" rel="noreferrer">{wgsSources[key].label} ↗</a> : null)}</div>;
}

export default function WgsTrack() {
  const [tab, setTab] = useState<Tab>("overview");
  const [lessonId, setLessonId] = useState(wgsModules[0].lessons[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [workflow, setWorkflow] = useState<string[]>([]);
  const [caseId, setCaseId] = useState(wgsCases[0].id);
  const [caseStep, setCaseStep] = useState(0);
  const [caseAnswers, setCaseAnswers] = useState<Record<string, number[]>>({});
  const [caseScores, setCaseScores] = useState<Record<string, number>>({});
  const [setting, setSetting] = useState("全部");
  const [family, setFamily] = useState("全部");
  const [category, setCategory] = useState("全部");
  const [examLevel, setExamLevel] = useState<ExamLevel>("W1");
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("variant-atlas-wgs-track-v1") ?? "{}") as StoredState;
      /* eslint-disable react-hooks/set-state-in-effect -- hydrate local-only learning progress */
      if (saved.completed) setCompleted(saved.completed);
      if (saved.revealed) setRevealed(saved.revealed);
      if (saved.workflow) setWorkflow(saved.workflow);
      if (saved.caseScores) setCaseScores(saved.caseScores);
      if (saved.lessonId && wgsModules.some((module) => module.lessons.some((item) => item.id === saved.lessonId))) setLessonId(saved.lessonId);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch { /* ignore damaged local progress */ }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("variant-atlas-wgs-track-v1", JSON.stringify({ completed, revealed, workflow, caseScores, lessonId }));
  }, [completed, revealed, workflow, caseScores, lessonId]);

  const flatLessons = useMemo(() => wgsModules.flatMap((module) => module.lessons.map((item) => ({ ...item, module }))), []);
  const lessonIndex = Math.max(0, flatLessons.findIndex((item) => item.id === lessonId));
  const currentLesson = flatLessons[lessonIndex];
  const filteredCases = wgsCases.filter((item) => (setting === "全部" || item.setting === setting) && (family === "全部" || item.family === family) && (category === "全部" || item.category === category));
  const currentCase = filteredCases.find((item) => item.id === caseId) ?? filteredCases[0] ?? wgsCases[0];
  const categories = Array.from(new Set(wgsCases.map((item) => item.category)));
  const answered = caseAnswers[currentCase.id] ?? [];
  const currentGate = currentCase.gates[caseStep];
  const exam = wgsExamBanks[examLevel];
  const examScore = exam.filter((item) => examAnswers[item.id] === item.answer).length;
  const progress = Math.round((completed.length / wgsLessonCount) * 100);

  function openLesson(id: string) { setLessonId(id); setTab("course"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function selectCase(item: WgsCase) { setCaseId(item.id); setCaseStep(0); }
  function answerCase(option: number) {
    if (answered[caseStep] !== undefined) return;
    const next = [...answered]; next[caseStep] = option;
    setCaseAnswers((current) => ({ ...current, [currentCase.id]: next }));
    if (next.length === currentCase.gates.length) setCaseScores((current) => ({ ...current, [currentCase.id]: next.filter((value, index) => value === currentCase.gates[index].answer).length }));
  }

  return (
    <section className="wgs-track-page">
      <div className="wgs-track-hero">
        <div><span className="eyebrow">WHOLE GENOME SPECIALTY · GRCh38</span><h1>WGS不是更大的WES，<br />而是一组必须完整走过的分析通道。</h1><p>从病例问题出发，在序列、CNV、SV、LOH/ROH、STR和线粒体之间正确路由；每一条通道都要记录是否分析、结果可信度、报告位置与停止条件。</p><div className="wgs-hero-actions"><button className="primary" onClick={() => setTab("course")}>继续学习 · {progress}%</button><a href={wgsSources.ngs.url} target="_blank" rel="noreferrer">查看ACMG NGS标准 ↗</a></div></div>
        <aside><span>WGS完整训练轨道</span><strong>{wgsLessonCount}<small>课</small></strong><div><b>{wgsCaseWorkflowSteps.length}</b><small>病例工作流关口</small></div><div><b>{wgsCases.length}</b><small>高风险病例情境</small></div><div><b>3</b><small>级专项测验</small></div></aside>
      </div>
      <div className="wgs-boundary-banner"><b>公开学习边界</b><p>吸收WGS SOP的流程结构，但不复制企业系统、产品阈值、截图或固定报告语句。所有医学判断重新路由到现行公开规范。</p></div>
      <nav className="wgs-tabs" aria-label="WGS专项功能">{tabs.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</nav>

      {tab === "overview" && <><section className="wgs-preview-section"><div className="section-heading"><div><span>SPECIALTY CURRICULUM</span><h2>七个专项模块</h2></div><p>通用ACMG课程无需重学；WGS轨道集中训练新增的检测通道、证据边界和病例整合责任。</p></div><div className="wgs-module-grid">{wgsModules.map((module, index) => <article key={module.id}><button className="wgs-module-open" onClick={() => openLesson(module.lessons[0].id)}><span>{String(index + 1).padStart(2, "0")}</span><h3>{module.title}</h3><p>{module.subtitle}</p><small>{module.lessons.filter((item) => completed.includes(item.id)).length}/4课完成 · 逐步揭示</small></button></article>)}</div></section><section className="wgs-channel-preview"><div><span>CASE ROUTING</span><h2>先检查通道完整性，再解释阳性结果</h2><p>同一个WGS病例可以同时包含序列、CNV与结构变异线索。未开展、质量不足和未检出必须使用不同状态。</p></div><div className="wgs-channel-strip">{channels.map((item,index) => <span key={item}><i>{String(index+1).padStart(2,"0")}</i>{item}</span>)}</div></section><section className="wgs-overview-progress"><div><span>你的专项进度</span><strong>{progress}%</strong><i><b style={{ width: `${progress}%` }} /></i><p>{completed.length}/{wgsLessonCount}课 · {workflow.length}/{wgsCaseWorkflowSteps.length}关口 · {Object.keys(caseScores).length}/{wgsCases.length}例完成</p></div><button className="primary" onClick={() => setTab(completed.length ? "course" : "workflow")}>{completed.length ? "返回课程" : "先看病例工作流"} →</button></section></>}

      {tab === "course" && <div className="wgs-course-layout"><aside className="wgs-course-index">{wgsModules.map((module) => <section key={module.id}><header><span>{module.id}</span><b>{module.title}</b><small>{module.lessons.filter((item) => completed.includes(item.id)).length}/4</small></header>{module.lessons.map((item) => <button key={item.id} className={item.id === currentLesson.id ? "active" : ""} onClick={() => setLessonId(item.id)}><i>{completed.includes(item.id) ? "✓" : "○"}</i>{item.title}<small>{item.duration}</small></button>)}</section>)}</aside><article className="wgs-lesson-reader"><header><span>{currentLesson.module.id} · LESSON {String(lessonIndex + 1).padStart(2, "0")}/{wgsLessonCount}</span><h2>{currentLesson.title}</h2><p>{currentLesson.objective}</p><small>{currentLesson.duration}</small></header>{currentLesson.sections.map(([title, body], index) => <section key={title}><i>{String(index + 1).padStart(2, "0")}</i><div><h3>{title}</h3><p>{body}</p></div></section>)}<div className="wgs-checkpoint"><b>本课停止关口</b><p>{currentLesson.checkpoint}</p></div><div className="wgs-practice"><span>逐步揭示练习</span><h3>{currentLesson.practice.prompt}</h3><ol>{currentLesson.practice.tasks.map((task) => <li key={task}>{task}</li>)}</ol><button onClick={() => setRevealed((items) => items.includes(currentLesson.id) ? items.filter((id) => id !== currentLesson.id) : [...items, currentLesson.id])}>{revealed.includes(currentLesson.id) ? "收起参考边界" : "完成后揭示参考边界"}</button>{revealed.includes(currentLesson.id) && <p className="reveal">{currentLesson.practice.reveal}</p>}</div><SourceLinks keys={currentLesson.sourceKeys} /><footer><button className="secondary" disabled={lessonIndex === 0} onClick={() => setLessonId(flatLessons[Math.max(0, lessonIndex - 1)].id)}>← 上一课</button><button className={completed.includes(currentLesson.id) ? "secondary" : "primary"} onClick={() => { setCompleted((items) => items.includes(currentLesson.id) ? items.filter((id) => id !== currentLesson.id) : [...items, currentLesson.id]); if (lessonIndex < flatLessons.length - 1) setLessonId(flatLessons[lessonIndex + 1].id); }}>{completed.includes(currentLesson.id) ? "标记为未完成" : lessonIndex < flatLessons.length - 1 ? "完成并继续 →" : "完成专项课程"}</button></footer></article></div>}

      {tab === "workflow" && <section className="wgs-workflow-section"><div className="section-heading"><div><span>CASE WORKFLOW · 15 GATES</span><h2>WGS病例全流程十五步</h2></div><p>每一步同时记录决策、底稿和停止条件；未满足停止条件时，不把病例向下游“硬推”。</p></div><div className="wgs-workflow-grid">{wgsCaseWorkflowSteps.map((item, index) => <article key={item.id} className={workflow.includes(item.id) ? "complete" : ""}><header><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><button onClick={() => setWorkflow((items) => items.includes(item.id) ? items.filter((id) => id !== item.id) : [...items, item.id])}>{workflow.includes(item.id) ? "✓ 已核查" : "标记核查"}</button></header><p><b>决策</b>{item.decision}</p><p><b>底稿</b>{item.record}</p><p className="stop"><b>停止</b>{item.stop}</p></article>)}</div></section>}

      {tab === "cases" && <section className="wgs-cases-section"><div className="section-heading"><div><span>CASE COVERAGE MATRIX</span><h2>18例现实边界情境</h2></div><p>通过检测场景、家系结构和变异通道交叉筛选；每例包含三道逐步揭示的病例关口。</p></div><div className="wgs-case-filters"><select value={setting} onChange={(event) => setSetting(event.target.value)}><option>全部</option><option>产前</option><option>产后</option></select><select value={family} onChange={(event) => setFamily(event.target.value)}><option>全部</option><option>单人</option><option>三联体</option><option>扩展家系</option></select><select value={category} onChange={(event) => setCategory(event.target.value)}><option>全部</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><span>{filteredCases.length}例匹配</span></div><div className="wgs-case-layout"><aside className="wgs-case-grid">{filteredCases.map((item) => <button key={item.id} className={item.id === currentCase.id ? "active" : ""} onClick={() => selectCase(item)}><span>{item.id}{caseScores[item.id] !== undefined ? ` · ${caseScores[item.id]}/3` : ""}</span><b>{item.title}</b><small>{item.setting} · {item.family} · {item.channel}</small></button>)}</aside><article className="wgs-case-workspace"><header><span>{currentCase.id} · {currentCase.category}</span><h2>{currentCase.title}</h2><p>{currentCase.summary}</p></header><div className="wgs-case-facts"><b>逐步揭示的病例资料</b>{currentCase.facts.map((fact, index) => <p key={fact}><i>{index + 1}</i>{fact}</p>)}</div><div className="wgs-case-boundary"><b>高风险边界</b><p>{currentCase.boundary}</p></div><div className="wgs-gate"><span>CASE GATE {caseStep + 1}/3</span><h3>{currentGate.prompt}</h3><div>{currentGate.options.map((option, index) => { const selected = answered[caseStep] === index; const shown = answered[caseStep] !== undefined; return <button key={option} disabled={shown} className={`${selected ? "selected" : ""} ${shown && index === currentGate.answer ? "correct" : ""}`} onClick={() => answerCase(index)}>{String.fromCharCode(65 + index)}. {option}</button>; })}</div>{answered[caseStep] !== undefined && <p className={answered[caseStep] === currentGate.answer ? "correct" : "incorrect"}><b>{answered[caseStep] === currentGate.answer ? "判断正确" : "需要修正"}</b>{currentGate.rationale}</p>}<footer><button className="secondary" disabled={caseStep === 0} onClick={() => setCaseStep((step) => step - 1)}>上一关</button>{caseStep < 2 ? <button className="primary" disabled={answered[caseStep] === undefined} onClick={() => setCaseStep((step) => step + 1)}>下一关 →</button> : <button className="primary" disabled={answered.length < 3} onClick={() => setCaseStep(0)}>重新复盘</button>}</footer></div><SourceLinks keys={currentCase.sourceKeys} /></article></div></section>}

      {tab === "exam" && <section className="wgs-exam-section"><div className="section-heading"><div><span>WGS COMPETENCY CHECK</span><h2>三级专项测验</h2></div><p>W1检查通道与术语，W2检查专项规则路由，W3检查复杂病例整合。每级8题，达到7/8视为通过。</p></div><div className="wgs-exam-levels">{(["W1", "W2", "W3"] as ExamLevel[]).map((level) => <button key={level} className={examLevel === level ? "active" : ""} onClick={() => { setExamLevel(level); setExamAnswers({}); setExamSubmitted(false); }}><b>{level}</b><span>{level === "W1" ? "基础路由" : level === "W2" ? "专项判断" : "病例整合"}</span></button>)}</div><div className="wgs-exam-layout"><div>{exam.map((item, questionIndex) => <article className="wgs-exam-question" key={item.id}><header><span>{String(questionIndex + 1).padStart(2, "0")} · {item.tag}</span><h3>{item.q}</h3></header>{item.options.map((option, index) => <button key={option} className={`${examAnswers[item.id] === index ? "selected" : ""} ${examSubmitted && index === item.answer ? "correct" : ""}`} disabled={examSubmitted} onClick={() => setExamAnswers((answers) => ({ ...answers, [item.id]: index }))}>{String.fromCharCode(65 + index)}. {option}</button>)}{examSubmitted && <p className={examAnswers[item.id] === item.answer ? "correct" : "incorrect"}>{item.rationale}</p>}</article>)}</div><aside><span>{examLevel}专项结果</span><strong>{examSubmitted ? examScore : Object.keys(examAnswers).length}<small>/8</small></strong><p>{examSubmitted ? examScore >= 7 ? "本级通过。请继续下一级，或回到病例矩阵巩固边界。" : "本级尚未通过。按错题标签返回对应课程复习。" : "完成全部8题后提交；答案只保存在当前浏览器。"}</p><button className="primary" disabled={Object.keys(examAnswers).length < exam.length || examSubmitted} onClick={() => setExamSubmitted(true)}>提交本级测验</button>{examSubmitted && <button className="secondary" onClick={() => { setExamAnswers({}); setExamSubmitted(false); }}>重新作答</button>}</aside></div></section>}

      {tab === "standards" && <section className="wgs-standards-section"><div className="section-heading"><div><span>CURRENT PUBLIC ROUTING</span><h2>规范中心：先判断适用范围，再引用版本</h2></div><p>这里保存公开规范入口与应用边界。网站不把产品阈值、内部算法标签或固定报告用语冒充通用标准。</p></div><div className="wgs-standards-grid">{Object.entries(wgsSources).map(([key, source]) => <a key={key} href={source.url} target="_blank" rel="noreferrer"><span>{key.toUpperCase()}</span><h3>{source.label}</h3><p>{key === "cnv" ? "宪法性拷贝数变异五部分评分与五级分类。" : key === "sv" ? "生殖系结构变异检测、确认与报告的技术考虑。" : key === "mt" ? "线粒体变异的专项证据规格与异质性语境。" : key === "dm1" ? "DMPK重复扩增的疾病特异检测与报告边界。" : key === "sf" ? "当前二级发现清单与可报告范围入口。" : "用于当前主题的公开方法学或分类依据。"}</p><b>打开原始来源 ↗</b></a>)}</div><div className="wgs-threshold-warning"><b>阈值使用规则</b><p>覆盖、VAF、CNV大小、caller分值、重复数可测范围和嵌合检出限必须来自本实验室经验证的方法与版本。公开学习材料提供“应记录什么、何时停止”，不提供可直接移植到临床生产的产品阈值。</p></div></section>}
    </section>
  );
}
