import { deepLessons } from "./deep-lessons";

export default function DeepLessonPanel({ lessonId }: { lessonId: string }) {
  const deep = deepLessons[lessonId];
  if (!deep) return null;
  return <section className="deep-lesson-panel">
    <header><div><span>{deep.level} · LONG FORM</span><h2>深度决策工作坊</h2></div><small>{deep.time}</small><p>{deep.question}</p></header>
    <div className="deep-workflow">{deep.workflow.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2,"0")}</span><div><h3>{item.title}</h3><p>{item.body}</p><small>本步产物：{item.output}</small></div></article>)}</div>
    <div className="deep-example"><span>WORKED EXAMPLE</span><h3>{deep.workedExample.title}</h3><div><section><b>已知事实</b><ul>{deep.workedExample.facts.map((item) => <li key={item}>{item}</li>)}</ul></section><section><b>推理链</b><ol>{deep.workedExample.reasoning.map((item) => <li key={item}>{item}</li>)}</ol></section></div><p><b>停止关口：</b>{deep.workedExample.stop}</p></div>
    <div className="deep-pitfalls"><b>高频误判雷达</b>{deep.pitfalls.map((item) => <span key={item}>{item}</span>)}</div>
  </section>;
}
