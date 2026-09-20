// Teaching summaries; source versions are pinned, not a live clinical rules service.
export const strengthReviewedAt = "2026-09-20";
export const evidenceSources = {
  acmg: { title: "ACMG/AMP 2015 · Tables 3–5", url: "https://pmc.ncbi.nlm.nih.gov/articles/4544753/" },
  hub: { title: "ClinGen 现行建议汇总 · 页面标注 2025-07", url: "https://www.clinicalgenome.org/tools/clingen-variant-classification-guidance/" },
  cspec: { title: "ClinGen CSpec · 查询基因/疾病及具体版本", url: "https://cspec.clinicalgenome.org/cspec/ui/svi/" },
  pm3: { title: "ClinGen PM3 v1.0 · 2019-05-02 · 表1/2", url: "https://clinicalgenome.org/docs/pm3-recommendation-for-in-trans-criterion-pm3-version-1.0/" },
  denovo: { title: "ClinGen PS2/PM6 v1.1 · 2021-05-05 · 表1/2", url: "https://www.clinicalgenome.org/docs/ps2-pm6-recommendation-for-de-novo-ps2-and-pm6-acmg-amp-criteria-version-1.0/" },
  pvs1: { title: "Abou Tayoun et al. 2018 · PVS1 决策树", url: "https://pmc.ncbi.nlm.nih.gov/articles/6185798/" },
  functional: { title: "Brnich et al. 2020 · PS3/BS3 · Table 3", url: "https://pmc.ncbi.nlm.nih.gov/articles/6938631/" },
  segregation: { title: "Biesecker et al. 2024 · PP1/BS4/PP4 · Tables 2–4", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10806742/" },
  computational: { title: "Pejaver et al. 2022 · PP3/BP4 校准建议", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9748256/" },
  splicing: { title: "Walker et al. 2023 · 剪接证据框架", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10357475/" },
  pm2: { title: "ClinGen PM2 v1.0 · 2020-09-04", url: "https://www.clinicalgenome.org/docs/pm2-recommendation-for-absence-rarity/" },
} as const;
export type EvidenceSourceId = keyof typeof evidenceSources;
export type StrengthDetail = { code: string; scope: string; levels: string; decision: string; stop: string; record: string; sources: EvidenceSourceId[]; table?: string };
const specific = "基因/疾病特异阈值；本页不设通用人数或分值";
const base = (code: string, levels: string, decision: string, stop: string, record: string): StrengthDetail => ({ code, levels, decision, stop, record, scope: specific, sources: ["acmg", "cspec"] });
export const strengthDetails: StrengthDetail[] = [
  { code: "PVS1", scope: "ClinGen 通用决策树 + 适用 VCEP", levels: "Supporting / Moderate / Strong / VeryStrong，或不适用", decision: "先确认该基因–疾病的 LoF 机制，再按变异类型进入决策树。核对疾病相关转录本、外显子表达、NMD、替代起始/剪接和关键区域；末端截短不自动取满强度。", stop: "机制不匹配或不能确认真实功能缺失时，不用一个较低强度掩盖适用性缺失。RNA 证据沿剪接框架评估，不再为同一效应叠加 PS3/PP3。", record: "决策树路径、转录本版本、NMD判断依据、所保留蛋白区域、最终分支。", sources: ["pvs1", "splicing", "cspec"] },
  base("PS1", "原始 Strong；剪接场景按专门对照矩阵调整", "比较相同氨基酸改变的独立致病参照，先排除不同剪接后果。剪接类 PS1 不能只比较蛋白注释，应按 Walker 2023 的位置、预测事件与参照证据矩阵。", "参照只有数据库标签、致病依据不独立或机制不同：暂停赋值。", "参照变异、分类原始依据及两者剪接比较。"),
  { code: "PS2", scope: "ClinGen de novo v1.1", levels: "Supporting / Moderate / Strong / VeryStrong", decision: "按亲缘确认和表型特异性为独立新生观察计点，累计后转换强度。确认亲缘不等于仅确认父母变异检测阴性。", stop: "未检测父母变异不能按假定新生计点。亲代嵌合、同胞重复、AR仅一条等位基因须按原文特别条款复核。", record: "亲缘验证方式、父母检测能力、表型分层、独立病例、特殊遗传模式。", sources: ["denovo"], table: "denovo" },
  { code: "PS3", scope: "ClinGen 功能证据校准", levels: "按校准可达 Supporting / Moderate / Strong / VeryStrong", decision: "先审查实验是否测量疾病机制，再审查已知P/B对照、重复性和判别性能。若可估计 OddsPath，按表3映射；没有校准不能凭显著性或论文篇数升级。", stop: "单纯RNA剪接实验先走PVS1/BP7(RNA)路径；重复实验不等于独立证据。", record: "实验类型、对照来源及独立分类、阈值、读数、校准方法。", sources: ["functional", "splicing"], table: "functional" },
  base("PS4", "原始 Strong；罕见变异病例观察可为 Moderate；其他等级按VCEP", "病例对照需评价效应量及置信区间、祖源匹配和偏倚。罕见病先证者计数阈值必须选定VCEP，不能套用PM3的0.5/1/2/4。", "提交数、文献数不是独立病例数；同一队列不得重复计入。", "病例去重清单、对照来源、统计量及VCEP阈值。"),
  base("PM1", "原始 Moderate；其他等级仅按适用规范", "热点/功能域须有疾病相关的致病富集及良性变异分布依据，不按结构域标签自动分级。", "仅有预测软件结构图或任意截取区域不满足适用条件。", "区域坐标、病例与人群分布、规范版本。"),
  { code: "PM2", scope: "ClinGen PM2 v1.0 通用建议", levels: "Supporting；没有通用的进一步升级阶梯", decision: "低频或未检出是支持级信息。先检查该位点覆盖、可检出性、祖源以及适用疾病阈值。", stop: "不能把数据库缺失升级为中等/强；数据库质量不足时应暂缓，不把缺失数据当阴性。", record: "数据库版本、AC/AN/AF、覆盖与质量过滤、疾病特异阈值。", sources: ["pm2", "cspec"] },
  { code: "PM3", scope: "ClinGen PM3 v1.0；仅隐性病受累者", levels: "≥0.5 Supporting；≥1 Moderate；≥2 Strong；≥4 VeryStrong", decision: "每位独立先证者按相位、另一等位基因分类及纯合情况计点。两侧变异须满足相应稀有度要求；另一变异分类不得依赖待评估变异。", stop: "纯合总贡献≤1；另一等位基因为VUS的总贡献≤0.5。未知相位时还需核查不同P/LP另一变异的要求，不能只按人数累加。", record: "家系去重号、原文定位、另一变异及独立分类依据、相位、原始分与封顶后贡献。", sources: ["pm3", "cspec"], table: "pm3" },
  base("PM4", "原始 Moderate；不提供通用升级算法", "非重复区框内插入/缺失或终止丢失需结合蛋白长度及功能影响。", "若同一长度变化已由PVS1计入，应审核证据依赖，不双算。", "蛋白改变、重复区状态、独立功能影响。"),
  base("PM5", "原始 Moderate；升降级依赖VCEP", "同一残基的不同致病错义改变可提供参照；参照数量、分类可信度及替换差异须按选定规范评价。", "不能把任意两个参照自动升级为Strong；排除主要通过剪接致病的参照。", "每条参照的独立分类、氨基酸替换与剪接比较。"),
  { code: "PM6", scope: "ClinGen de novo v1.1", levels: "Supporting / Moderate / Strong / VeryStrong", decision: "父母均已检测且未见变异，但亲缘未经确认，使用未确认亲缘列。与PS2来源合并时按同一de novo证据域处理。", stop: "不能把未采集父母样本当PM6；同一观察不得同时给PS2和PM6。", record: "父母检测、亲缘状态、表型层级、逐例分值及合并理由。", sources: ["denovo"], table: "denovo" },
  { code: "PP1", scope: "ClinGen 2024 简化共分离/表型框架", levels: "按合并贝叶斯分值确定；不是PM3病例分", decision: "计有信息量的共分离，不是家系总人数；建立相位所用成员不能再次计数。与PP4共享位点证据上限，并处理同一等位基因上的多候选变异。", stop: "低外显率、表型模拟、冲突或复杂大家系需正式连锁分析；不能机械套人数表。", record: "家系图、有效减数分裂、外显率假设、PP4依赖及分值分配。", sources: ["segregation", "cspec"], table: "segregation" },
  base("PP2", "原始 Supporting；无通用人数升级规则", "只有错义是常见致病机制且基因良性错义背景较低时考虑；部分VCEP禁用。", "不能由单一约束分数直接赋值或因预测工具更多而升级。", "基因疾病机制及VCEP适用性。"),
  { code: "PP3", scope: "ClinGen 校准工具建议；变异类型特异", levels: "按所选工具的已验证阈值；不是默认只能Supporting", decision: "预先选定适用且校准的工具、版本和阈值；不同工具、错义与剪接的分数不能互换。Pejaver 2022提供工具特异表，升级前逐项核查。", stop: "不能多数投票、挑最高分工具或把预测当实验。缺失分数不等于良性；相关预测不能叠加。", record: "工具/模型版本、原始分、校准表定位、适用变异类型与证据依赖。", sources: ["computational", "splicing", "cspec"] },
  { code: "PP4", scope: "ClinGen 2024 表型–基因特异性框架", levels: "由匹配的诊断检出率与PP1共同确定", decision: "使用相同表型定义与相近检测方法下的诊断检出率，而非HPO数量或排名分数。原文表2转换为贝叶斯分值，通常与PP1合计封顶+5。", stop: "不能从一个相似表型直接赋强证据；同一信息不能在多个表型/家系代码里重复使用。", record: "表型定义、检出率研究、方法可比性、等位基因分配与上限。", sources: ["segregation"], table: "segregation" },
  { code: "PP5", scope: "ClinGen 建议不再使用", levels: "不赋值，不升降级", decision: "数据库或权威来源的分类是检索线索，回查底层证据并赋到相应代码。", stop: "不能把ClinVar星级转换成PP5强度，也不能把同一底层证据再计一次。", record: "提交者、疾病、日期、冲突及可追溯原始证据。", sources: ["hub"] },
  base("BA1", "独立良性 Stand-alone；不是VeryStrong", "核对群体频率、样本质量和例外清单。基因/疾病特异阈值可能替代基础框架。", "低外显率或已知例外不能机械用通用频率排除；BA1与BS1不能双算同一频率信息。", "祖源、频率、样本量、阈值与例外核查。"),
  base("BS1", "原始 Strong；较低强度须有特异规范", "比较观察频率与该疾病可容许的最高频率，纳入患病率、外显率与异质性。", "不把一个基因的AF阈值复制给其他疾病。", "最大可信频率推导或VCEP阈值、祖源与质量。"),
  base("BS2", "原始 Strong；降级/计人数按VCEP", "健康携带者是否有反证力取决于年龄、外显率、基因型和评估完整度。", "隐性病单个健康杂合携带者不是BS2；晚发病的儿童未发病不能强赋值。", "受检年龄、针对性临床评估、基因型、外显率假设。"),
  { code: "BS3", scope: "ClinGen 功能证据校准", levels: "Supporting / Moderate / Strong 按OddsPath及规范", decision: "功能正常只有在实验能捕捉相关致病机制时才有反证力；强度由校准而不是阴性结果本身决定。", stop: "无显著差异不等于正常功能；RNA未见剪接异常应评估BP7(RNA)，并排除其他机制。", record: "检测灵敏度、阳性/阴性对照、校准及未覆盖功能。", sources: ["functional", "splicing"], table: "functional" },
  { code: "BS4", scope: "ClinGen 2024 共分离框架", levels: "不共分离强度需遗传模型支持", decision: "确认表型、亲缘、样本及基因型后解释不共分离。若存在不完全外显、表型模拟或遗传异质性，需正式模型。", stop: "一个未发病携带者不能无条件当BS4；不能把未知临床状态当不共分离。", record: "不共分离成员、年龄、模型、替代病因及测序质量。", sources: ["segregation", "cspec"] },
  base("BP1", "原始 Supporting；无通用升级规则", "错义变异在主要由截短导致的疾病中才可能适用。", "同基因的GoF/显性负效应疾病必须分开，不能按基因名称一刀切。", "具体疾病机制与错义致病例外。"),
  base("BP2", "原始 Supporting；无通用升级规则", "先确定顺/反式，再看疾病机制及双等位基因是否可存活/呈现另一疾病。", "共现不等于良性，尤其隐性病或复合等位基因；不能把PM3反过来机械赋值。", "相位证据、另一变异独立分类、遗传模式。"),
  base("BP3", "原始 Supporting；无通用升级规则", "框内插入/缺失位于无已知功能的重复区才考虑。", "重复区并不天然无功能；STR扩增不能用此规则直接判良性。", "重复结构、功能注释与适用变异类型。"),
  { code: "BP4", scope: "ClinGen 校准工具建议；变异类型特异", levels: "按校准表允许的良性强度，不强行限于Supporting", decision: "使用预先选定工具的良性证据区间，中间无判别区不赋值。保留工具版本与阈值来源。", stop: "缺失预测、多个工具投票或错义工具用于结构变异均不能赋值。蛋白预测正常不排除剪接异常。", record: "校准表、预测机制、原始分及未覆盖机制。", sources: ["computational", "splicing", "cspec"] },
  base("BP5", "原始 Supporting；无通用升级规则", "另一分子病因必须能够解释当前表型；先考虑双重诊断与修饰效应。", "找到另一个P/LP不自动证明该变异良性；疾病特异规则可能禁用。", "表型解释完整性、替代诊断证据及VCEP约束。"),
  { code: "BP6", scope: "ClinGen 建议不再使用", levels: "不赋值，不升降级", decision: "回查来源中的良性证据，按相应频率、功能或其他代码独立评价。", stop: "不能将数据库良性标签本身再次计作证据。", record: "底层证据出处与独立性。", sources: ["hub"] },
  { code: "BP7", scope: "ACMG基础 + ClinGen 2023剪接框架", levels: "预测场景Supporting；符合条件的RNA证据可为BP7_Strong(RNA)", decision: "区分同义/内含子低先验场景与实测无剪接影响。RNA强度要审核组织表达、对照、实验覆盖及残余机制。", stop: "同义不等于良性；仅minigene结果不可无条件取满强度；同一剪接信息避免重复计入。", record: "位置、预测与实验数据分别记录，注明RNA后缀及适用条件。", sources: ["splicing", "cspec"] },
];
strengthDetails.find(item => item.code === "PS1")!.sources.push("splicing");
strengthDetails.find(item => item.code === "BA1")!.sources.push("hub");
for (const code of ["PP3", "BP4"]) strengthDetails.find(item => item.code === code)!.table = "computational";

export const strengthTables: Record<string, { caption: string; headers: string[]; rows: string[][]; note: string }> = {
  computational: { caption: "REVEL错义校准示例（Pejaver 2022表2/4，非所有工具通用）", headers: ["方向", "Supporting", "Moderate", "Strong"], rows: [["PP3", "[0.644, 0.773)", "[0.773, 0.932)", "≥0.932"], ["BP4", "(0.183, 0.290]", "(0.016, 0.183]", "(0.003, 0.016]"]], note: "(0.290,0.644)不赋值。原文表2另列≤0.003的良性VeryStrong研究区间，但表4临床建议列至Strong；本页不据此自动赋BP4_VeryStrong，须核对适用规范。PP3与PM1合计不得超过Strong（4个贝叶斯分）；版本/模型或疾病特异阈值变化需重新核查。方括号包含端点，圆括号不包含。" },
  pm3: { caption: "PM3每位独立先证者的观察分（非贝叶斯分类分）", headers: ["观察", "确认反式", "相位未知"], rows: [["另一变异P", "1", "0.5"], ["另一变异LP", "1", "0.25"], ["另一变异VUS", "0.25（该类合计≤0.5）", "0"], ["纯合", "0.5（该类合计≤1）", "不适用"]], note: "≥0.5 / ≥1 / ≥2 / ≥4依次为Supporting / Moderate / Strong / VeryStrong；不足0.5不满足。纯合不是两次反式观察。" },
  denovo: { caption: "PS2/PM6 每例新生观察计点", headers: ["表型", "亲缘确认", "亲缘未确认"], rows: [["高度特异", "2", "1"], ["一致但非高度特异", "1", "0.5"], ["一致、非特异且高遗传异质性", "0.5", "0.25"], ["不一致", "0", "0"]], note: "高遗传异质性这一类合计最多贡献1分。合计≥0.5/1/2/4对应支持/中等/强/极强；同一新生证据域只计一次。AR且未找到另一P/LP等特殊情形依原文另行降级，不能仅查表。" },
  functional: { caption: "经验证实验的OddsPath映射（Brnich表3）", headers: ["方向", "支持", "中等", "强", "极强"], rows: [["PS3", ">2.1", ">4.3", ">18.7", ">350"], ["BS3", "<0.48", "<0.23", "<0.053", "此表未定义"]], note: "取满足的最高级，0.48–2.1不提供方向性证据。表中为严格不等号；OddsPath不是p值。良性中等强度的组合应使用兼容框架，不能直接塞进未经调整的2015组合表。" },
  segregation: { caption: "2024简化模型：有信息量的共分离贝叶斯分", headers: ["观察", "每位贡献", "关键前提"], rows: [["AR受累", "+2", "不重复建立相位信息"], ["AR未受累", "+0.4", "完全外显；不计建立相位的父母"], ["AD受累/未受累", "+1", "未受累计分要求完全外显"], ["X连锁隐性男性", "+1", "按原文家系模型"]], note: "PP1与PP4通常合计封顶+5（特例须查原文）；同一等位基因多候选需分配。1/2/4分对应支持/中等/强；+5可表示强+支持，不是极强。低外显率等复杂情况不适用简化人数表。" },
};
