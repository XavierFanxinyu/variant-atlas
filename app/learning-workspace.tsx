"use client";

import { useEffect, useMemo, useState } from "react";

type View = "dashboard" | "case" | "rules" | "roadmap" | "courses" | "library" | "exam" | "mistakes";
type CaseAnswer = { inheritance: string; evidence: string[]; classification: string; report: string };

const modules = [
  { no: "01", title: "表型与遗传模式", meta: "6 节 · 约 120 分钟", progress: 33 },
  { no: "02", title: "质量控制与候选筛选", meta: "7 节 · 约 140 分钟", progress: 0 },
  { no: "03", title: "HGVS 与转录本", meta: "5 节 · 约 100 分钟", progress: 0 },
  { no: "04", title: "ACMG / AMP 证据", meta: "12 节 · 约 240 分钟", progress: 8 },
  { no: "05", title: "病例级综合解释", meta: "6 节 · 约 120 分钟", progress: 0 },
  { no: "06", title: "报告撰写", meta: "5 节 · 约 100 分钟", progress: 0 },
];

const lessons = [
  {
    id: "phenotype",
    no: "01",
    title: "表型不是关键词清单",
    duration: "20 分钟",
    objective: "把临床资料转成可用于候选排序的结构化表型，并避免把缺失记录误作阴性表型。",
    sections: [
      ["先建立病例时间线", "记录起病年龄、进展方式、系统受累和检查时间。相同HPO术语在不同年龄出现，诊断信息量可能完全不同。"],
      ["区分阳性、阴性与未知", "只有经过针对性评估且明确未见的表现才能作为阴性表型；病历中没有写到，不等于不存在。"],
      ["给表型分层", "核心表型决定疾病谱，支持表型帮助排序，常见非特异表现不应支配分析。优先保留能区分相似疾病的术语。"],
      ["让表型服务于遗传假设", "表型整理的结果应落到疾病谱、遗传模式和可检出变异类型，而不是停留在HPO数量。"],
    ],
    checkpoint: "父母表型正常时，不能直接排除常染色体显性遗传；还需考虑de novo、不完全外显和轻型表现。",
  },
  {
    id: "quality",
    no: "02",
    title: "候选变异先过质量关",
    duration: "20 分钟",
    objective: "在讨论致病性之前，判断变异是否真实、基因型是否可信、检测是否覆盖关键机制。",
    sections: [
      ["质量指标是线索，不是判决", "DP、GQ、AD和VAF需要结合位点环境、捕获表现、比对质量及家系数据共同阅读。"],
      ["三联体中的de novo", "低比例替代读段、父母低覆盖、样本污染或亲缘关系错误都可能制造假新生结果；必要时查看原始读段并正交验证。"],
      ["识别技术盲区", "WES对部分外显子、重复区域、同源基因、低比例嵌合、复杂SV和重复扩增能力有限。阴性结果不等于排除遗传病。"],
      ["验证建议要回答问题", "Sanger或其他方法应针对变异真实性、相位、来源或结构改变进行验证，不能用一句笼统的“建议验证”结束。"],
    ],
    checkpoint: "先确认变异存在，再讨论变异意义；技术质量证据不能替代致病性证据。",
  },
  {
    id: "hgvs",
    no: "03",
    title: "坐标、转录本与HGVS",
    duration: "20 分钟",
    objective: "在GRCh38体系中稳定识别同一变异，并避免因转录本选择改变功能后果。",
    sections: [
      ["完整描述必须可复现", "记录参考基因组版本、染色体坐标、参考/替代等位基因、带版本号的转录本以及c.和p.描述。"],
      ["优先但不盲从MANE", "MANE Select有利于跨资源一致性；若疾病机制依赖其他临床相关转录本，应说明选择依据。"],
      ["一个变异可有多种表示", "不同基因组版本和转录本会产生不同坐标与HGVS。检索前先完成标准化，并核对链方向。"],
      ["预测蛋白后果要加括号", "未经RNA或蛋白实验确认的结果使用预测表达，例如p.(Arg408Trp)，并避免把预测剪接后果写成已证实事实。"],
    ],
    checkpoint: "数据库命中前先确认它与当前变异使用同一参考序列、版本、等位基因和疾病实体。",
  },
  {
    id: "acmg",
    no: "04",
    title: "ACMG证据不是打勾表",
    duration: "25 分钟",
    objective: "理解证据代码背后的机制、强度和独立性，优先路由到适用的ClinGen/VCEP规范。",
    sections: [
      ["先问有没有特异规范", "若某基因或疾病已有ClinGen VCEP规范，阈值和强度可能与通用规则不同，应优先采用其当前有效版本。"],
      ["每条证据写完整理由", "理由至少回答数据来自哪里、是否适用当前疾病机制、为何达到该强度、是否存在反证。"],
      ["避免重复计算", "多个预测工具不是多条独立证据；RNA结果与由同一结果推导出的PVS1/PP3也可能相关，需按相应规范处理。"],
      ["数据库结论不是自动证据", "ClinVar可用于定位提交和专家结论，但不能把多个提交数量直接当作独立病例，也不应机械使用PP5/BP6。"],
    ],
    checkpoint: "分类是针对明确的基因—疾病—遗传模式组合，而不是给变异贴一个脱离语境的永久标签。",
  },
  {
    id: "case-level",
    no: "05",
    title: "从变异分类到病例结论",
    duration: "20 分钟",
    objective: "分别判断变异致病性、基因—疾病有效性和该变异解释患者表型的程度。",
    sections: [
      ["三层结论必须拆开", "致病变异只有在疾病实体、遗传模式、合子状态和患者表型匹配时，才可能支持分子诊断。"],
      ["隐性病看两条等位基因", "两条变异需分别分类，并核查是否反式、是否符合疾病机制；单个致病等位基因通常仅能说明携带状态或部分解释。"],
      ["允许部分解释和双重诊断", "单一诊断不能解释全部核心表型时，不应强行扩展；应考虑第二诊断、表型扩展或非遗传因素。"],
      ["VUS保持不确定", "VUS可以引导验证或重分析，但不应单独用于确诊、预测无症状亲属或做不可逆临床决定。"],
    ],
    checkpoint: "报告中的“支持诊断”必须明确支持什么疾病、解释哪些表型，以及仍有哪些表现未解释。",
  },
  {
    id: "report",
    no: "06",
    title: "把证据写成克制的报告",
    duration: "20 分钟",
    objective: "形成结构完整、措辞有限定、来源可追溯且能支持后续临床行动的报告。",
    sections: [
      ["先写事实，再写解释", "报告顺序建议为检测发现、规范描述、合子状态与来源、分类依据、病例相关性、验证与咨询建议。"],
      ["避免结论越界", "区分“变异为致病”“与表型吻合”“支持分子诊断”；不要把实验室结果写成完整临床诊断。"],
      ["阴性也要可解释", "说明检测范围、未覆盖机制、残余风险和可考虑的下一步，而不是简单写“未发现致病变异”。"],
      ["保留证据快照", "记录指南版本、数据库检索日期和关键文献。未来重分析必须能理解当时为什么得到该结论。"],
    ],
    checkpoint: "一份好报告既告诉读者发现了什么，也清楚告诉读者这项检测不能证明什么。",
  },
];

