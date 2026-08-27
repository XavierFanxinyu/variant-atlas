import { guidelineRecords, routingOrder } from "./guideline-registry";

export default function GuidelineCenter() {
  return <section className="guideline-center page-section">
    <div className="section-heading"><div><span>VERSION-AWARE GUIDANCE · REVIEWED 2026-08-27</span><h1>规范版本中心</h1></div><p>这里不是链接收藏夹，而是解读前的路由表：先确定适用范围，再记录具体版本，最后才进入证据赋值。</p></div>
    <div className="guideline-alert"><b>术语更新</b><p>ClinGen SVI Working Group是历史名称。当前通用变异分类工作由Variant Classification Working Group承接；网站保留旧文件的原始署名，同时在现行内容中使用新名称。</p></div>
    <ol className="guideline-routing">{routingOrder.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2,"0")}</span><p>{item}</p></li>)}</ol>
    <div className="guideline-grid">{guidelineRecords.map((item) => <article key={item.id}><header><span className={`guideline-status ${item.status}`}>{item.status}</span><small>复核 {item.reviewed}</small></header><h2>{item.title}</h2><p className="guideline-meta">{item.owner} · {item.version} · {item.published}</p><dl><div><dt>适用范围</dt><dd>{item.scope}</dd></div><div><dt>何时使用</dt><dd>{item.useWhen}</dd></div><div><dt>高风险边界</dt><dd>{item.caution}</dd></div></dl><a href={item.url} target="_blank" rel="noreferrer">打开官方来源 ↗</a></article>)}</div>
    <div className="guideline-footer-note"><b>更新纪律</b><p>网站的“现行”表示截至复核日期已核查公开来源，不保证此后没有新版本。用于真实病例前，仍应打开原始来源确认最新状态，并保留检索日期。</p></div>
  </section>;
}
