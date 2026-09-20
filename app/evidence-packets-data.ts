import { labSources } from "./evidence-lab-model";
export const reviewActions = ["接受", "修改", "暂缓", "不适用"];
export type PacketDecision = { action: number; strength: string; note: string };
export type PacketItem = { id: string; code: string; candidate: string; strengths: string[]; answer: number; target: string; rationale: string };
export type EvidencePacket = { id: string; title: string; provenance: string; sourceTitle: string; url: string; locator: string; facts: string[]; missing: string; items: PacketItem[] };
export const evidencePackets: EvidencePacket[] = [
  { id: "packet-nipbl", title: "NIPBL · 混合亲缘状态的新发观察", provenance: "ClinGen指南附例；不是完整真实病例病历", sourceTitle: "ClinGen PS2/PM6 v1.1（2021）", url: labSources.denovo, locator: "第1页，表1前NIPBL示例；表1–2", facts: ["原文以同一NIPBL变异为例：1位Cornelia de Lange综合征患者，亲缘已确认，计2分。", "另有2位无亲缘关系的相同综合征患者，亲缘未确认，各计1分。", "原文合计4分，并示范使用PS2_VeryStrong。未提供该变异HGVS及完整患者临床记录。"], missing: "不能从此附例推断人群频率、技术质量或该变异的最终分类；不能把假定亲缘改写为双亲未检测。", items: [
    { id: "nipbl-merge", code: "PS2/PM6", candidate: "2＋1＋1＝4，作为同一新发证据域，采用PS2_VeryStrong。", strengths: ["PS2_VeryStrong", "PS2_Strong", "PM6_Supporting", "待定", "不赋值"], answer: 0, target: "PS2_VeryStrong", rationale: "接受附例范围内的计分与代码；合并而非独立叠加PS2和PM6。接受不表示真实病例输入已经过验证。" },
    { id: "nipbl-extra", code: "PM6", candidate: "在上述PS2_VeryStrong之外，再给两例亲缘未确认观察额外PM6_Strong。", strengths: ["PM6_Strong", "PM6_Moderate", "不赋值", "待定"], answer: 3, target: "不赋值", rationale: "这些观察已进入合并新发计分，额外PM6会重复使用同一信息，应标记本条额外证据不适用。" },
    { id: "nipbl-pm2", code: "PM2", candidate: "将此变异标记PM2_Supporting，准备并入最终分类。", strengths: ["PM2_Supporting", "PM2_Moderate", "待定", "不赋值"], answer: 2, target: "待定", rationale: "证据包没有HGVS、人群数据或质量信息，无法验证PM2。缺资料是暂缓，不等同于已经证实该证据不适用。" },
  ] },
  { id: "packet-pah", title: "PAH · 反式观察累加", provenance: "ClinGen指南附例；保留原文的变异和观察关系", sourceTitle: "ClinGen PM3 v1.0（2019）", url: "https://clinicalgenome.org/docs/pm3-recommendation-for-in-trans-criterion-pm3-version-1.0/", locator: "第1页PAH示例及表1–2；第2页分类独立性要求", facts: ["待评估：NM_000277.3:c.1208C>T，p.Ala403Val。", "附例描述：一例与LP的c.1301C>A（p.Ala434Asp）反式；另一例与P的c.331C>T（p.Arg111Ter）反式。", "两条已确认反式P/LP观察各贡献1分；原文使用合计2分说明PM3_Strong。"], missing: "这是2019文件中的教学材料，不声称上述另一变异的分类已在2026年重新审定；没有额外补造表型、性别、家系或检测数据。", items: [
    { id: "pah-weight", code: "PM3", candidate: "另一变异LP的一例只给0.25分，另一变异P的一例给1分；合计1.25分，PM3_Moderate。", strengths: ["PM3_Moderate", "PM3_Strong", "PM3_VeryStrong", "待定", "不赋值"], answer: 1, target: "PM3_Strong", rationale: "修改为1＋1＝2分。0.25属于相位未知的LP，并非已经确认反式的LP。这里只核对指南附例的既定前提。" },
    { id: "pah-current", code: "独立分类", candidate: "引用这份附例，直接确认两条另一变异在当前规则下仍为P/LP，省略分类原文审核。", strengths: ["已完成当前分类核查", "待定", "不赋值"], answer: 2, target: "待定", rationale: "历史附例不能替代当前独立分类与版本审核。实际应用应核查证据来源、规则适用性及是否依赖待评变异，避免循环论证。" },
  ] },
  { id: "packet-gaa", title: "GAA · 通用树与专家判断不一致", provenance: "已发表真实变异的专家试评记录；不是完整患者病例", sourceTitle: "Abou Tayoun等，2018 · PMID 30192042", url: labSources.pvs1, locator: "Variant pilot段，GAA NM_000152.4:c.1A>G示例；Figure 1、Table 1", facts: ["论文试评讨论GAA NM_000152.4:c.1A>G。其下一同框甲硫氨酸位于122位密码子。", "论文记录1–122位区间存在多条当时标注P/LP的变异，通用树路径为PVS1_Moderate。", "GAA/Pompe工作组基于该区域丢失的非功能性证据提出VeryStrong；作者将这种差异解释为基因特异知识的应用，而未把通用起始丢失规则改成VeryStrong。"], missing: "这是2018年论文学术试评的时间截面；当前GAA适用VCEP、转录本、原始功能和独立分类仍需复核。", items: [
    { id: "gaa-general", code: "PVS1", candidate: "按2018通用树，只要是起始丢失，即赋PVS1_VeryStrong。", strengths: ["PVS1_VeryStrong", "PVS1_Strong", "PVS1_Moderate", "待定", "不赋值"], answer: 1, target: "PVS1_Moderate", rationale: "在论文给定前提下，修改通用基础路径为Moderate。工作组提出更高强度有额外基因特异依据，不是所有起始丢失的通用规则。" },
    { id: "gaa-live", code: "PVS1当前应用", candidate: "直接把2018试评中的专家VeryStrong作为现在可签发的最终强度，无需复核适用规范。", strengths: ["PVS1_VeryStrong", "PVS1_Moderate", "待定", "不赋值"], answer: 2, target: "待定", rationale: "暂缓当前临床强度确认，核查现行基因–疾病规范、支持数据与适用范围。历史试评不是本站自动更新的当前临床结论。" },
  ] },
];
export const packetItemIds = evidencePackets.flatMap(packet => packet.items.map(item => item.id));
export function packetDecisionComplete(item: PacketItem, value?: PacketDecision): boolean {
  return !!value && Number.isInteger(value.action) && value.action >= 0 && value.action < 4 && item.strengths.includes(value.strength) && value.note.trim().length >= 20;
}
export function packetDecisionCorrect(item: PacketItem, value?: PacketDecision): boolean {
  return packetDecisionComplete(item, value) && value!.action === item.answer && value!.strength === item.target;
}
