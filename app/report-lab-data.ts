export type ReportMode = "family" | "singleton";
export type ReportPlatform = "WES" | "WGS";

export const reportSectionIds = [
  "intake",
  "assay",
  "conclusion",
  "primary",
  "evidence",
  "phenotype",
  "additional",
  "limitations",
  "recommendations",
  "review",
] as const;

export type ReportSectionId = (typeof reportSectionIds)[number];
export type ReportDraft = Record<ReportSectionId, string>;

export type ReportSection = {
  id: ReportSectionId;
  no: string;
  title: string;
  shortTitle: string;
  purpose: string;
  prompt: string;
  placeholder: string;
  checks: string[];
  reference: string[];
  minChars: number;
};

export type ReportExpectation = {
  label: string;
  terms: string[];
  match: "all" | "any";
};

export type ReportScenario = {
  id: string;
  mode: ReportMode;
  platform?: ReportPlatform;
  category: string;
  title: string;
  brief: string;
  caseFile: string[];
  expectedBoundary: string;
  expectations: ReportExpectation[];
  safetyTerms: ReportExpectation[];
  source: { label: string; url: string };
};

export const reportSections: ReportSection[] = [
  {
    id: "intake",
    no: "01",
    title: "病例与样本信息",
    shortTitle: "病例资料",
    purpose: "先固定谁被检测、为何检测，以及哪些表型信息真正可用于解释。",
    prompt: "概括受检者、送检原因、起病过程、核心阳性/阴性表型、HPO以及家族史。家系分析还应逐一说明成员关系、患病状态和可用样本。",
    placeholder: "例如：受检者……；核心表型/HPO……；家族史……；本次可用样本包括……",
    checks: ["不录入真实姓名、证件号或联系方式", "区分明确阴性表型和未记录", "家系成员关系与患病状态可追溯"],
    reference: ["病例时间线比表型关键词堆叠更重要", "单人检测不能凭空获得家系来源信息", "表型术语应与原始病历含义一致"],
    minChars: 45,
  },
  {
    id: "assay",
    no: "02",
    title: "检测范围与质量",
    shortTitle: "检测与质控",
    purpose: "说明本次结论建立在哪种样本、组装版本、检测范围和质量边界上。",
    prompt: "写明样本类型、WES/WGS策略、GRCh38、覆盖/深度概况、纳入的变异类型、验证状态及关键低覆盖区域。不要把检测能力等同于报告范围。",
    placeholder: "本次采用……；参考组装GRCh38；质量指标……；可靠评价范围……；验证状态……",
    checks: ["参考组装明确为GRCh38", "质量不足有停止或升级路径", "区分SNV/indel、CNV、mtDNA、LOH/STR等能力"],
    reference: ["覆盖不足不是阴性", "WES来源CNV需要匹配实验室验证范围", "检测方法和报告阈值必须分别说明"],
    minChars: 55,
  },
  {
    id: "conclusion",
    no: "03",
    title: "病例级检测结论",
    shortTitle: "总论",
    purpose: "用一段话回答是否支持分子诊断、部分解释、保持不确定或仍未解决。",
    prompt: "先写事实，再区分变异分类、基因型/相位和病例相关性。明确结论能解释哪些表型、不能证明什么。",
    placeholder: "检出……；综合遗传模式、相位与表型……；本次结果支持/不足以支持……；仍不能……",
    checks: ["变异致病性不等于病例诊断", "VUS不用于确诊或不可逆决定", "阴性不写成排除遗传病"],
    reference: ["阳性结论也需要临床分型边界", "P/LP加VUS通常仍是不确定病例结论", "双重诊断需要分别说明解释范围"],
    minChars: 65,
  },
  {
    id: "primary",
    no: "04",
    title: "主要变异与家系结果",
    shortTitle: "主要结果",
    purpose: "给出可复现的变异表示，并让合子状态、来源和相位与样本设计一致。",
    prompt: "逐条写基因、带版本转录本、c./p.HGVS、合子状态、分类、疾病及遗传模式。家系版写各成员基因型、来源和相位；单人版明确哪些信息无法确定。",
    placeholder: "基因/转录本/HGVS……；受检者基因型……；亲属结果或来源……；相位……；相关疾病/遗传模式……",
    checks: ["转录本带版本号", "预测蛋白后果使用规范表达", "来源、相位和新发不超出数据"],
    reference: ["两条杂合变异不能自动称为反式", "父母未检出不自动等于已确认新发", "CNV命名不能超过检测分辨率"],
    minChars: 80,
  },
  {
    id: "evidence",
    no: "05",
    title: "证据与分类说明",
    shortTitle: "证据审计",
    purpose: "留下能够复核的证据快照，而不是只给分类标签。",
    prompt: "分别说明基因—疾病关系、适用规范版本、每条ACMG/AMP代码及强度、数据来源、反证和避免重复计分的处理。CNV使用相应的ACMG/ClinGen框架。",
    placeholder: "规范/版本……；证据代码与强度……；数据来源/日期……；反证……；综合分类……",
    checks: ["优先适用VCEP或ClinGen细化规范", "PM2、PVS1、PS2/PM6、PM3等强度有依据", "ClinVar结论不重复转成PP5/BP6"],
    reference: ["记录数据库版本和检索日期", "多款预测软件通常仍是一组计算证据", "分类绑定具体基因—疾病—遗传模式"],
    minChars: 90,
  },
  {
    id: "phenotype",
    no: "06",
    title: "疾病、遗传模式与表型整合",
    shortTitle: "病例整合",
    purpose: "说明为什么这些变异能够或不能解释这个病例。",
    prompt: "对照疾病实体、遗传模式、基因型要求、外显率和核心表型，说明已解释与未解释表现，并考虑鉴别诊断或第二诊断。",
    placeholder: "该基因与……的关系……；遗传模式要求……；患者吻合点……；未解释表型……；替代解释……",
    checks: ["不把基因名直接等同疾病", "不忽略外显率与可变表达", "允许部分解释、双重诊断或未解决"],
    reference: ["表型相似不能升级VUS", "遗传模式不符时先解决基因型问题", "报告应指出仍未解释的核心表型"],
    minChars: 65,
  },
  {
    id: "additional",
    no: "07",
    title: "其他结果与二级发现",
    shortTitle: "其他结果",
    purpose: "分开处理次要候选、CNV/线粒体结果、二级发现以及没有开展的分析。",
    prompt: "按检测和知情同意范围说明次要结果、CNV、mtDNA、LOH/STR和二级发现。无结果时也写清‘未报告’对应的范围，而非笼统阴性。",
    placeholder: "次要候选……；CNV/mtDNA……；二级发现知情同意与版本……；未开展或未可靠评价项目……",
    checks: ["二级发现与当前主诉分开", "仅在同意和当前政策范围内报告", "未开展不写成未检出"],
    reference: ["二级发现应记录所用清单版本", "WES的CNV阴性仍保留方法残余风险", "线粒体结果需说明样本组织和异质性"],
    minChars: 45,
  },
  {
    id: "limitations",
    no: "08",
    title: "检测局限性与残余风险",
    shortTitle: "局限性",
    purpose: "把与本病例真正相关的盲区写出来，而不是粘贴通用免责声明。",
    prompt: "说明低覆盖、深内含子、重复/同源区、复杂结构变异、重复扩增、低比例嵌合、甲基化或知识库限制中与本病例相关的部分。",
    placeholder: "本次方法对……检出能力有限；阴性/部分结果仍不能排除……；必要时可考虑……",
    checks: ["局限性与病例候选机制相关", "阴性保留技术和知识残余风险", "不以免责声明替代分析责任"],
    reference: ["WES通常不可靠覆盖全部深内含子", "低比例嵌合需要匹配组织和深度", "重分析可以解决知识更新，不能解决所有技术盲区"],
    minChars: 55,
  },
  {
    id: "recommendations",
    no: "09",
    title: "验证、随访与遗传咨询",
    shortTitle: "建议",
    purpose: "给出能够解决当前不确定性的下一步，同时避免越过实验室报告职责。",
    prompt: "区分变异确认、亲缘/相位验证、针对性补充检测、专科评估、家系检测、遗传咨询和重分析。不要直接给出个体化治疗处方。",
    placeholder: "建议按验证流程……；为解决相位/第二等位基因……；建议遗传咨询……；重分析触发条件……",
    checks: ["每项建议对应一个未解决问题", "不把VUS用于无症状亲属预测", "不直接作出治疗或生育决定"],
    reference: ["验证建议应回答真实性、来源或相位中的具体问题", "阴性病例优先提出针对性升级而非重复同一检测", "重分析要记录时间或临床触发条件"],
    minChars: 55,
  },
  {
    id: "review",
    no: "10",
    title: "复核与版本冻结",
    shortTitle: "签发复核",
    purpose: "在签发前检查样本、表示、证据、病例结论和报告版本是否互相一致。",
    prompt: "写出最终复核清单：样本身份/关系、HGVS、分类与证据、病例结论、二级发现同意、验证状态、数据库日期、撰写与复核版本。",
    placeholder: "已复核……；待完成……；证据快照日期……；报告版本……；若……则触发更新……",
    checks: ["至少两层复核概念", "冻结证据与数据库日期", "变异再分类后重新评估病例结论"],
    reference: ["不能只替换分类标签而不重做病例整合", "保留报告修改原因和历史版本", "站内评分不等同临床签发资格"],
    minChars: 45,
  },
];