const caseLibrary = [
  { id: "001", title: "Noonan综合征", gene: "PTPN11", mode: "AD · de novo", focus: "PS2 / 功能证据 / 病例相关性", status: "开放", tone: "live", source: "ClinGen RASopathy VCEP" },
  { id: "002", title: "苯丙酮尿症", gene: "PAH", mode: "AR · 复合杂合", focus: "PM3 / 两等位基因 / 反式", status: "证据已核查", tone: "verified", source: "ClinGen PAH VCEP" },
  { id: "003", title: "家族性高胆固醇血症", gene: "LDLR", mode: "AD · 家系", focus: "PVS1强度 / RNA / 共分离", status: "证据已核查", tone: "verified", source: "ClinGen FH VCEP" },
  { id: "004", title: "终末外显子截短变异", gene: "待选VCEP基因", mode: "AD", focus: "PVS1降级 / NMD / 转录本", status: "选例复核中", tone: "review", source: "ClinGen SVI PVS1" },
  { id: "005", title: "非经典剪接变异", gene: "待选VCEP基因", mode: "AD或AR", focus: "剪接预测 / RNA / 证据依赖", status: "选例复核中", tone: "review", source: "ClinGen SVI Splicing" },
  { id: "006", title: "ClinVar分类冲突", gene: "待选专家组变异", mode: "多来源", focus: "提交层级 / 时间 / VUS边界", status: "选例复核中", tone: "review", source: "ClinVar + 原始文献" },
  { id: "007", title: "疑似测序伪影", gene: "同源或低复杂区域", mode: "单人WES", focus: "VAF / IGV / 正交验证", status: "技术素材准备中", tone: "planned", source: "公开技术标准" },
  { id: "008", title: "阴性与双重诊断", gene: "多基因", mode: "三联体WES", focus: "部分解释 / 重分析 / 检测盲区", status: "病例筛选中", tone: "planned", source: "公开病例系列" },
];

