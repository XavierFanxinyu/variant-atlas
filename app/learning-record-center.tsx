"use client";

import { useEffect, useRef, useState } from "react";
import { exportLearningArchive, importLearningArchive, LEARNING_RECORD_EVENT, resetLearningArchive, summarizeLearning, type LearningSummary } from "./learning-record";

const empty: LearningSummary = { coreLessons: 0, wgsLessons: 0, coreCases: 0, wgsCases: 0, coreExamPasses: 0, wgsExamPasses: 0, workflowGates: 0, reportBestScore: 0, reportDrafts: 0 };

export default function LearningRecordCenter() {
  const [summary, setSummary] = useState<LearningSummary>(empty);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => setSummary(summarizeLearning(window.localStorage));
    refresh();
    window.addEventListener(LEARNING_RECORD_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(LEARNING_RECORD_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, []);

  const wgsCertified = summary.wgsLessons === 28 && summary.wgsCases >= 12 && summary.wgsExamPasses === 3;
  const fullCertified = summary.coreLessons === 24 && summary.coreCases === 8 && summary.coreExamPasses === 3 && summary.reportBestScore >= 80 && wgsCertified;

  function download() {
    const archive = exportLearningArchive(window.localStorage);
    const href = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = href; anchor.download = `variant-atlas-learning-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    URL.revokeObjectURL(href);
    setNotice("学习档案已导出。文件只包含本浏览器中的学习进度与练习草稿。");
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    try {
      importLearningArchive(window.localStorage, JSON.parse(await file.text()));
      setSummary(summarizeLearning(window.localStorage));
      setNotice("学习档案已导入。页面将刷新以恢复各训练模块的状态。");
      window.setTimeout(() => window.location.reload(), 600);
    } catch (error) { setNotice(error instanceof Error ? error.message : "档案导入失败。"); }
  }

  function reset() {
    if (!window.confirm("确认清除本浏览器中的全部 Variant Atlas 学习进度和报告草稿？此操作不可撤销，建议先导出备份。")) return;
    resetLearningArchive(window.localStorage);
    setSummary(empty);
    setNotice("本地学习记录已清除。");
  }

  return <section className="record-center page-section">
    <div className="section-heading"><div><span>LOCAL LEARNING PASSPORT · SCHEMA V3</span><h1>统一学习档案</h1></div><p>课程、病例、测验、工作流和报告草稿统一汇总在当前浏览器中。网站不上传患者资料，也不要求注册账号。</p></div>
    <div className="record-privacy"><b>本地优先</b><p>进度保存在浏览器 localStorage。更换设备或清理浏览器前，请导出 JSON 备份；导入只接受 Variant Atlas 自有记录键。</p></div>
    <div className="record-metrics">
      <article><span>核心课程</span><strong>{summary.coreLessons}<small>/24</small></strong></article>
      <article><span>WGS课程</span><strong>{summary.wgsLessons}<small>/28</small></strong></article>
      <article><span>病例达标</span><strong>{summary.coreCases + summary.wgsCases}<small>/26</small></strong></article>
      <article><span>测验通过</span><strong>{summary.coreExamPasses + summary.wgsExamPasses}<small>/6</small></strong></article>
      <article><span>工作流关口</span><strong>{summary.workflowGates}<small>/52</small></strong></article>
      <article><span>报告最高分</span><strong>{summary.reportBestScore}<small>/100</small></strong></article>
    </div>
    <div className="record-certification">
      <article className={wgsCertified ? "passed" : ""}><span>WGS</span><div><h2>WGS专项能力</h2><p>28课完成、18例中至少12例达到2/3、W1–W3均达到7/8。</p><small>当前：{summary.wgsLessons}/28课 · {summary.wgsCases}/12例 · {summary.wgsExamPasses}/3级</small></div><b>{wgsCertified ? "已达标" : "进行中"}</b></article>
      <article className={fullCertified ? "passed" : ""}><span>VA</span><div><h2>独立解读综合能力</h2><p>核心与WGS课程、病例、六级测验全部达标，且报告写作最高分≥80。</p><small>综合认证是学习平台的形成性评价，不等同于职业资质或临床授权。</small></div><b>{fullCertified ? "已达标" : "进行中"}</b></article>
    </div>
    <div className="record-actions"><button className="primary" onClick={download}>导出学习档案</button><button className="secondary" onClick={() => fileRef.current?.click()}>导入学习档案</button><input ref={fileRef} type="file" accept="application/json,.json" onChange={(event) => upload(event.target.files?.[0])} /><button className="danger-action" onClick={reset}>清除本地记录</button></div>
    {notice && <p className="record-notice" role="status">{notice}</p>}
    <div className="record-details"><span>报告草稿：{summary.reportDrafts}</span><span>核心病例达标：{summary.coreCases}/8</span><span>WGS病例达标：{summary.wgsCases}/18</span><span>数据不离开当前设备</span></div>
  </section>;
}
