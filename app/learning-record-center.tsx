"use client";

import { useEffect, useRef, useState } from "react";
import { exportLearningArchive, importLearningArchive, learningCertification, LEARNING_RECORD_EVENT, MAX_ARCHIVE_BYTES, resetLearningArchive, summarizeLearning, validateLearningArchive, type LearningArchive, type LearningSummary } from "./learning-record";

const empty: LearningSummary = { coreLessons: 0, wgsLessons: 0, coreCases: 0, wgsCases: 0, coreExamPasses: 0, wgsExamPasses: 0, workflowGates: 0, reportBestScore: 0, reportDrafts: 0, flagshipCases: 0, coreAdvancedCases: 0, drillCorrect: 0 };

export default function LearningRecordCenter() {
  const [summary, setSummary] = useState<LearningSummary>(empty);
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<LearningArchive | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => { try { setSummary(summarizeLearning(window.localStorage)); } catch { setNotice("浏览器不允许读取学习记录，请检查存储权限。"); } };
    refresh();
    window.addEventListener(LEARNING_RECORD_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(LEARNING_RECORD_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, []);

  const { wgs: wgsCertified, full: fullCertified } = learningCertification(summary);

  function download() {
    try {
    const archive = exportLearningArchive(window.localStorage);
    const href = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = href; anchor.download = `variant-atlas-learning-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
    setNotice("学习档案已导出。包含进度和练习文字，请私下保管，不要上传含患者信息的草稿。");
    } catch { setNotice("导出失败：记录可能损坏或浏览器限制存储。请勿清除原记录，先复制重要草稿。"); }
  }

  async function upload(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setPending(null);
    try {
      if (file.size > MAX_ARCHIVE_BYTES) throw new Error("文件超过5MB限制。");
      const archive = validateLearningArchive(JSON.parse(await file.text()));
      setPending(archive);
      setNotice("档案验证通过。请先导出当前进度，再确认是否恢复；不会自动覆盖。");
    } catch (error) { setNotice(error instanceof Error ? error.message : "档案读取失败。"); }
  }
  function confirmImport() {
    if (!pending) return;
    try { importLearningArchive(window.localStorage, pending); }
    catch (error) { setNotice(error instanceof Error ? error.message : "档案导入失败。"); }
  }

  function reset() {
    if (!window.confirm("确认清除本浏览器中的全部 Variant Atlas 学习进度和报告草稿？此操作不可撤销，建议先导出备份。")) return;
    try { resetLearningArchive(window.localStorage); }
    catch (error) { setNotice(error instanceof Error ? error.message : "清除失败，原记录未更改。"); }
  }

  return <section className="record-center page-section">
    <div className="section-heading"><div><span>LOCAL LEARNING PASSPORT · V4 · 兼容旧版备份</span><h1>统一学习档案</h1></div><p>课程、病例、测验、工作流和报告草稿统一汇总在当前浏览器中。网站不上传患者资料，也不要求注册账号。</p></div>
    <div className="record-privacy"><b>本地优先</b><p>进度保存在此设备的浏览器中。更换设备或清理浏览器前请导出备份。导入会检查版本、章节和成绩格式，并在你确认后替换全部学习记录。</p></div>
    <div className="record-metrics">
      <article><span>核心课程</span><strong>{summary.coreLessons}<small>/24</small></strong></article>
      <article><span>WGS课程</span><strong>{summary.wgsLessons}<small>/28</small></strong></article>
      <article><span>病例达标</span><strong>{summary.coreCases + summary.wgsCases}<small>/26</small></strong></article>
      <article><span>测验通过</span><strong>{summary.coreExamPasses + summary.wgsExamPasses}<small>/6</small></strong></article>
      <article><span>工作流关口</span><strong>{summary.workflowGates}<small>/37</small></strong></article>
      <article><span>报告最高分</span><strong>{summary.reportBestScore}<small>/100</small></strong></article>
    </div>
    <div className="record-certification">
      <article className={wgsCertified ? "passed" : ""}><span>WGS</span><div><h2>WGS专项能力</h2><p>28课完成、18例中至少12例达到2/3、W1–W3均达到7/8。</p><small>当前：{summary.wgsLessons}/28课 · {summary.wgsCases}/12例 · {summary.wgsExamPasses}/3级</small></div><b>{wgsCertified ? "已达标" : "进行中"}</b></article>
      <article className={fullCertified ? "passed" : ""}><span>VA</span><div><h2>综合训练达标</h2><p>核心24课、8例各≥85分、证据练习至少5题正确、L1–L3各≥80分、报告≥80分，并通过WGS专项。</p><small>综合认证是学习平台的形成性评价，不等同于职业资质或临床授权。</small></div><b>{fullCertified ? "已达标" : "进行中"}</b></article>
    </div>
    <div className="record-actions"><button className="primary" onClick={download}>导出学习档案</button><button className="secondary" onClick={() => fileRef.current?.click()}>导入学习档案</button><input ref={fileRef} type="file" accept="application/json,.json" onChange={(event) => upload(event.target.files?.[0])} /><button className="danger-action" onClick={reset}>清除本地记录</button></div>
    {pending && <section className="archive-confirm" aria-label="导入确认"><h2>确认恢复这份档案？</h2><p>导出时间：{pending.exportedAt} · {Object.keys(pending.records).length}个学习模块 · 版本{pending.schemaVersion}</p><p>将替换当前课程、病例、测验及报告草稿，不做自动合并。请先导出当前档案。</p><div><button className="primary" onClick={confirmImport}>确认替换并恢复</button><button className="secondary" onClick={() => setPending(null)}>取消，保留当前进度</button></div></section>}
    {notice && <p className="record-notice" role="status">{notice}</p>}
    <div className="record-details"><span>报告草稿：{summary.reportDrafts}</span><span>核心病例达标：{summary.coreCases}/8</span><span>WGS病例达标：{summary.wgsCases}/18</span><span>旗舰病例达标：{summary.flagshipCases}/6</span><span>核心进阶：{summary.coreAdvancedCases}/8例</span><span>证据练习：{summary.drillCorrect}/6题</span><span>学习进度不上传</span></div>
  </section>;
}
