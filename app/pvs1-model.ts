export type PVS1Answers = Record<string, string>;
export type TreeQuestion = { id: string; title: string; help: string; options: Array<[string, string]> };
const yn: Array<[string, string]> = [["yes", "是，已有依据"], ["no", "否，已核查"], ["unknown", "未知 / 资料不足"]];
export const pvs1Questions: TreeQuestion[] = [
  { id: "scope", title: "01 · 本次使用什么规范？", help: "先查CSpec中的基因–疾病、遗传模式和版本。此树是2018通用基础路径，叠加2023更新提醒；不能覆盖VCEP特异规则。", options: [["general", "已核查，本次适用通用路径"], ["specific", "存在适用的特异规则 / 尚待核查"]] },
  { id: "mechanism", title: "02 · LoF致病机制的证据水平？", help: "须按2018表1整体核对，不以pLI/LOEUF代替：全强度需Strong/Definitive关联、≥3个不依赖PVS1的P级LoF，且LoF占表型相关变异>10%；降1级需至少Moderate关联、≥2个既往关联LoF及匹配的null小鼠模型；降2级需至少Moderate及后二者之一。LoF分布须跨外显子（单外显子基因例外）；已知致死性LoF等例外转专家。", options: [["full", "满足表1完整条件"], ["down1", "满足表1降一级条件"], ["down2", "满足表1降两级条件"], ["none", "LoF不是已建立的致病机制"], ["unknown", "机制未明确"]] },
  { id: "type", title: "03 · 变异类型？", help: "先确认转录本版本与变异规范化；不由名称直接推断功能。整基因/多基因CNV应进入专门框架。", options: [["truncating", "无义 / 移码"], ["splice", "典型剪接±1/2"], ["deletion", "基因内单/多外显子缺失"], ["duplication", "基因内重复"], ["start", "起始密码子丢失"], ["other", "非典型剪接/RNA、整基因CNV或其他"]] },
  { id: "exon", title: "04 · 转录本与外显子前提是否成立？", help: "明确疾病相关转录本；受影响区域不能是被有功能的相关转录本跳过的可替代区域，也不能富集高频LoF。阈值须依基因/疾病；保留表达、转录本和人群来源。", options: [["yes", "相关且不可替代，已排除高频LoF耐受"], ["no", "有功能性替代 / 不相关 / 高频LoF耐受"], ["unknown", "尚无法确认"]] },
  { id: "rescue", title: "05 · 剪接效应与挽救途径已核查？", help: "检查天然/隐蔽位点、外显子跳跃及功能性GC供体等；对多个合理结果取最低适用强度。这里仅继续已有单一明确预期结果的基础分支；RNA实验证据须另评质量和残余正常转录本。", options: [["yes", "已核查，有明确异常结果且无挽救/多结果歧义"], ["no", "无有害剪接影响"], ["unknown", "多种结果、潜在挽救或尚未明确"]] },
  { id: "alternative", title: "05 · 是否有功能性替代起始转录本？", help: "功能性转录本的替代起始，与同一转录本内下游潜在ATG不是同一个问题。", options: yn },
  { id: "upstream", title: "06 · 原起点至下一潜在同框ATG之间有已知致病变异吗？", help: "2018基础路径给Moderate/Supporting；2023建议允许在充分基因特异证据下调整，不能仅凭起始丢失自动VeryStrong。", options: yn },
  { id: "length", title: "05 · 重复片段长度/边界是否已确定？", help: "无法确定长度就不能可靠推导阅读框与NMD。", options: yn },
  { id: "location", title: "06 · 重复插入的位置？", help: "仅基因内部分重复走此路径。插入位置不明不等于已证实串联。", options: [["tandem", "确认基因内串联"], ["unknown", "插入位置不明"], ["outside", "确认在相关基因外"]] },
  { id: "frame", title: "07 · 结果是否破坏阅读框？", help: "使用实际受影响的编码序列，不把‘外显子长度能被3整除’当成全部剪接证据。", options: [["out", "移框"], ["in", "同框"], ["unknown", "无法确定"]] },
  { id: "nmd", title: "08 · 新终止位置预计发生NMD吗？", help: "2018通用预测：PTC不在最后外显子，也不在倒数第二外显子的末端约50 bp。按相关转录本定位；例外、单外显子、RNA实测及VCEP边界需单独核查。", options: yn },
  { id: "critical", title: "09 · 丢失/改变区域是否有关键功能依据？", help: "需要功能研究或区域内独立致病变异等证据，不能仅凭数据库‘domain’标签。剪接/同框缺失关键区域的2023升级须专项评估。", options: [["yes", "已有关键功能依据"], ["no", "已检索，功能重要性仍不明"]] },
  { id: "proportion", title: "10 · 缺失蛋白比例？", help: "2018通用原文分别写>10%与<10%；恰为10%不擅自归边，转人工。最新基因特异阈值优先。", options: [["over", ">10%"], ["under", "<10%"], ["boundary", "恰为10% / 无法可靠计算"]] },
];
export function pvs1Route(answers: PVS1Answers) {
  const trail: Array<{ id: string; question: string; choice: string }> = [];
  let question: TreeQuestion | undefined;
  const ask = (id: string): string | undefined => {
    const q = pvs1Questions.find(item => item.id === id)!;
    const option = q.options.find(item => item[0] === answers[id]);
    if (!option) { question = q; return undefined; }
    trail.push({ id, question: q.title, choice: option[1] }); return option[0];
  };
  const result = (message = "按顺序补齐依据", base = 0, review = false) => {
    const downgrade = answers.mechanism === "down1" ? 1 : answers.mechanism === "down2" ? 2 : 0;
    const level = Math.max(0, base - downgrade);
    return { trail, question, message, review, base, level, strength: question ? "待完成" : review ? "转人工审核" : base ? ["不足Supporting，不赋PVS1", "PVS1_Supporting", "PVS1_Moderate", "PVS1_Strong", "PVS1（VeryStrong）"][level] : "不赋PVS1" };
  };
  const scope = ask("scope"); if (!scope) return result();
  if (scope !== "general") return result("先定位适用规范，本树不能代替VCEP。", 0, true);
  const mechanism = ask("mechanism"); if (!mechanism) return result();
  if (mechanism === "unknown") return result("机制或关联证据不充分，不能凭变异注释赋分。", 0, true);
  if (mechanism === "none") return result("LoF机制未建立；不能使用PVS1。");
  const type = ask("type"); if (!type) return result();
  if (type === "other") return result("非典型剪接须按2023建议评RNA；整基因/多基因事件转CNV框架。", 0, true);
  const exon = ask("exon"); if (!exon) return result();
  if (exon === "unknown") return result("先补齐相关转录本与外显子信息。", 0, true);
  if (exon === "no") return result("当前前提不支持通用PVS1，应复核实际功能后果。");
  if (type === "start") {
    const alternative = ask("alternative"); if (!alternative) return result();
    if (alternative === "yes") return result("存在功能性替代起始转录本，2018通用路径不赋PVS1。");
    if (alternative === "unknown") return result("需核查起始替代。", 0, true);
    const upstream = ask("upstream"); if (!upstream) return result();
    if (upstream === "unknown") return result("需查下游同框ATG及其上游致病变异。", 0, true);
    return result("2018基础强度；2023起始位点/功能域证据可能改变强度，最终须复核适用的基因特异建议。", upstream === "yes" ? 2 : 1);
  }
  if (type === "splice") {
    const rescue = ask("rescue"); if (!rescue) return result();
    if (rescue === "no") return result("典型位置本身不保证损害剪接，不赋PVS1。");
    if (rescue === "unknown") return result("评估所有合理剪接产物与挽救途径后再选最低强度；不自动取最严重结果。", 0, true);
  }
  let location = "";
  if (type === "duplication") {
    const length = ask("length"); if (!length) return result();
    if (length !== "yes") return result("重复长度不明，无法可靠推导NMD，暂停使用PVS1。", 0, true);
    const value = ask("location"); if (!value) return result(); location = value;
    if (location === "outside") return result("相关基因外插入不支持本路径的PVS1。");
  }
  let frame = "out";
  if (type !== "truncating") {
    const value = ask("frame"); if (!value) return result(); frame = value;
    if (frame === "unknown") return result("阅读框未明，不能推导LoF。", 0, true);
    if (type === "duplication" && frame === "in") return result("2018通用树对不能导致NMD的同框重复不赋PVS1。");
  }
  if (frame === "out") {
    const nmd = ask("nmd"); if (!nmd) return result();
    if (nmd === "unknown") return result("NMD不确定，需补充位置或实验依据。", 0, true);
    if (nmd === "yes") return result("符合通用LoF/NMD路径；仍需排除技术伪影与基因特异例外。", type === "duplication" && location === "unknown" ? 3 : 4);
    if (type === "duplication") return result("重复不预计发生NMD，不赋通用PVS1。");
  }
  const critical = ask("critical"); if (!critical) return result();
  if (critical === "yes") {
    if (type === "splice" || type === "deletion") return result("2018基础路径为Strong；2023允许有充分临床/功能证据时升级。须检查具体区域、残余功能和VCEP，本站不自动升级。", 3, true);
    return result("NMD逃逸但丢失关键功能区：2018通用基础Strong，特异规范可能调整。", 3);
  }
  const proportion = ask("proportion"); if (!proportion) return result();
  if (proportion === "boundary") return result("原文没有为此边界提供通用数值规则，保留人工判断。", 0, true);
  return result("已核查功能区、外显子耐受与相关转录本；使用2018通用蛋白比例分支。", proportion === "over" ? 3 : 2);
}

/** Changing an earlier answer invalidates all downstream answers, including branches now hidden. */
export function setPVS1Answer(answers: PVS1Answers, id: string, value: string): PVS1Answers {
  const route = pvs1Route(answers);
  const validIds = route.trail.map(item => item.id);
  const index = validIds.indexOf(id);
  const keep = index < 0 ? validIds : validIds.slice(0, index);
  return { ...Object.fromEntries(keep.filter(key => answers[key]).map(key => [key, answers[key]])), [id]: value };
}