const examQuestions = [
  { q: "父母表型正常、先证者疑似显性病时，首要正确表述是？", options: ["排除显性遗传", "重点考虑de novo，同时保留不完全外显等可能", "只筛隐性纯合", "父母无需纳入分析"], answer: 1, tag: "遗传模式" },
  { q: "多个计算工具均预测有害，应如何使用？", options: ["每个工具各计一次PP3", "直接升级为PS3", "按经校准的组合/阈值使用一次，避免重复计分", "等同于功能实验"], answer: 2, tag: "证据独立性" },
  { q: "隐性病检出一条致病变异和一条VUS，最稳妥的病例结论是？", options: ["已经确诊", "VUS自动升级", "需核查相位与第二变异证据，通常不能仅据此确诊", "两条变异一定反式"], answer: 2, tag: "病例级解释" },
  { q: "ClinVar存在专家组分类时，正确做法是？", options: ["只复制五级分类", "核查疾病实体、规范版本、证据摘要和当前适用性", "按提交数量投票", "将所有提交都作为PS4病例"], answer: 1, tag: "数据库检索" },
  { q: "WES阴性结果最恰当的报告方式是？", options: ["排除遗传病", "未发现可报告变异，并说明检测限制和后续方向", "不写任何限制", "等同于良性"], answer: 1, tag: "报告写作" },
];

const rules = [
  ["PVS1", "功能缺失变异", "先判断基因疾病机制，再按转录本、NMD及外显子位置调整强度。", "ClinGen SVI"],
  ["PS2 / PM6", "新生变异", "亲子关系确认、表型一致性及其他候选原因共同决定证据强度。", "ClinGen SVI v1.1"],
  ["PS3 / BS3", "功能实验", "实验必须经过验证并能反映疾病机制，不能只凭论文声称“有影响”。", "ClinGen SVI"],
  ["PM2", "人群数据库缺失或极低频", "按现行建议仅作支持级证据；数据库覆盖与祖源必须匹配。", "ClinGen SVI v1.0"],
  ["PP3 / BP4", "计算预测", "使用经校准的工具和阈值，避免多个预测工具重复计分。", "ClinGen SVI"],
  ["PP1 / BS4", "共分离证据", "按有效减数分裂次数及疾病外显率评价，而不是简单数家系成员。", "ClinGen SVI"],
];

const caseSteps = ["病例资料", "表型整理", "遗传模式", "候选比较", "证据赋值", "综合分类", "报告撰写"];
const evidenceOptions = ["PS2_VeryStrong", "PS3", "PM2_Supporting", "PP1_Strong", "PP3", "PP4"];