const traceability: ReportExpectation[] = [
  { label: "规范变异表示", terms: ["NM_", "c."], match: "all" },
  { label: "病例级限定", terms: ["支持", "结合临床"], match: "all" },
];

export const reportScenarios: ReportScenario[] = [
  {
    id: "family-denovo",
    mode: "family",
    category: "阳性 · 新生",
    title: "三联体显性新发",
    brief: "PTPN11相关Noonan综合征；受检者杂合变异，父母未检出并完成亲缘与质量核查。",
    caseFile: ["三联体WES，GRCh38", "PTPN11 NM_002834.5:c.922A>G [p.(Asn308Asp)]", "受检者杂合；父母未检出；亲缘确认", "表型与Noonan综合征高度吻合"],
    expectedBoundary: "可以支持分子诊断，但不能仅凭变异预测全部严重度；新发证据需建立在亲缘、覆盖和嵌合核查上。",
    expectations: [
      { label: "完整变异", terms: ["PTPN11", "NM_002834.5", "c.922A>G", "p.(Asn308Asp)"], match: "all" },
      { label: "家系来源", terms: ["父母未检出", "亲缘", "新发"], match: "all" },
      { label: "分类依据", terms: ["致病", "PS2"], match: "all" },
      { label: "表型整合", terms: ["Noonan", "支持"], match: "all" },
      ...traceability,
    ],
    safetyTerms: [{ label: "严重度边界", terms: ["不能", "严重度"], match: "all" }],
    source: { label: "ClinGen RASopathy VCEP", url: "https://clinicalgenome.org/affiliation/50020/" },
  },
  {
    id: "family-ar",
    mode: "family",
    category: "阳性 · 隐性",
    title: "复合杂合反式确认",
    brief: "PAH缺乏症；两条P/LP变异分别来自父母，经家系结果确认反式。",
    caseFile: ["经典三联体WES", "PAH NM_000277.3两条杂合变异", "分别父源和母源，反式确认", "持续高苯丙氨酸血症"],
    expectedBoundary: "两条变异必须分别分类；反式、双等位基因型和生化表型共同支持病例级结论。",
    expectations: [
      { label: "双变异", terms: ["PAH", "两条", "NM_000277.3"], match: "all" },
      { label: "分别分类", terms: ["分别", "致病"], match: "all" },
      { label: "相位来源", terms: ["父源", "母源", "反式"], match: "all" },
      { label: "生化相关性", terms: ["苯丙氨酸", "支持"], match: "all" },
      { label: "咨询建议", terms: ["遗传咨询", "家系"], match: "all" },
    ],
    safetyTerms: [{ label: "临床分型边界", terms: ["结合", "临床"], match: "all" }],
    source: { label: "ClinGen PAH VCEP", url: "https://clinicalgenome.org/affiliation/50007/" },
  },
  {
    id: "family-pvus",
    mode: "family",
    category: "未解决 · P/VUS",
    title: "致病加VUS且反式",
    brief: "隐性病一条致病变异和一条VUS；家系验证支持反式，但VUS证据仍不足。",
    caseFile: ["家系WES", "同一隐性病基因P + VUS", "父母来源支持反式", "表型与疾病谱相符"],
    expectedBoundary: "反式可以支持证据评估，但不能自动升级VUS；病例结论通常保持未解决。",
    expectations: [
      { label: "两条分别分类", terms: ["致病", "VUS"], match: "all" },
      { label: "反式", terms: ["反式", "家系"], match: "all" },
      { label: "不确定结论", terms: ["不足", "分子诊断"], match: "all" },
      { label: "VUS边界", terms: ["不能", "VUS"], match: "all" },
      { label: "解决路径", terms: ["RNA", "功能", "重分析"], match: "any" },
    ],
    safetyTerms: [{ label: "禁止VUS确诊", terms: ["VUS", "不应"], match: "all" }],
    source: { label: "ClinGen PM3 guidance", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" },
  },
  {
    id: "family-cnv",
    mode: "family",
    category: "阳性 · CNV",
    title: "外显子级CNV与母系验证",
    brief: "男童DMD exon 50半合子缺失；外显子级方法确认，并进行母系携带/嵌合评估。",
    caseFile: ["WES提示，外显子级方法确认", "DMD exon 50半合子缺失", "预测破坏阅读框", "母系状态需单独评估"],
    expectedBoundary: "按检测分辨率报告外显子范围，不编造精确断点；家系风险需考虑母系生殖系嵌合。",
    expectations: [
      { label: "CNV与基因型", terms: ["DMD", "exon 50", "半合子"], match: "all" },
      { label: "阅读框", terms: ["阅读框", "功能缺失"], match: "all" },
      { label: "确认方法", terms: ["确认", "外显子"], match: "all" },
      { label: "分辨率边界", terms: ["断点", "未确定"], match: "all" },
      { label: "母系建议", terms: ["母系", "嵌合", "遗传咨询"], match: "all" },
    ],
    safetyTerms: [{ label: "不编造断点", terms: ["精确断点", "未"], match: "all" }],
    source: { label: "ACMG/ClinGen constitutional CNV standard", url: "https://pubmed.ncbi.nlm.nih.gov/31690835/" },
  },
  {
    id: "family-segregation",
    mode: "family",
    category: "边界 · 共分离",
    title: "不完全外显的家系共分离",
    brief: "显性候选变异见于多名受累亲属，也见于一名表型评估不充分的成年亲属。",
    caseFile: ["多代家系", "显性遗传假设", "多个有效减数分裂", "一名所谓‘健康携带者’表型评估不足"],
    expectedBoundary: "共分离强度必须考虑有效减数分裂、外显率、年龄和表型评估，不能只数阳性亲属。",
    expectations: [
      { label: "家系结构", terms: ["家系", "受累", "未受累"], match: "all" },
      { label: "共分离", terms: ["PP1", "共分离"], match: "all" },
      { label: "外显率", terms: ["外显率", "年龄"], match: "all" },
      { label: "反证核查", terms: ["表型评估", "反证"], match: "all" },
      { label: "克制结论", terms: ["不能", "仅凭"], match: "all" },
    ],
    safetyTerms: [{ label: "健康不能直接作BS4", terms: ["评估不足", "不能"], match: "all" }],
    source: { label: "ClinGen PP1/BS4 and PP4 guidance", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" },
  },
  {
    id: "family-secondary",
    mode: "family",
    category: "二级发现",
    title: "主诊断外的可报告发现",
    brief: "主诉已获得解释；另在知情同意范围内发现ACMG二级发现清单相关P/LP变异。",
    caseFile: ["家系ES", "主诊断结果单独报告", "二级发现与当前主诉无关", "需核查同意范围、清单版本和亲属结果"],
    expectedBoundary: "主结果与二级发现分开；不把二级发现当作解释当前表型的证据。",
    expectations: [
      { label: "结果分层", terms: ["主要结果", "二级发现"], match: "all" },
      { label: "同意范围", terms: ["知情同意", "范围"], match: "all" },
      { label: "版本", terms: ["ACMG", "版本"], match: "all" },
      { label: "主诉无关", terms: ["无关", "当前表型"], match: "all" },
      { label: "家系建议", terms: ["家系", "遗传咨询"], match: "all" },
    ],
    safetyTerms: [{ label: "不混入主诊断", terms: ["分开", "二级发现"], match: "all" }],
    source: { label: "ACMG Secondary Findings", url: "https://search.clinicalgenome.org/kb/genes/acmgsf" },
  },
  {
    id: "single-ad",
    mode: "singleton",
    category: "阳性 · 单人",
    title: "显性病单人阳性",
    brief: "受检者检出与表型高度相关的显性致病变异，但没有父母样本。",
    caseFile: ["单人WES", "显性病P/LP杂合变异", "父母样本不可用", "表型与疾病谱吻合"],
    expectedBoundary: "可以报告杂合和病例相关性，但来源未知，不能写为新发。",
    expectations: [
      { label: "完整表示", terms: ["NM_", "c.", "杂合"], match: "all" },
      { label: "显性模式", terms: ["常染色体显性", "表型"], match: "all" },
      { label: "来源未知", terms: ["来源未知", "父母"], match: "all" },
      { label: "病例结论", terms: ["支持", "分子诊断"], match: "all" },
      { label: "家系建议", terms: ["父母", "验证", "遗传咨询"], match: "all" },
    ],
    safetyTerms: [{ label: "禁止推定新发", terms: ["不能", "新发"], match: "all" }],
    source: { label: "ACMG/AMP 2015", url: "https://pubmed.ncbi.nlm.nih.gov/25741868/" },
  },
  {
    id: "single-phase",
    mode: "singleton",
    category: "未解决 · 相位",
    title: "两条杂合但相位未知",
    brief: "隐性病基因检出两条候选变异，缺少亲属样本且读段不能定相。",
    caseFile: ["单人WES", "同一隐性病基因两条杂合变异", "短读段无法定相", "家系样本暂不可用"],
    expectedBoundary: "不能写为已确认复合杂合或反式；相位未知会直接限制病例结论。",
    expectations: [
      { label: "双变异", terms: ["两条", "杂合", "分别分类"], match: "all" },
      { label: "相位未知", terms: ["相位未知", "不能"], match: "all" },
      { label: "不确定结论", terms: ["不足", "分子诊断"], match: "all" },
      { label: "定相建议", terms: ["父母", "定相"], match: "all" },
      { label: "残余风险", terms: ["残余风险", "重分析"], match: "all" },
    ],
    safetyTerms: [{ label: "禁止默认反式", terms: ["不能", "反式"], match: "all" }],
    source: { label: "ClinGen PM3 guidance", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" },
  },
  {
    id: "single-carrier",
    mode: "singleton",
    category: "部分结果",
    title: "隐性病仅检出一条P",
    brief: "PAH相关表型明显，但WES仅检出一条杂合致病变异。",
    caseFile: ["单人WES", "PAH NM_000277.3一条杂合致病变异", "未检出第二条可报告等位基因", "生化异常仍高度提示PAH通路"],
    expectedBoundary: "单条隐性致病等位基因通常不足以建立双等位分子诊断，需要针对第二等位基因和鉴别诊断升级。",
    expectations: [
      { label: "单等位结果", terms: ["PAH", "一条", "杂合", "致病"], match: "all" },
      { label: "病例边界", terms: ["不足", "双等位", "分子诊断"], match: "all" },
      { label: "CNV升级", terms: ["缺失", "重复", "CNV"], match: "any" },
      { label: "其他机制", terms: ["深内含子", "覆盖", "复杂变异"], match: "any" },
      { label: "鉴别诊断", terms: ["鉴别", "生化"], match: "all" },
    ],
    safetyTerms: [{ label: "不写已确诊", terms: ["不足", "确诊"], match: "all" }],
    source: { label: "ACMG NGS technical standard", url: "https://pubmed.ncbi.nlm.nih.gov/33927380/" },
  },
  {
    id: "single-negative",
    mode: "singleton",
    category: "阴性 · 未解决",
    title: "WES未发现可报告解释",
    brief: "质量合格的单人WES未发现符合报告标准的表型相关变异。",
    caseFile: ["单人WES", "主要靶区质量总体合格", "未发现符合报告标准的解释", "仍有关键表型未解决"],
    expectedBoundary: "阴性只描述本次检测和当前知识范围，不能排除遗传病。",
    expectations: [
      { label: "准确阴性", terms: ["未发现", "可报告", "解释"], match: "all" },
      { label: "残余风险", terms: ["不能排除", "遗传病"], match: "all" },
      { label: "技术限制", terms: ["深内含子", "结构变异", "重复扩增"], match: "any" },
      { label: "升级路径", terms: ["WGS", "RNA", "重分析"], match: "any" },
      { label: "触发条件", terms: ["新表型", "时间", "重分析"], match: "any" },
    ],
    safetyTerms: [{ label: "不得写排除", terms: ["不能排除", "阴性"], match: "all" }],
    source: { label: "ACMG NGS technical standard", url: "https://pubmed.ncbi.nlm.nih.gov/33927380/" },
  },
  {
    id: "single-mosaic",
    mode: "singleton",
    category: "边界 · 嵌合",
    title: "受累组织低比例嵌合",
    brief: "受累组织检出PIK3CA低比例致病变异，外周血阴性。",
    caseFile: ["受累组织高深度检测", "PIK3CA NM_006218.4:c.3140A>G [p.(His1047Arg)]", "VAF约6%，正交方法复核", "外周血未检出"],
    expectedBoundary: "报告必须绑定组织、方法、深度和VAF；血液阴性不能排除组织限制性嵌合。",
    expectations: [
      { label: "完整变异", terms: ["PIK3CA", "NM_006218.4", "c.3140A>G"], match: "all" },
      { label: "组织与VAF", terms: ["受累组织", "VAF", "6%"], match: "all" },
      { label: "方法确认", terms: ["高深度", "复核"], match: "all" },
      { label: "血液边界", terms: ["外周血", "不能排除", "嵌合"], match: "all" },
      { label: "咨询限定", terms: ["复发风险", "遗传咨询"], match: "all" },
    ],
    safetyTerms: [{ label: "不把VAF当严重度尺", terms: ["不能", "严重度"], match: "all" }],
    source: { label: "ClinGen Brain Malformations VCEP", url: "https://clinicalgenome.org/affiliation/50039/" },
  },
  {
    id: "single-mt",
    mode: "singleton",
    category: "线粒体",
    title: "mtDNA异质性结果",
    brief: "血液样本检出与线粒体疾病相关的mtDNA变异，需要结合异质性、组织和母系信息。",
    caseFile: ["WES附带mtDNA分析", "血液样本", "报告变异异质性比例", "缺少肌肉/尿沉渣等其他组织结果"],
    expectedBoundary: "异质性具有组织和年龄依赖性；血液结果不能直接代表所有组织或预测严重度。",
    expectations: [
      { label: "参考序列", terms: ["NC_012920", "m."], match: "all" },
      { label: "异质性", terms: ["异质性", "比例"], match: "all" },
      { label: "组织信息", terms: ["血液", "组织"], match: "all" },
      { label: "母系线索", terms: ["母系", "家族史"], match: "all" },
      { label: "严重度边界", terms: ["不能", "严重度"], match: "all" },
    ],
    safetyTerms: [{ label: "组织依赖", terms: ["组织", "不能"], match: "all" }],
    source: { label: "ClinGen mitochondrial specifications overview", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" },
  },
  {
    id: "single-secondary",
    mode: "singleton",
    category: "二级发现",
    title: "单人二级发现与家系建议",
    brief: "单人ES在知情同意范围内发现与当前表型无关的ACMG二级发现。",
    caseFile: ["单人ES", "主诊断仍按原病例结论", "二级发现P/LP", "亲属来源和分离状态未知"],
    expectedBoundary: "清楚分层、记录清单版本和同意范围；不推断亲属携带状态。",
    expectations: [
      { label: "分层", terms: ["二级发现", "当前表型", "无关"], match: "all" },
      { label: "同意", terms: ["知情同意", "范围"], match: "all" },
      { label: "版本", terms: ["ACMG", "版本"], match: "all" },
      { label: "来源未知", terms: ["来源未知", "亲属"], match: "all" },
      { label: "咨询", terms: ["家系验证", "遗传咨询"], match: "all" },
    ],
    safetyTerms: [{ label: "不推断亲属", terms: ["不能", "亲属"], match: "all" }],
    source: { label: "ACMG Secondary Findings", url: "https://search.clinicalgenome.org/kb/genes/acmgsf" },
  },
];

export const wgsReportScenarios: ReportScenario[] = [
  {
    id: "wgs-family-cnv", platform: "WGS", mode: "family", category: "CNV · 家系", title: "亲本平衡易位与胎儿不平衡重排", brief: "胎儿WGS见末端缺失伴另一染色体末端重复，母亲携带相关平衡易位。", caseFile: ["产前三联体WGS", "胎儿缺失+重复", "母亲平衡易位", "断点需结构级确认"], expectedBoundary: "将缺失、重复和亲本易位整合为同一重排模型；分别评价区段，但不重复计算病例证据。", expectations: [{label:"事件重建",terms:["同一", "重排"],match:"all"},{label:"区段分类",terms:["缺失", "重复", "分别"],match:"all"},{label:"来源",terms:["母亲", "平衡易位"],match:"all"},{label:"验证",terms:["核型", "FISH", "断点"],match:"any"},{label:"咨询",terms:["复发风险", "遗传咨询"],match:"all"}], safetyTerms:[{label:"不拆成三个病因",terms:["同一", "事件"],match:"all"}], source:{label:"ACMG germline SV points to consider",url:"https://pubmed.ncbi.nlm.nih.gov/36507974/"}
  },
  {
    id: "wgs-family-upd", platform: "WGS", mode: "family", category: "ROH / UPD", title: "chr15长ROH与印记表型", brief: "三联体WGS发现chr15长拷贝中性纯合区域，临床提示印记疾病。", caseFile:["三联体WGS","chr15单染色体长ROH","无拷贝数改变","印记表型"], expectedBoundary:"ROH只提示UPD可能，必须用亲本来源及/或甲基化方法确认。", expectations:[{label:"观察事实",terms:["ROH", "拷贝中性"],match:"all"},{label:"机制假设",terms:["UPD", "印记"],match:"all"},{label:"确认",terms:["亲本来源", "甲基化"],match:"any"},{label:"分类边界",terms:["提示", "待确认"],match:"all"},{label:"隐性候选",terms:["隐性", "候选"],match:"all"}], safetyTerms:[{label:"不把ROH写成确诊",terms:["不能", "确诊"],match:"all"}], source:{label:"ACMG NGS technical standard",url:"https://pubmed.ncbi.nlm.nih.gov/33927380/"}
  },
  {
    id: "wgs-family-str", platform: "WGS", mode: "family", category: "STR", title: "DMPK重复扩增超出精确计数", brief: "WGS与专门检测支持DM1相关扩增，但当前方法只能提供重复范围或下界。", caseFile:["家系WGS","DMPK CTG扩增","超出精确计数范围","表型与家系表现可变"], expectedBoundary:"按DM1专项标准报告可支持的范围，不编造精确重复数或确定个体预后。", expectations:[{label:"位点",terms:["DMPK", "CTG"],match:"all"},{label:"范围",terms:["范围", "下界"],match:"any"},{label:"规范",terms:["DM1", "专项"],match:"all"},{label:"预后边界",terms:["不能", "预后"],match:"all"},{label:"咨询",terms:["遗传咨询", "家系"],match:"all"}], safetyTerms:[{label:"不编造数值",terms:["不能", "精确"],match:"all"}], source:{label:"ACMG DM1 technical standard (2024)",url:"https://pubmed.ncbi.nlm.nih.gov/38836869/"}
  },
  {
    id: "wgs-family-prenatal", platform: "WGS", mode: "family", category: "产前 · 倍性", title: "全基因组等位基因比例异常", brief: "产前三联体WGS出现提示三倍体的全基因组BAF模式，需要排除污染并正交确认。", caseFile:["产前样本","全基因组BAF异常","简化核型信号可能冲突","胎儿比例需核查"], expectedBoundary:"把倍性信号作为待确认发现，不从测序信号直接生成超出分辨率的确定核型。", expectations:[{label:"信号",terms:["BAF", "三倍体"],match:"all"},{label:"样本因素",terms:["污染", "胎儿比例"],match:"all"},{label:"确认",terms:["正交", "确认"],match:"all"},{label:"报告限定",terms:["待确认", "分辨率"],match:"all"},{label:"产前边界",terms:["孕周", "表型"],match:"any"}], safetyTerms:[{label:"不直接生成核型",terms:["不能", "核型"],match:"all"}], source:{label:"ACMG NGS technical standard",url:"https://pubmed.ncbi.nlm.nih.gov/33927380/"}
  },
  {
    id: "wgs-single-sv", platform: "WGS", mode: "singleton", category: "SV · 断点", title: "平衡易位中断疾病基因", brief: "单人WGS提示平衡易位一侧断点位于已知LOF疾病基因内。", caseFile:["单人WGS","split-read和异常读对支持","无明显拷贝数变化","另一断点仍需评价"], expectedBoundary:"先确认完整事件与双方断点，再评价基因中断机制；结构真实不等于自动致病。", expectations:[{label:"事件",terms:["平衡易位", "双方断点"],match:"all"},{label:"真实性",terms:["读段", "确认"],match:"all"},{label:"机制",terms:["LOF", "转录本"],match:"all"},{label:"另一断点",terms:["另一断点"],match:"all"},{label:"分类边界",terms:["不等于", "致病"],match:"all"}], safetyTerms:[{label:"验证不等于致病",terms:["真实性", "致病性"],match:"all"}], source:{label:"ACMG germline SV points to consider",url:"https://pubmed.ncbi.nlm.nih.gov/36507974/"}
  },
  {
    id: "wgs-single-mt", platform: "WGS", mode: "singleton", category: "mtDNA", title: "不同组织异质性不一致", brief: "血液低比例、尿沉渣较高比例检出同一mtDNA变异。", caseFile:["WGS mtDNA通道","血液8%","尿沉渣42%","母系信息有限"], expectedBoundary:"报告绑定组织、异质性、方法和检出限，不能用血液结果代表所有组织或预测严重度。", expectations:[{label:"表示",terms:["NC_012920", "m."],match:"all"},{label:"组织",terms:["血液", "尿沉渣"],match:"all"},{label:"异质性",terms:["8%", "42%"],match:"all"},{label:"方法",terms:["检出限", "方法"],match:"all"},{label:"严重度",terms:["不能", "严重度"],match:"all"}], safetyTerms:[{label:"组织依赖",terms:["组织", "不能"],match:"all"}], source:{label:"mtDNA ACMG/AMP specifications",url:"https://pubmed.ncbi.nlm.nih.gov/32906214/"}
  },
  {
    id: "wgs-single-cnv", platform: "WGS", mode: "singleton", category: "CNV · VUS", title: "新生重复但无明确TS机制", brief: "单人WGS检出4 Mb重复；区域无明确TS基因，父母检测后提示新生。", caseFile:["WGS CNV","4 Mb gain","无明确TS证据","新生且表型部分吻合"], expectedBoundary:"使用gain独立框架；新生和大小不能替代剂量敏感机制，分类可能仍为VUS。", expectations:[{label:"gain框架",terms:["gain", "重复"],match:"all"},{label:"剂量",terms:["TS", "剂量敏感"],match:"any"},{label:"新生边界",terms:["新生", "不能替代"],match:"all"},{label:"分类",terms:["VUS", "意义未明"],match:"any"},{label:"病例相关性",terms:["部分", "表型"],match:"all"}], safetyTerms:[{label:"不套用HI",terms:["不能", "HI"],match:"all"}], source:{label:"ACMG/ClinGen constitutional CNV standard",url:"https://pubmed.ncbi.nlm.nih.gov/31690835/"}
  },
  {
    id: "wgs-single-negative", platform: "WGS", mode: "singleton", category: "阴性 · 残余风险", title: "多通道WGS仍未解决", brief: "主要WGS通道质量合格且未发现可报告解释，但部分重复、甲基化和组织限制性机制未充分评价。", caseFile:["单人WGS","SNV/CNV/SV已分析","部分STR/甲基化未评价","新表型仍在出现"], expectedBoundary:"按通道描述本次未检出和未开展，保留技术与知识残余风险并给出针对性升级。", expectations:[{label:"准确阴性",terms:["未发现", "可报告", "解释"],match:"all"},{label:"通道状态",terms:["未开展", "未检出"],match:"all"},{label:"残余风险",terms:["不能排除", "遗传病"],match:"all"},{label:"升级",terms:["RNA", "甲基化", "长读长"],match:"any"},{label:"重分析",terms:["新表型", "重分析"],match:"all"}], safetyTerms:[{label:"不得写排除",terms:["不能排除", "阴性"],match:"all"}], source:{label:"ACMG NGS technical standard",url:"https://pubmed.ncbi.nlm.nih.gov/33927380/"}
  },
];

reportScenarios.push(...wgsReportScenarios);

export const emptyReportDraft = (): ReportDraft => Object.fromEntries(reportSectionIds.map((id) => [id, ""])) as ReportDraft;
