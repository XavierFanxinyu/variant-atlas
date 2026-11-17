"use client";
import { useState } from "react";
export const manualHash = "d9fe80c065c508e1f8ab3d681fafbc4ee2a962cc2c6f0ccf8df9e3b3d89cd84b";
export default function ManualBaseline() {
  const [opened, setOpened] = useState(false);
  return <section className="page-section">
    <span className="eyebrow">RULE BASELINE · USER-SUPPLIED HANDBOOK</span>
    <h1>ACMG规则速查 · 本轮学习基准</h1>
    <p>以用户提供的《ACMG变异解读规则速查手册.html》为本轮学习规则。收录日期：2026-11-17；原件未标注受控版本号。28条证据、原表、原图、贝叶斯打分器和LOD查询器完整保留；收录不等于全部条款已获独立指南核验。</p>
    <div className="strength-result"><strong>规则基准与历史训练分开</strong><p>本页手册为当前默认入口。旧课程、病例答案和实验工作区仍按各自标注的来源运行，尚未逐题迁移，不可与本手册的分值直接合并。原学习记录保留，不重新计分或改写历史成绩。</p><p>手册里的“自动化”是证据获取方式，不表示免人工复核。原打分器只做机械计算，不校验证据独立性；重复添加同一证据不能算作两项独立证据。临床使用仍需经批准的现行规范和专业审核。</p></div>
    <details className="lab-trace"><summary>重要差异与未明确边界</summary><ul>
      <li>PP1：本手册采用LOD与表14–16；旧工作区使用2024 PP1/PP4联合模型，两者不合并。</li>
      <li>分类：使用表18/19及同方向至少两项证据、BA1例外；不是旧2015组合台。</li>
      <li>PS3/BS3：保留无OddsPath的表6；酶活影响恰好50%未明确分档，不能自行填补。</li>
      <li>RNA：手册PS3/BS3段落与旧版Walker 2023分路不同，不能把同一RNA证据叠加计权。</li>
      <li>PP3/BP4：保留REVEL、BayesDel的空档和边界；落在空档时回规则维护方确认。该图的S表示Strong，不是Supporting。</li>
      <li>PM2：速判“任一数据库”与完整规则中的“均”存在措辞差异，不据此自动判定人群频率证据。</li>
      <li>BA1例外表未注明参考基因组版本，不能默认按GRCh38坐标直接匹配。原文参考文献编号未附完整书目，逐条追溯仍待补齐。</li>
    </ul></details>
    <p><a href="/acmg-manual-v18.html" target="_blank" rel="noreferrer">独立窗口打开完整手册 ↗</a> · <a href="/acmg-manual-v18.html" download>下载原始HTML</a></p>
    <p>内嵌手册隔离运行，不能读取网站学习档案；主题偏好可能无法保存，临时计算不纳入学习成绩。切换页面会清空手册内临时计算，请自行留底稿。</p>
    <button className="primary" onClick={() => setOpened(value => !value)} aria-expanded={opened}>{opened ? "收起手册（清空临时计算）" : "在本页展开完整手册"}</button>
    {opened && <iframe title="用户提供的ACMG规则速查手册" src="/acmg-manual-v18.html" sandbox="allow-scripts allow-popups allow-modals allow-downloads" referrerPolicy="no-referrer" style={{width:"100%",height:"80vh",minHeight:600,border:"1px solid #ddd",borderRadius:12,marginTop:20}} />}
    <details><summary>来源指纹与公开授权</summary><p>用户于2026-11-17明确授权原HTML、表格与图片公开至网站和GitHub。原文件逐字保留，SHA-256：<code style={{overflowWrap:"anywhere"}}>{manualHash}</code>。收录日期不代表指南发布日期；第三方材料权利归原权利人，不因仓库开源许可证改变。</p></details>
  </section>;
}
