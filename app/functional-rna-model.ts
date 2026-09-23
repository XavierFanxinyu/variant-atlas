export const functionalReviewedAt = "2026-09-23";
export const functionalSources = {
  functional: "https://doi.org/10.1186/s13073-019-0690-2",
  splicing: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10357475/",
  cspec: "https://cspec.clinicalgenome.org/cspec/ui/svi/",
};
export const functionalChecks = [
  ["scope", "已记录基因–疾病、机制及适用规范版本；确认可使用通用OddsPath映射"],
  ["mechanism", "本实验测量疾病相关功能，能将该变异效应与其他遗传背景区分"],
  ["controls", "已核实实验对照、重复性、P/B验证对照的独立分类和判别性能"],
  ["calibration", "OddsPath来自有效校准及对应的实验读数区间，不是p值、OR或原始活性百分比"],
  ["independence", "已审核与其他功能/剪接证据的依赖；不把同一实验的多个读数重复相乘"],
] as const;
export type FunctionalInput = { source: string; record: string; odds: string; direction: "unknown" | "abnormal" | "normal" | "indeterminate"; checks: string[]; conflict: boolean };
export const emptyFunctional = (): FunctionalInput => ({ source: "", record: "", odds: "", direction: "unknown", checks: [], conflict: false });
/** Brnich Table 3 uses strict inequalities. This is a mapping, not an assay calibration. */
export function oddsPathStrength(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value > 350) return "PS3_VeryStrong";
  if (value > 18.7) return "PS3_Strong";
  if (value > 4.3) return "PS3_Moderate";
  if (value > 2.1) return "PS3_Supporting";
  if (value < 0.053) return "BS3_Strong";
  if (value < 0.23) return "BS3_Moderate";
  if (value < 0.48) return "BS3_Supporting";
  return "不赋方向性证据";
}
export function reviewFunctional(input: FunctionalInput) {
  const issues: string[] = functionalChecks.filter(([key]) => !input.checks.includes(key)).map(([, label]) => `待确认：${label}`);
  if (!input.source.trim() || !input.record.trim()) issues.push("补充公开原文定位和实验审核底稿。");
  const raw = input.odds.trim();
  const value = /^\d*\.?\d+(?:e[+-]?\d+)?$/i.test(raw) ? Number(raw) : NaN;
  const mapped = oddsPathStrength(value);
  if (!mapped) issues.push("请输入大于0的有限OddsPath；空白、0、无穷和p值不能代替有效校准值。");
  if (input.direction === "unknown" || input.direction === "indeterminate") issues.push("实验读数尚未归类或处于不确定区间；不强行归入正常/异常。");
  if (input.conflict) issues.push("存在冲突实验或未解释的中间表型，需先比较质量与机制，不能自动抵消或选最强。");
  if (mapped?.startsWith("PS3") && input.direction === "normal" || mapped?.startsWith("BS3") && input.direction === "abnormal") issues.push("实验方向与OddsPath方向不一致，请核查是否录错读数区间或校准值。");
  return { strength: issues.length ? "暂缓赋值" : mapped!, issues };
}
export const rnaChecks = [
  ["scope", "已核查适用VCEP、转录本版本与基因–疾病机制"],
  ["assay", "已审核组织表达、对照、重复性、NMD处理及技术偏倚"],
  ["quantification", "已记录各转录本及残余正常转录本的定量、等位基因归属与检测限"],
  ["independence", "已区分RNA、剪接预测和下游蛋白功能信息的依赖关系"],
] as const;
export type RNAInput = { source: string; record: string; material: "unknown" | "patient" | "minigene" | "other"; outcome: "unknown" | "abnormal" | "normal" | "complex"; variant: "unknown" | "silent-intronic" | "protein-altering"; lof: boolean; checks: string[] };
export const emptyRNA = (): RNAInput => ({ source: "", record: "", material: "unknown", outcome: "unknown", variant: "unknown", lof: false, checks: [] });
export function reviewRNA(input: RNAInput) {
  const issues: string[] = rnaChecks.filter(([key]) => !input.checks.includes(key)).map(([, label]) => `待确认：${label}`);
  if (!input.source.trim() || !input.record.trim()) issues.push("补充公开原文定位、RNA结果和待补依据。");
  if (input.material === "unknown" || input.outcome === "unknown" || input.variant === "unknown") issues.push("先明确实验材料、RNA结果及变异类型。");
  if (issues.length) return { route: "暂缓：审核资料未完成", issues };
  if (input.material !== "patient") issues.push("minigene或其他模型不能默认获得患者相关组织的完整权重；须核查构建、校准与适用规范。");
  if (input.outcome === "complex") return { route: "复杂RNA结果：转专项人工审核", issues: [...issues, "逐转录本分析后果及相对丰度，再保守评估总效应；本站不设跨基因通用残余比例阈值。"] };
  if (input.outcome === "abnormal") return { route: input.lof ? "进入PVS1(RNA)评估；强度待定" : "暂缓PVS1(RNA)：尚未确认LoF机制", issues: [...issues, "需结合实际剪接产物、阅读框/NMD、功能区和残余表达确定强度；不是见异常就给VeryStrong。", "同一剪接效应不额外计PS3；以RNA证据替代相应剪接预测证据。"] };
  if (input.variant === "protein-altering") return { route: "剪接正常不排除蛋白功能影响", issues: [...issues, "不能仅凭RNA正常赋BS3或确认变异良性；蛋白改变仍需独立审查。"] };
  return { route: "进入BP7(RNA)评估；强度待定", issues: [...issues, "高质量无剪接影响数据可评估BP7_Strong(RNA)，但本工作表不自动确认强度；不是BS3，也不是最终良性分类。"] };
}
