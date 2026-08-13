"use client";

import { useEffect, useMemo, useState } from "react";

type View = "dashboard" | "case" | "rules" | "roadmap";
type CaseAnswer = { inheritance: string; evidence: string[]; classification: string; report: string };

const modules = [
  { no: "01", title: "表型与遗传模式", meta: "6 节 · 约 120 分钟", progress: 33 },
  { no: "02", title: "质量控制与候选筛选", meta: "7 节 · 约 140 分钟", progress: 0 },
  { no: "03", title: "HGVS 与转录本", meta: "5 节 · 约 100 分钟", progress: 0 },
  { no: "04", title: "ACMG / AMP 证据", meta: "12 节 · 约 240 分钟", progress: 8 },
  { no: "05", title: "病例级综合解释", meta: "6 节 · 约 120 分钟", progress: 0 },
  { no: "06", title: "报告撰写", meta: "5 节 · 约 100 分钟", progress: 0 },
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

  useEffect(() => {
    const saved = window.localStorage.getItem("variant-atlas-demo");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setStep(state.step ?? 0);
        setAnswer(state.answer ?? answer);
      } catch { /* ignore a damaged local draft */ }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("variant-atlas-demo", JSON.stringify({ step, answer }));
  }, [step, answer]);

  const score = useMemo(() => {
    let value = 0;
    if (answer.inheritance === "AD") value += 20;
    const expected = ["PS2_VeryStrong", "PS3", "PP1_Strong", "PP3"];
    value += expected.filter((item) => answer.evidence.includes(item)).length * 10;
    if (answer.classification === "Pathogenic") value += 20;
    if (answer.report.length >= 60) value += 20;
    return Math.min(value, 100);
  }, [answer]);

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
          <button className={view === "rules" ? "active" : ""} onClick={() => navigate("rules")}>证据规则</button>
          <button className={view === "case" ? "active" : ""} onClick={() => navigate("case")}>病例训练</button>
          <button className={view === "roadmap" ? "active" : ""} onClick={() => navigate("roadmap")}>能力地图</button>
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
                  <button className="secondary" onClick={() => navigate("rules")}>查看证据卡片</button>
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
              <div><span>首版病例</span><strong>1<small> / 8 已开放</small></strong></div>
              <div><span>证据掌握</span><strong>6<small> 张核心卡片</small></strong></div>
              <div><span>证据快照</span><strong>2026<small>-08-13</small></strong></div>
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span>CURRICULUM</span><h2>学习路径</h2></div><p>每节约20分钟。统计基础可快速通过，重点训练分子机制和证据适用边界。</p></div>
              <div className="module-grid">
                {modules.map((module) => (
                  <article className="module-card" key={module.no}>
                    <span className="module-no">{module.no}</span><h3>{module.title}</h3><p>{module.meta}</p>
                    <div className="mini-progress"><i style={{ width: `${module.progress}%` }} /></div>
                    <small>{module.progress ? `${module.progress}% 已完成` : "尚未开始"}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="principle-strip">
              <div><span className="pulse" />证据原则</div>
              <p>变异致病性 ≠ 病例诊断。平台始终分开评价变异、基因—疾病关系和患者表型相关性。</p>
              <button onClick={() => navigate("roadmap")}>查看能力标准 →</button>
            </section>
          </>
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
      <footer><span>Variant Atlas · 教学用途</span><p>不接收真实患者信息，不替代临床诊断。医学结论须由合格专业人员复核。</p><span>GRCh38 · v0.1</span></footer>
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