export default function LearningWorkspace() {
  const [view, setView] = useState<View>("dashboard");
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [answer, setAnswer] = useState<CaseAnswer>({ inheritance: "", evidence: [], classification: "", report: "" });
  const [lessonId, setLessonId] = useState("phenotype");
  const [lessonDone, setLessonDone] = useState<string[]>([]);
  const [examAnswers, setExamAnswers] = useState<number[]>(Array(examQuestions.length).fill(-1));
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [mistakes, setMistakes] = useState<string[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("variant-atlas-demo");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setStep(state.step ?? 0);
        setAnswer(state.answer ?? answer);
        setLessonDone(state.lessonDone ?? []);
        setMistakes(state.mistakes ?? []);
      } catch { /* ignore a damaged local draft */ }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("variant-atlas-demo", JSON.stringify({ step, answer, lessonDone, mistakes }));
  }, [step, answer, lessonDone, mistakes]);

  const score = useMemo(() => {
    let value = 0;
    if (answer.inheritance === "AD") value += 20;
    const expected = ["PS2_VeryStrong", "PS3", "PP1_Strong", "PP3"];
    value += expected.filter((item) => answer.evidence.includes(item)).length * 10;
    if (answer.classification === "Pathogenic") value += 20;
    if (answer.report.length >= 60) value += 20;
    return Math.min(value, 100);
  }, [answer]);

  const examScore = useMemo(() => examQuestions.reduce((total, question, index) => total + (examAnswers[index] === question.answer ? 20 : 0), 0), [examAnswers]);

  const activeLesson = lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];

  function submitExam() {
    const nextMistakes = examQuestions.filter((question, index) => examAnswers[index] !== question.answer).map((question) => question.tag);
    setMistakes(Array.from(new Set([...mistakes, ...nextMistakes])));
    setExamSubmitted(true);
  }

  function navigate(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleEvidence(item: string) {
    setAnswer((current) => ({
      ...current,
      evidence: current.evidence.includes(item)
        ? current.evidence.filter((value) => value !== item)
        : [...current.evidence, item],
    }));
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("dashboard")} aria-label="返回学习首页">
          <span className="brand-mark">VA</span>
          <span><strong>Variant Atlas</strong><small>遗传解读训练</small></span>
        </button>
        <nav aria-label="主导航">
          <button className={view === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")}>学习台</button>
          <button className={view === "courses" ? "active" : ""} onClick={() => navigate("courses")}>课程</button>
          <button className={view === "rules" ? "active" : ""} onClick={() => navigate("rules")}>证据规则</button>
          <button className={view === "library" || view === "case" ? "active" : ""} onClick={() => navigate("library")}>病例库</button>
          <button className={view === "exam" ? "active" : ""} onClick={() => navigate("exam")}>测验</button>
        </nav>
        <div className="profile"><span>L1</span><div><b>基础识别</b><small>个人学习空间</small></div></div>
      </header>

      <main>
        {view === "dashboard" && (
          <>
            <section className="hero-grid">
              <div className="hero-copy">
                <span className="eyebrow">WES / WGS · 单基因病诊断</span>
                <h1>把每条证据，<br />落到一个真实判断上。</h1>
                <p>从GRCh38候选变异出发，练习表型、遗传模式、ACMG证据与报告写作。每一步先判断，再查看规范依据。</p>
                <div className="hero-actions">
                  <button className="primary" onClick={() => navigate("case")}>继续样板病例 <span>→</span></button>
                  <button className="secondary" onClick={() => navigate("courses")}>进入核心课程</button>
                </div>
              </div>
              <div className="case-card featured">
                <div className="card-top"><span>正在学习</span><b>CASE 001</b></div>
                <h2>三联体中的<br />Noonan综合征</h2>
                <p>新生变异 · 常染色体显性 · PTPN11</p>
                <div className="case-meta"><span>当前进度</span><strong>{step + 1} / 7</strong></div>
                <div className="progress"><i style={{ width: `${((step + 1) / 7) * 100}%` }} /></div>
                <button onClick={() => navigate("case")}>进入病例工作台 <span>↗</span></button>
              </div>
            </section>

            <section className="metrics" aria-label="学习概况">
              <div><span>学习路径</span><strong>6<small> 个模块</small></strong></div>
              <div><span>病例矩阵</span><strong>8<small> 个训练情境</small></strong></div>
              <div><span>证据掌握</span><strong>6<small> 张核心卡片</small></strong></div>
              <div><span>证据快照</span><strong>2026<small>-08-13</small></strong></div>
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span>CURRICULUM</span><h2>学习路径</h2></div><p>每节约20分钟。统计基础可快速通过，重点训练分子机制和证据适用边界。</p></div>
              <div className="module-grid">
                {modules.map((module) => (
                  <article className="module-card module-action" key={module.no} onClick={() => { setLessonId(lessons[Number(module.no) - 1].id); navigate("courses"); }}>
                    <span className="module-no">{module.no}</span><h3>{module.title}</h3><p>{module.meta}</p>
                    <div className="mini-progress"><i style={{ width: `${module.progress}%` }} /></div>
                    <small>{module.progress ? `${module.progress}% 已完成` : "尚未开始"}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-tools">
              <button onClick={() => navigate("library")}><span>CASE MATRIX</span><b>查看8例覆盖矩阵</b><small>开放病例、已核查证据与待审核边界病例</small></button>
              <button onClick={() => navigate("exam")}><span>ASSESSMENT</span><b>完成L1阶段测验</b><small>5题即时反馈，错误自动进入错题本</small></button>
              <button onClick={() => navigate("mistakes")}><span>REVIEW</span><b>查看错题本</b><small>{mistakes.length ? `${mistakes.length} 个待巩固主题` : "暂无错题，先完成阶段测验"}</small></button>
            </section>

            <section className="principle-strip">
              <div><span className="pulse" />证据原则</div>
              <p>变异致病性 ≠ 病例诊断。平台始终分开评价变异、基因—疾病关系和患者表型相关性。</p>
              <button onClick={() => navigate("roadmap")}>查看能力标准 →</button>
            </section>
          </>
        )}

        {view === "courses" && (
          <section className="course-workspace">
            <aside className="course-index">
              <span className="eyebrow">CORE COURSE</span><h1>核心课程</h1><p>每节约20分钟，完成后保存在本机。</p>
              {lessons.map((lesson) => <button className={lesson.id === activeLesson.id ? "active" : ""} onClick={() => setLessonId(lesson.id)} key={lesson.id}><span>{lessonDone.includes(lesson.id) ? "✓" : lesson.no}</span><div><b>{lesson.title}</b><small>{lesson.duration}</small></div></button>)}
            </aside>
            <article className="lesson-reader">
              <div className="lesson-meta"><span>MODULE {activeLesson.no}</span><b>{activeLesson.duration}</b></div>
              <h1>{activeLesson.title}</h1><p className="lesson-objective">学习目标：{activeLesson.objective}</p>
              {activeLesson.sections.map(([title, body], index) => <section key={title}><span>{String(index + 1).padStart(2,"0")}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}
              <div className="lesson-checkpoint"><b>本节检查点</b><p>{activeLesson.checkpoint}</p></div>
              <div className="lesson-actions"><button className="secondary" onClick={() => navigate("rules")}>查看关联证据</button><button className="primary" onClick={() => setLessonDone(Array.from(new Set([...lessonDone, activeLesson.id])))}>{lessonDone.includes(activeLesson.id) ? "已完成 ✓" : "标记本节完成"}</button></div>
            </article>
          </section>
        )}

        {view === "library" && (
          <section className="page-section">
            <div className="page-intro"><span className="eyebrow">CASE MATRIX</span><h1>病例覆盖矩阵</h1><p>第一例已开放完整作答；其余病例只有完成来源、HGVS、疾病机制与答案版本审核后才会解锁。</p></div>
            <div className="library-grid">{caseLibrary.map((item) => <article className={`library-card ${item.tone}`} key={item.id}><div className="library-top"><span>CASE {item.id}</span><b>{item.status}</b></div><h2>{item.title}</h2><p className="gene-label">{item.gene} · {item.mode}</p><div className="focus-box"><span>训练重点</span><p>{item.focus}</p></div><small>主要依据：{item.source}</small>{item.id === "001" ? <button onClick={() => navigate("case")}>开始完整病例 →</button> : item.id === "002" ? <a href="https://www.ncbi.nlm.nih.gov/clinvar/RCV000000607/" target="_blank">查看专家组公开记录 ↗</a> : item.id === "003" ? <a href="https://www.ncbi.nlm.nih.gov/clinvar/RCV000003934/" target="_blank">查看专家组公开记录 ↗</a> : <button disabled>审核完成后开放</button>}</article>)}</div>
            <div className="matrix-legend"><span><i className="dot live"/>可作答</span><span><i className="dot verified"/>证据已核查，交互待制作</span><span><i className="dot review"/>选例与证据审核中</span><span><i className="dot planned"/>素材准备中</span></div>
          </section>
        )}

        {view === "exam" && (
          <section className="page-section exam-page">
            <div className="page-intro"><span className="eyebrow">L1 ASSESSMENT</span><h1>基础识别阶段测验</h1><p>每题20分。提交后显示依据，错误主题自动进入本机错题本。</p></div>
            <div className="exam-layout"><div className="exam-questions">{examQuestions.map((question, qIndex) => <article className="exam-card" key={question.q}><span>QUESTION {qIndex + 1}</span><h2>{question.q}</h2><div>{question.options.map((option, optionIndex) => <button className={examAnswers[qIndex] === optionIndex ? "selected" : ""} onClick={() => { const next=[...examAnswers]; next[qIndex]=optionIndex; setExamAnswers(next); setExamSubmitted(false); }} key={option}><i>{String.fromCharCode(65 + optionIndex)}</i>{option}</button>)}</div>{examSubmitted && <Feedback ok={examAnswers[qIndex] === question.answer}>{examAnswers[qIndex] === question.answer ? "回答正确。" : `正确答案：${question.options[question.answer]}。`}</Feedback>}</article>)}</div><aside className="exam-summary"><span>作答进度</span><strong>{examAnswers.filter(value => value >= 0).length}<small> / 5</small></strong><div className="mini-progress"><i style={{width:`${examAnswers.filter(value => value >= 0).length * 20}%`}}/></div><button className="primary" disabled={examAnswers.some(value => value < 0)} onClick={submitExam}>提交测验</button>{examSubmitted && <div className="exam-result"><span>得分</span><b>{examScore}</b><small>/100</small><button onClick={() => navigate("mistakes")}>查看错题本 →</button></div>}</aside></div>
          </section>
        )}

        {view === "mistakes" && (
          <section className="page-section">
            <div className="page-intro"><span className="eyebrow">REVIEW BOOK</span><h1>错题本</h1><p>错题按能力主题聚合，避免只记住某一道题的选项。</p></div>
            {mistakes.length ? <div className="mistake-list">{mistakes.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2,"0")}</span><div><h2>{item}</h2><p>{item === "遗传模式" ? "复习de novo、不完全外显、表现度差异及父母低比例嵌合。" : item === "证据独立性" ? "复习预测证据、功能证据及同一底层数据的重复计分风险。" : item === "病例级解释" ? "复习隐性病相位、两等位基因分别分类和VUS边界。" : item === "数据库检索" ? "复习ClinVar提交层级、专家组规范、疾病实体和更新日期。" : "复习阴性结果的残余风险、检测盲区和下一步建议。"}</p></div><button onClick={() => navigate(item === "数据库检索" || item === "证据独立性" ? "rules" : "courses")}>开始复习 →</button></article>)}</div> : <div className="empty-state"><span>✓</span><h2>目前没有错题</h2><p>完成阶段测验后，错误主题会自动汇总到这里。</p><button className="primary" onClick={() => navigate("exam")}>开始测验</button></div>}
          </section>
        )}

        {view === "rules" && (
          <section className="page-section">
            <div className="page-intro"><span className="eyebrow">EVIDENCE LAB</span><h1>证据规则实验室</h1><p>基础框架来自ACMG/AMP 2015；具体应用优先遵循ClinGen SVI及适用的VCEP规范。</p></div>
            <div className="rule-grid">
              {rules.map(([code, title, body, source]) => <article className="rule-card" key={code}><div><b>{code}</b><span>{source}</span></div><h2>{title}</h2><p>{body}</p><button onClick={() => navigate("case")}>在病例中练习 →</button></article>)}
            </div>
            <div className="sources-panel"><h2>证据版本与来源</h2><ul><li><a href="https://www.acmg.net/docs/standards_guidelines_for_the_interpretation_of_sequence_variants.pdf" target="_blank">ACMG/AMP sequence variant interpretation guideline（2015）</a></li><li><a href="https://www.clinicalgenome.org/tools/clingen-variant-classification-guidance/" target="_blank">ClinGen Variant Classification Guidance</a></li><li><a href="https://clinicalgenome.org/affiliation/50021/" target="_blank">ClinGen RASopathy Variant Curation Expert Panel</a></li><li><a href="https://varnomen.hgvs.org/" target="_blank">HGVS Nomenclature Recommendations</a></li></ul><p>检索快照：2026-08-13。动态数据库内容须在实际工作中重新核查。</p></div>
          </section>
        )}

        {view === "case" && (
          <section className="case-workspace">
            <aside className="case-sidebar">
              <button className="back" onClick={() => navigate("dashboard")}>← 返回学习台</button>
              <span className="eyebrow">CASE 001 · 公开证据教学病例</span><h1>Noonan综合征</h1><p>三联体WES · GRCh38</p>
              <ol>{caseSteps.map((item, index) => <li className={index === step ? "current" : index < step ? "done" : ""} key={item}><button onClick={() => index <= step && setStep(index)}><span>{index < step ? "✓" : index + 1}</span>{item}</button></li>)}</ol>
              <div className="snapshot"><b>证据快照</b><span>2026-08-13</span><small>答案按该日期锁定</small></div>
            </aside>
            <div className="case-main">
              <div className="case-status"><span>步骤 {step + 1} / 7</span><div><i style={{ width: `${((step + 1) / 7) * 100}%` }} /></div></div>
              {step === 0 && <CaseBlock title="病例资料" lead="先形成疾病谱假设，不急于看变异。"><div className="clinical-note"><b>先证者</b><p>6岁男童，身高低于同龄儿，肺动脉瓣狭窄，眼距宽、睑裂下斜，胸廓异常。父母表型正常，无类似家族史。</p><b>检测</b><p>先证者及父母三联体WES。性别及亲缘关系质控支持申报关系；未见明显污染。</p></div><PromptBox>哪些阳性和阴性HPO术语最能帮助后续筛选？进入下一步查看结构化表型。</PromptBox></CaseBlock>}
              {step === 1 && <CaseBlock title="表型整理" lead="区分核心表型、支持表型和真正有信息量的阴性表型。"><div className="hpo-grid"><span>HP:0001642<br/><b>肺动脉瓣狭窄</b></span><span>HP:0004322<br/><b>身材矮小</b></span><span>HP:0000316<br/><b>眼距过宽</b></span><span>HP:0000768<br/><b>胸廓异常</b></span></div><PromptBox>心脏表型与特征性面容组合指向RASopathy谱系；父母表型正常不能单独排除显性遗传。</PromptBox></CaseBlock>}
              {step === 2 && <CaseBlock title="遗传模式假设" lead="选择最符合病例与三联体结构的首要模式。"><ChoiceRow options={[['AD','常染色体显性 / de novo'],['AR','常染色体隐性'],['XL','X连锁'],['MT','线粒体遗传']]} value={answer.inheritance} onChange={(value) => setAnswer({...answer, inheritance:value})}/>{checked && <Feedback ok={answer.inheritance === "AD"}>{answer.inheritance === "AD" ? "正确。该表型谱首先考虑常染色体显性RASopathy；父母正常使de novo机制成为重要假设。" : "需要重看表型组合。Noonan综合征主要相关基因多为常染色体显性，三联体重点检索de novo变异。"}</Feedback>}</CaseBlock>}
              {step === 3 && <CaseBlock title="候选变异比较" lead="候选列表是教学用精简结果，暂不代表完整VCF过滤。"><div className="variant-table"><div className="head"><span>基因 / 变异</span><span>遗传</span><span>质量</span><span>表型</span></div><div className="selected"><span><b>PTPN11</b><small>NM_002834.5:c.922A&gt;G<br/>p.(Asn308Asp)</small></span><span>de novo<br/>杂合</span><span>DP 86<br/>VAF 0.51</span><span>强匹配</span></div><div><span><b>USH2A</b><small>杂合错义</small></span><span>父源</span><span>通过</span><span>不匹配</span></div><div><span><b>TTN</b><small>杂合错义</small></span><span>母源</span><span>通过</span><span>弱匹配</span></div></div><PromptBox>PTPN11变异位于GRCh38 chr12:112477719，MANE Select转录本为NM_002834.5。ClinVar中由RASopathy专家组评审为致病。</PromptBox></CaseBlock>}
              {step === 4 && <CaseBlock title="证据赋值" lead="请选择能由当前公开证据支持的代码；注意不重复计算。"><div className="evidence-picker">{evidenceOptions.map(item => <button className={answer.evidence.includes(item) ? "chosen" : ""} onClick={() => toggleEvidence(item)} key={item}>{item}<span>{answer.evidence.includes(item) ? "✓" : "+"}</span></button>)}</div>{checked && <Feedback ok={answer.evidence.includes("PS2_VeryStrong") && answer.evidence.includes("PS3")}>专家组历史分类使用PS2_VeryStrong、PS3、PP1_Strong、PP3等证据。PM2在现有人群数据中需要按最新数据和当前规范重新判断，不能照抄2017年的ExAC结论；PP4也需避免与病例选择造成重复强化。</Feedback>}<div className="citation-note"><b>教学要点</b><p>本题展示“读取专家组既有分类”，不是让单个新病例重复创造PS2_VeryStrong。提交日期、患者是否重复、功能实验质量都必须核查。</p></div></CaseBlock>}
              {step === 5 && <CaseBlock title="综合分类" lead="分类针对PTPN11—Noonan综合征这一明确疾病关系。"><ChoiceRow options={[['Pathogenic','致病'],['Likely pathogenic','可能致病'],['VUS','意义未明'],['Likely benign','可能良性']]} value={answer.classification} onChange={(value) => setAnswer({...answer, classification:value})}/>{checked && <Feedback ok={answer.classification === "Pathogenic"}>{answer.classification === "Pathogenic" ? "与ClinGen RASopathy VCEP专家组结论一致：Pathogenic。" : "该变异已有ClinGen专家组针对Noonan综合征的致病分类；应优先核查并采用适用的VCEP规范。"}</Feedback>}<div className="three-levels"><div><span>1</span><b>变异</b><p>对Noonan综合征为致病</p></div><div><span>2</span><b>疾病关系</b><p>PTPN11—Noonan：明确</p></div><div><span>3</span><b>病例相关性</b><p>遗传模式与表型高度匹配</p></div></div></CaseBlock>}
              {step === 6 && <CaseBlock title="报告撰写" lead="用限定清晰、可追溯的语言完成病例级结论。"><textarea value={answer.report} onChange={(event) => setAnswer({...answer, report:event.target.value})} placeholder="建议包含：检测发现、转录本与HGVS、合子状态和来源、分类与证据摘要、表型相关性、验证及遗传咨询提示……"/><div className="report-checks"><span className={answer.report.includes("PTPN11") ? "met" : ""}>PTPN11</span><span className={answer.report.includes("c.922") ? "met" : ""}>完整HGVS</span><span className={answer.report.length >= 60 ? "met" : ""}>结论充分</span><span className={answer.report.includes("验证") ? "met" : ""}>验证建议</span></div>{checked && <Feedback ok={answer.report.length >= 60}>参考表达：检测到PTPN11基因NM_002834.5:c.922A&gt;G [p.(Asn308Asp)]杂合变异，三联体结果支持新生来源。该变异经ClinGen RASopathy专家组评审为致病，患者表型及遗传模式与Noonan综合征高度吻合，支持建立分子诊断。建议结合临床表现，按实验室流程确认变异及亲缘关系并进行遗传咨询。</Feedback>}</CaseBlock>}
              <div className="case-actions"><button className="secondary" disabled={step === 0} onClick={() => {setStep(Math.max(0, step - 1));setChecked(false)}}>上一步</button><button className="check" onClick={() => setChecked(true)}>检查本步</button><button className="primary" disabled={step === 6} onClick={() => {setStep(Math.min(6, step + 1));setChecked(false)}}>保存并继续 →</button></div>
              {step === 6 && checked && <div className="score-card"><span>本次练习得分</span><strong>{score}</strong><small>/ 100</small><p>这是规则化形成性评价，不代表职业资质或临床授权。</p></div>}
            </div>
          </section>
        )}

        {view === "roadmap" && (
          <section className="page-section roadmap">
            <div className="page-intro"><span className="eyebrow">COMPETENCY MAP</span><h1>独立解读能力地图</h1><p>认证只表示站内训练水平，不等同于临床遗传学职业资格。</p></div>
            <div className="level-list"><article><span>L1</span><div><h2>基础识别</h2><p>理解遗传模式、HGVS、检测边界和五级分类。</p></div><b>当前</b></article><article><span>L2</span><div><h2>证据评估</h2><p>能判断单条证据的适用性、强度和重复计分风险。</p></div><b>待解锁</b></article><article><span>L3</span><div><h2>病例解读</h2><p>完成候选比较、基因—疾病核查、分类与病例相关性判断。</p></div><b>待解锁</b></article><article><span>L4</span><div><h2>综合报告</h2><p>在限时盲态病例中完成完整、克制且可追溯的报告。</p></div><b>待解锁</b></article></div>
            <div className="warning-panel"><b>高风险错误</b><p>把VUS作为确诊依据 · 复制数据库结论而不核查 · 使用错误转录本 · 同一证据重复计分 · 忽略反证 · 阴性结果声称排除遗传病</p></div>
          </section>
        )}
      </main>
      <footer><span>Variant Atlas · 教学用途</span><p>不接收真实患者信息，不替代临床诊断。医学结论须由合格专业人员复核。</p><span>GRCh38 · v0.2</span></footer>
    </div>
  );
}

function CaseBlock({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return <div className="case-block"><span className="eyebrow">STEP WORKSPACE</span><h2>{title}</h2><p className="lead">{lead}</p>{children}</div>;
}

function PromptBox({ children }: { children: React.ReactNode }) { return <div className="prompt-box"><span>思考提示</span><p>{children}</p></div>; }

function ChoiceRow({ options, value, onChange }: { options: string[][]; value: string; onChange: (value: string) => void }) {
  return <div className="choice-row">{options.map(([key,label]) => <button className={value === key ? "selected" : ""} onClick={() => onChange(key)} key={key}><b>{key}</b><span>{label}</span></button>)}</div>;
}

function Feedback({ ok, children }: { ok: boolean; children: React.ReactNode }) { return <div className={`feedback ${ok ? "good" : "review"}`}><b>{ok ? "判断通过" : "建议复核"}</b><p>{children}</p></div>; }
