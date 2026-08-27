export type Lesson = {
  id: string;
  no: string;
  title: string;
  duration: string;
  objective: string;
  sections: [string, string][];
  checkpoint: string;
  practice?: { prompt: string; tasks: string[]; reveal: string };
  sources?: { label: string; url: string }[];
};

export type ExamQuestion = {
  id: string;
  q: string;
  options: string[];
  answer: number;
  tag: string;
  rationale: string;
};

export type EvidenceDrill = {
  id: string;
  title: string;
  stem: string;
  options: string[];
  expected: string[];
  explanation: string;
  risk: string;
};

export const supplementalLessons: Lesson[] = [
  {
    id: "timeline",
    no: "01",
    title: "起病年龄、自然史与检查窗口",
    duration: "25 分钟",
    objective: "把年龄依赖表现和疾病进展纳入表型权重，避免用错误时间点的阴性信息排除候选。",
    sections: [
      ["先画时间轴，再写HPO", "按出生、婴幼儿、学龄期和当前评估四个节点记录发育、神经、心脏和代谢事件。起病年龄常比表现名称本身更能区分先天异常、退行性疾病和晚发病。"],
      ["检查窗口决定阴性证据", "尚未到典型发病年龄、未完成针对性检查或检查灵敏度不足时，只能标为未知。真正的阴性表型需要合适年龄、合适方法和明确记录。"],
      ["治疗会改变自然史", "饮食、手术、康复和药物可能减轻或遮盖典型表现。解读时要区分未经治疗的自然史与干预后的观察结果，尤其是代谢病和可治疗遗传病。"],
      ["动态更新表型", "一次WES解读不是静态终点。随访新增表型、影像复查或生化变化，都可能改变候选排序和既有VUS的病例相关性。"],
    ],
    checkpoint: "病历未记录听力异常，不等同于听力正常；需要确认是否在适当年龄完成规范听力评估。",
    practice: { prompt: "3岁儿童疑似晚发视网膜病，当前眼底检查正常。如何编码？", tasks: ["区分阴性与未知", "记录检查年龄和方法", "说明是否降低候选基因优先级"], reveal: "通常应记录为当前检查未见异常并保留年龄限制，不宜把它作为强阴性表型排除晚发视网膜病基因。" },
    sources: [{ label: "Human Phenotype Ontology", url: "https://hpo.jax.org/" }, { label: "GeneReviews", url: "https://www.ncbi.nlm.nih.gov/books/NBK1116/" }],
  },
  {
    id: "inheritance-models",
    no: "01",
    title: "从家系推导遗传模型",
    duration: "30 分钟",
    objective: "在AD、AR、X连锁、线粒体、嵌合和外显率不全之间建立可检验的优先级。",
    sections: [
      ["模型是排序工具", "遗传模式不是只选一个答案。应建立首要模型与备选模型，并明确每个模型预期看到的合子状态、来源、家系分离和变异机制。"],
      ["父母正常的多种解释", "显性病先证者父母正常可来自真正新生、亲本生殖系或低比例嵌合、外显率不全、轻型表现或亲缘关系问题。三联体数据只能解决其中一部分。"],
      ["隐性病不只看两条变异", "需要确认两条变异分别分类、位于反式、符合相同疾病机制，并警惕一个等位基因上的复杂变异、CNV与SNV组合以及单亲二体。"],
      ["家系规模改变证据", "小家系缺少共分离信息并不等于反对致病；大家系则需系统记录受累和未受累成员、年龄、表型评估及有效减数分裂。"],
    ],
    checkpoint: "一位表型正常的父亲携带显性病候选变异，首先核查年龄、外显率和表型评估充分性，而不是直接判良性。",
    practice: { prompt: "先证者与母亲轻型、外祖母无表现，候选为显性基因。列出三种可解释家系的模型。", tasks: ["外显率不全", "表现度差异", "外祖母低比例嵌合或母亲新生"], reveal: "至少保留外显率不全、表现度差异和上一代嵌合/新生来源，并用更深入表型与高深度验证区分。" },
    sources: [{ label: "ACMG/AMP 2015", url: "https://www.acmg.net/docs/standards_guidelines_for_the_interpretation_of_sequence_variants.pdf" }],
  },
  {
    id: "phenotype-differential",
    no: "01",
    title: "鉴别诊断与表型反证",
    duration: "30 分钟",
    objective: "从单一候选匹配升级为疾病谱比较，主动寻找能推翻首选诊断的信息。",
    sections: [
      ["先定义疾病谱", "把核心表型组合成2–5个疾病机制相近的诊断簇，再比较每个候选对核心、支持和不相容表型的解释能力。"],
      ["反证必须被主动搜索", "高匹配候选也要询问：是否存在该病几乎必有但患者明确缺失的表现？是否有另一候选能更简洁地解释全部核心表型？"],
      ["表型扩展需要更高门槛", "文献未报道的表现可以是扩展，也可能是双重诊断、偶然共病或记录错误。单病例不能轻易扩大既有疾病谱。"],
      ["评分工具只是导航", "Exomiser等表型排序工具依赖输入HPO与知识库更新时间。分数不能替代基因—疾病有效性、变异机制和人工鉴别。"],
    ],
    checkpoint: "候选基因解释了3个非特异表现但无法解释唯一核心表型时，不应仅凭HPO命中数排在首位。",
    practice: { prompt: "一个候选解释智力障碍和癫痫，却无法解释反复低血糖；下一步怎么做？", tasks: ["重新识别核心表型", "考虑第二诊断", "核查代谢检查与检测盲区"], reveal: "把低血糖作为独立核心线索重新排序，评估双重诊断和代谢相关基因/变异类型，而不是强行扩展首个疾病谱。" },
    sources: [{ label: "HPO", url: "https://hpo.jax.org/" }, { label: "ClinGen Gene-Disease Validity", url: "https://clinicalgenome.org/curation-activities/gene-disease-validity/" }],
  },
  {
    id: "normalization",
    no: "02",
    title: "变异标准化与多等位位点",
    duration: "25 分钟",
    objective: "在检索数据库前统一表示方式，识别左对齐、最简表示和链方向造成的假差异。",
    sections: [
      ["同一事件可以长得不同", "indel在重复序列中可有多个等价坐标；VCF通常左对齐，而HGVS遵循3'规则。比较前需标准化，不能只做字符串匹配。"],
      ["拆分多等位位点", "一个VCF记录可包含多个ALT。每个ALT的基因型、深度、注释和人群频率必须分别读取，避免把另一ALT的注释带到当前变异。"],
      ["参考链方向", "基因位于负链时，转录本c.变化与基因组g.变化碱基方向相反。检索时同时保留GRCh38坐标与带版本转录本可减少错误。"],
      ["liftover不是无损转换", "跨GRCh37/38转换后应重新核对参考碱基、局部序列和等位基因；复杂区域与补丁序列可能无法可靠映射。"],
    ],
    checkpoint: "数据库未命中前，先排除参考版本、转录本版本、左右对齐和负链表示差异。",
    practice: { prompt: "同一indel在VCF与论文中相差3 bp，如何确认是否同一变异？", tasks: ["核对参考版本", "在局部序列中标准化", "比较等位基因而非坐标字符串"], reveal: "先统一参考组装与序列，再进行left-normalization/HGVS 3'规范化并核对局部单倍型。" },
    sources: [{ label: "HGVS Recommendations", url: "https://varnomen.hgvs.org/" }, { label: "NCBI Variation Services", url: "https://www.ncbi.nlm.nih.gov/variation/services/" }],
  },
  {
    id: "filtering",
    no: "02",
    title: "候选筛选不是固定阈值",
    duration: "30 分钟",
    objective: "把质量、频率、遗传模式、机制和表型组合为可回溯的多通道路由。",
    sections: [
      ["先分通道再排序", "至少保留显性de novo、隐性双等位、X连锁、线粒体、CNV/SV和已知致病变异通道。单一频率+功能过滤会漏掉关键机制。"],
      ["频率阈值来自疾病模型", "阈值取决于患病率、外显率、遗传异质性、等位异质性和祖源。罕见不等于致病，高于阈值才可能形成良性证据。"],
      ["保留已知例外", "低质量区域、创始变异、低外显风险等位基因和假基因区域需要专门规则。自动过滤掉的变异也应保留审计记录。"],
      ["筛选与分类分开", "候选排序可以使用表型和预测分数，但最终ACMG分类必须回到可审查的证据代码与疾病语境，不能把排序模型分数当作独立证据。"],
    ],
    checkpoint: "CADD高分只能帮助排序，不能直接替代PP3，更不能自动决定致病性。",
    practice: { prompt: "设计三联体神经发育病例的最小筛选通道。", tasks: ["de novo SNV/indel", "隐性与X连锁", "CNV/SV及嵌合", "已知致病与技术例外"], reveal: "至少并行运行新生、隐性、X连锁、结构变异/嵌合和已知致病例外通道，并记录每一步排除原因。" },
    sources: [{ label: "gnomAD", url: "https://gnomad.broadinstitute.org/" }, { label: "ClinGen Guidance", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" }],
  },
  {
    id: "blindspots",
    no: "02",
    title: "WES/WGS检测盲区与升级策略",
    duration: "30 分钟",
    objective: "能从阴性或单等位基因结果反推需要补充的技术方法。",
    sections: [
      ["覆盖不足不是阴性", "关键外显子低覆盖、GC极端、同源序列和低复杂区域会降低SNV/indel检出率。报告应区分已充分评估与无法可靠评价区域。"],
      ["结构和重复机制", "外显子级CNV、平衡重排、重复扩增、移动元件插入和复杂重排可能需要深度算法、长读长、MLPA或专门PCR。"],
      ["嵌合与样本选择", "低比例嵌合可能被标准胚系阈值过滤；血液未必代表病变组织。需要结合VAF、链偏倚、组织分布与高深度验证。"],
      ["从WES升级到WGS仍有边界", "WGS改善非编码和结构变异覆盖，但并非自动解决重复扩增、甲基化、RNA效应和某些同源区域。升级建议必须针对具体未解决机制。"],
    ],
    checkpoint: "隐性病只找到一条致病变异时，应优先审查CNV、覆盖缺口、深内含子和相位，而不是直接结束。",
    practice: { prompt: "DMD样表型WES阴性，列出针对性的补充检测。", tasks: ["外显子CNV", "覆盖缺口", "深内含子/RNA", "低比例嵌合"], reveal: "根据既有数据先评估DMD缺失重复与覆盖，再考虑RNA/基因组检测和适当组织的嵌合验证。" },
    sources: [{ label: "ACMG NGS Standards", url: "https://www.nature.com/articles/gim201392" }],
  },
  {
    id: "transcript-selection",
    no: "03",
    title: "疾病相关转录本选择",
    duration: "25 分钟",
    objective: "在MANE、组织表达、历史临床转录本和疾病机制之间做出可说明的选择。",
    sections: [
      ["MANE解决一致性，不保证疾病最相关", "MANE Select便于跨数据库交流，但某些疾病由特定组织或替代外显子转录本驱动。应同时核查MANE Plus Clinical和专家组规范。"],
      ["版本号不可省略", "转录本升级可能改变外显子边界、c.编号和蛋白后果。报告与证据表必须记录完整版本号，重分析时也要说明版本变化。"],
      ["表达证据要与组织匹配", "外显子在GTEx等成人组织中的低表达不能单独证明其与儿童疾病无关；需结合发育阶段、组织特异性和疾病病例。"],
      ["多转录本后果分别记录", "同一变异可在一个转录本为错义、另一个为内含子。用于分类的后果必须绑定所选疾病相关转录本。"],
    ],
    checkpoint: "不能因MANE转录本上是内含子变异，就忽略其在明确疾病相关转录本上破坏编码外显子的可能。",
    practice: { prompt: "数据库和实验室报告使用不同转录本，怎样统一？", tasks: ["确认疾病相关性", "转换并验证HGVS", "保留两套可追溯表示"], reveal: "选定并说明主报告转录本，同时保留数据库所用转录本映射，核查两个表达确指同一基因组等位基因。" },
    sources: [{ label: "MANE", url: "https://www.ncbi.nlm.nih.gov/refseq/MANE/" }, { label: "ClinGen Allele Registry", url: "https://reg.clinicalgenome.org/" }],
  },
  {
    id: "consequence",
    no: "03",
    title: "从序列后果到作用机制",
    duration: "30 分钟",
    objective: "区分注释后果、预测机制和实验确认事实，避免从一个术语直接跳到PVS1。",
    sections: [
      ["注释不是机制证明", "stop_gained、splice_region或missense只是序列层注释。是否导致功能缺失、显性负效或功能获得，需要结合基因—疾病机制。"],
      ["NMD需要位置判断", "提前终止密码子是否触发NMD取决于最后外显子连接等位置规则、转录本结构和已知逃逸情况。逃逸后还要评估截短蛋白区域。"],
      ["剪接预测保持预测措辞", "预测破坏剪接位点时使用p.?或预测后果，除非有合适RNA证据。RNA来自非相关组织或只检测异常产物也可能误导。"],
      ["错义机制可以不同", "同一基因的不同区域可能分别通过LOF、GOF或显性负效致病。不能把基因层面的“已知致病”替代变异层机制。"],
    ],
    checkpoint: "±1/2剪接变异也要确认LOF是否为疾病机制及该转录本是否相关，不能机械套用PVS1。",
    practice: { prompt: "最后外显子无义变异应检查什么？", tasks: ["NMD逃逸", "截短比例与关键结构域", "同区段致病/良性变异", "疾病机制"], reveal: "通常不能直接使用PVS1极强；需按PVS1决策树评估逃逸NMD后的蛋白影响并可能降级。" },
    sources: [{ label: "ClinGen PVS1", url: "https://clinicalgenome.org/docs/sequence-variant-interpretation/" }, { label: "ClinGen Splicing", url: "https://clinicalgenome.org/docs/sequence-variant-interpretation/" }],
  },
  {
    id: "hgvs-workshop",
    no: "03",
    title: "HGVS纠错与检索工作坊",
    duration: "30 分钟",
    objective: "能识别常见HGVS错误，并构造覆盖坐标、c.、p.和别名的检索式。",
    sections: [
      ["先验证参考序列", "检查参考序列类型、版本和c.1定义。基因组、转录本和蛋白参考序列不能混用，LRG历史表达也应映射到当前标准。"],
      ["预测蛋白加括号", "DNA层已确认但蛋白层未直接验证时写p.(Arg123Trp)；剪接变异常写p.?，不能把预测软件给出的单一异常转录本当成事实。"],
      ["复杂变异优先描述单倍型", "相邻变异可能形成delins或共同影响密码子。分别报告还是合并取决于相位和HGVS规则，错误拆分会改变蛋白后果。"],
      ["检索采用多表达", "使用基因+转录本c.、蛋白变化、GRCh38坐标、dbSNP/ClinVar ID和历史名称；每次命中都回到参考等位基因核对。"],
    ],
    checkpoint: "论文中的p.R408W只能作为检索入口，最终必须核对它是否对应当前病例的同一c.和g.等位基因。",
    practice: { prompt: "为PAH c.1222C>T设计最小检索组合。", tasks: ["NM_000277.3:c.1222C>T", "p.Arg408Trp/R408W", "GRCh38坐标", "ClinVar Variation ID"], reveal: "多表达并行检索后，以GRCh38等位基因与带版本MANE转录本确认同一性。" },
    sources: [{ label: "HGVS", url: "https://varnomen.hgvs.org/" }, { label: "VariantValidator", url: "https://variantvalidator.org/" }],
  },
  {
    id: "population-evidence",
    no: "04",
    title: "人群证据与频率阈值",
    duration: "35 分钟",
    objective: "根据疾病模型使用BA1、BS1、BS2和PM2，并识别覆盖、祖源与低外显率陷阱。",
    sections: [
      ["最大可信频率", "把患病率、遗传异质性、等位异质性、外显率和遗传模式转成最大可信等位基因频率。VCEP阈值优先于自行估计。"],
      ["读取频率前先看质量", "查看过滤状态、等位基因数、该位点覆盖和杂合/纯合观察。数据库中“0次”在低覆盖位点不能支持PM2。"],
      ["祖源与创始效应", "总体频率可能掩盖某亚群高频；也可能因创始变异在特定人群偏高。需要与病例祖源和疾病流行病学共同解释。"],
      ["PM2当前通常为支持级", "ClinGen通用建议将PM2降为支持证据。缺失于人群数据库只是弱致病支持，不能主导分类。"],
    ],
    checkpoint: "罕见性是必要但不充分条件；多数罕见错义变异并不致病。",
    practice: { prompt: "一个位点在gnomAD为0，但覆盖只有6×，能否用PM2？", tasks: ["查看可检出性", "寻找其他人群数据", "按规范决定是否不使用"], reveal: "低覆盖导致未观察不可解释，通常不应直接使用PM2；需其他高质量人群数据或明确可检出性。" },
    sources: [{ label: "gnomAD", url: "https://gnomad.broadinstitute.org/" }, { label: "ClinGen PM2", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" }],
  },
  {
    id: "case-family-evidence",
    no: "04",
    title: "病例、相位与共分离证据",
    duration: "40 分钟",
    objective: "正确使用PS2/PM6、PM3、PP1/BS4和PS4，避免病例重复与循环论证。",
    sections: [
      ["新生证据需要计点", "PS2/PM6强度取决于亲缘确认、表型特异性、遗传异质性和独立病例数。父母未检出不自动等于PS2强证据。"],
      ["PM3先解决相位", "另一等位基因的分类、反式确认方式、纯合观察和病例独立性共同决定点数。两条杂合变异不能默认反式。"],
      ["共分离关注有效信息", "PP1不是简单人数。需要考虑有效减数分裂、外显率、表型误分、家系成员年龄及同一单倍型上的其他候选。"],
      ["PS4防止重复患者", "病例系列、ClinVar提交和同一实验室队列可能重复。应尽量追踪原始论文、家系编号和招募来源。"],
    ],
    checkpoint: "同一家系三个受累兄弟姐妹不是三例完全独立病例，证据计算必须反映家系相关性。",
    practice: { prompt: "隐性病两变异由父母各传一条，可用于什么层面？", tasks: ["建立病例反式", "按规范评估PM3", "避免把教学或重复病例计入公共分类"], reveal: "可建立该病例的反式关系；若用于变异分类，还需满足病例独立性和VCEP计点要求。" },
    sources: [{ label: "ClinGen PS2/PM6", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" }, { label: "ClinGen PM3", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" }],
  },
  {
    id: "functional-computational",
    no: "04",
    title: "功能与计算证据的质量分级",
    duration: "40 分钟",
    objective: "从实验设计与工具校准判断PS3/BS3、PP3/BP4的适用性和强度。",
    sections: [
      ["实验是否测到疾病机制", "蛋白表达下降不一定等于疾病相关功能受损。实验读出需与已知致病机制和病理通路匹配。"],
      ["对照决定可解释性", "需要野生型、已知致病和已知良性对照，足够重复、盲法及可区分动态范围。缺少良性对照时很难支持BS3。"],
      ["预测工具必须校准", "使用VCEP指定工具与阈值，或有明确验证集的通用建议。多个工具共享训练数据，不能逐个累加。"],
      ["剪接证据有依赖关系", "同一RNA结果可能支撑PVS1而不是再叠加PS3；预测与实验证据的组合需按ClinGen剪接框架处理。"],
    ],
    checkpoint: "论文报告p<0.05不等于实验足以使用PS3；效应方向、大小、对照和机制更重要。",
    practice: { prompt: "只有过表达细胞中蛋白量下降30%，无良性对照，如何处理？", tasks: ["评估机制相关性", "检查动态范围", "通常不直接给PS3"], reveal: "证据质量不足以自动使用PS3；应记录为补充观察并寻找经过验证的功能体系。" },
    sources: [{ label: "ClinGen PS3/BS3", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" }],
  },
  {
    id: "gene-disease",
    no: "05",
    title: "基因—疾病有效性与疾病实体",
    duration: "30 分钟",
    objective: "在变异分类前确认基因、疾病实体、遗传模式和机制是否成立。",
    sections: [
      ["分类绑定疾病实体", "同一基因可关联多个疾病、遗传模式和机制。一个变异对显性GOF疾病的结论不能自动迁移到隐性LOF疾病。"],
      ["证据层级分开", "ClinGen基因—疾病有效性、变异致病性和患者相关性是三项不同判断。任何一项不足都会限制病例结论。"],
      ["新候选基因保持研究级", "少数病例或动物模型提示关联时，不宜套用临床五级分类形成确诊。报告应明确研究性质与复核需求。"],
      ["疾病命名要一致", "核对MONDO/OMIM实体、表型边界和遗传模式，避免将ClinVar中“not provided”或宽泛疾病聚合当作当前疾病的专家结论。"],
    ],
    checkpoint: "ClinVar的Pathogenic必须核查具体condition；不同疾病实体下可能有不同或冲突结论。",
    practice: { prompt: "某基因与疾病只有Limited有效性，但变异满足PVS1，能否确诊？", tasks: ["分开变异与基因疾病层", "限制临床结论", "考虑研究性验证"], reveal: "PVS1不能补足基因—疾病关系；病例结论通常仍受限，需明确研究级关联。" },
    sources: [{ label: "ClinGen Gene-Disease Validity", url: "https://clinicalgenome.org/curation-activities/gene-disease-validity/" }, { label: "MONDO", url: "https://mondo.monarchinitiative.org/" }],
  },
  {
    id: "recessive-phase",
    no: "05",
    title: "隐性病双等位基因整合",
    duration: "35 分钟",
    objective: "处理P/P、P/LP、P/VUS、纯合、半合子及SNV+CNV组合的病例结论。",
    sections: [
      ["两条变异分别分类", "不能把两条弱证据变异合在一起升级。每条变异都必须独立建立其对特定疾病的分类。"],
      ["相位决定基因型", "父母来源、长读长、克隆或读段相位可以建立反式；群体概率或距离只能提供有限推断。"],
      ["P/VUS不自动确诊", "一条致病加一条VUS通常不建立分子诊断，但可驱动相位、RNA、家系或功能验证。病例表型再典型也不能直接把VUS升级。"],
      ["纯合要排除技术假象", "检查近亲背景、拷贝数缺失、等位基因脱扣、单亲二体和比对问题。表面纯合可能实际是SNV+缺失。"],
    ],
    checkpoint: "病例层面的强吻合不能替代第二条VUS的变异层证据。",
    practice: { prompt: "隐性病检出P/VUS且已证实反式，报告如何写？", tasks: ["分别分类", "说明反式", "结论保持不确定", "提出能解决VUS的验证"], reveal: "说明一条致病、一条VUS反式存在，但通常不足以单据此建立分子诊断，并提出针对VUS的证据获取路径。" },
    sources: [{ label: "GeneReviews", url: "https://www.ncbi.nlm.nih.gov/books/NBK1116/" }, { label: "ClinGen PM3", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" }],
  },
  {
    id: "negative-dual",
    no: "05",
    title: "阴性、部分解释与双重诊断",
    duration: "35 分钟",
    objective: "在首轮分析未完全解释病例时，系统决定重分析和补充检测。",
    sections: [
      ["先定义解释比例", "列出已解释、可能解释和未解释的核心表型。一个确定诊断可以是真实的，同时仍无法解释全部病例。"],
      ["双重诊断并不罕见", "尤其在多系统、近亲婚配或非典型病例中，两个分子诊断可能共同构成表型。不要为保持单一诊断而过度扩展疾病谱。"],
      ["阴性结果保留残余风险", "报告检测范围、覆盖、变异类型限制和当前知识库边界。阴性只表示本次方法未发现可报告解释。"],
      ["重分析有明确触发点", "新增表型、数据库更新、VUS再分类、新基因关联和新算法都可触发。保存VCF、表型版本与证据快照便于可重复重分析。"],
    ],
    checkpoint: "已找到一个诊断后仍有无法解释的器官系统，应主动评估第二诊断而非自动归入表型扩展。",
    practice: { prompt: "确诊Noonan综合征但严重视网膜变性无法解释，下一步？", tasks: ["确认Noonan相关性边界", "重新分析眼病基因", "考虑隐性第二诊断"], reveal: "把视网膜变性作为独立核心表型重新分析，并评估第二分子诊断及相关检测盲区。" },
    sources: [{ label: "ClinGen", url: "https://clinicalgenome.org/" }],
  },
  {
    id: "positive-report",
    no: "06",
    title: "阳性报告的结构与限定",
    duration: "35 分钟",
    objective: "写出事实、分类、病例相关性和建议分层清楚的阳性报告。",
    sections: [
      ["结果段只写可核查事实", "基因、转录本版本、HGVS、合子状态、来源、参考组装与检测质量应完整；不要在事实段混入未经验证的因果推断。"],
      ["分类段说明证据快照", "列出关键证据及强度、适用规范、数据库/文献和检索日期。无需堆砌全部工具输出。"],
      ["病例相关性单独成段", "说明遗传模式、表型吻合度、能解释与不能解释的表现，以及是否达到支持分子诊断的层级。"],
      ["建议必须可执行", "区分实验室验证、临床专科评估、家系验证和遗传咨询。不要超出检测报告职责直接给出个体化治疗处方。"],
    ],
    checkpoint: "“变异致病”与“患者确诊”之间必须经过基因—疾病、遗传模式、合子状态和表型相关性判断。",
    practice: { prompt: "把“检测到致病变异，患者患该病”改写为三层结论。", tasks: ["变异分类", "基因疾病关系", "病例相关性"], reveal: "分别写明变异针对特定疾病的分类、已知基因—疾病关系，以及本病例的遗传模式/表型是否支持分子诊断。" },
    sources: [{ label: "ACMG/AMP 2015", url: "https://www.acmg.net/docs/standards_guidelines_for_the_interpretation_of_sequence_variants.pdf" }],
  },
  {
    id: "vus-negative-report",
    no: "06",
    title: "VUS与阴性报告",
    duration: "30 分钟",
    objective: "用不误导临床决策的方式报告不确定和阴性结果。",
    sections: [
      ["VUS保持不确定", "VUS不应单独用于确诊、预测无症状亲属或不可逆临床决定。可以说明其与表型的潜在相关性及可解决不确定性的验证。"],
      ["不要报告无关VUS噪音", "报告范围取决于检测目的、实验室政策和知情同意。大量与表型无关VUS会增加误用风险。"],
      ["阴性不是排除", "写明未发现符合报告标准的变异，并说明未覆盖区域、难检机制和知识局限，而不是“未发现遗传异常”。"],
      ["建议与未解决问题对应", "单等位隐性病建议CNV/深内含子与相位；疑似重复病建议专门检测；表型不足则建议补充临床评估。"],
    ],
    checkpoint: "VUS家系验证的目的通常是获取分类证据，而不是把携带VUS的亲属直接判为患病或高风险。",
    practice: { prompt: "写一段P/VUS隐性病结论。", tasks: ["两条分别分类", "不宣称确诊", "说明相位", "提出证据获取建议"], reveal: "结果提示候选但目前不足以建立分子诊断；建议完成相位与针对VUS的功能/病例证据评估，并保留重分析。" },
    sources: [{ label: "ACMG/AMP 2015", url: "https://www.acmg.net/docs/standards_guidelines_for_the_interpretation_of_sequence_variants.pdf" }],
  },
  {
    id: "reanalysis",
    no: "06",
    title: "重分析、再分类与沟通",
    duration: "30 分钟",
    objective: "建立可追溯的版本管理，并区分变异再分类与病例重新解释。",
    sections: [
      ["保存当时为什么这样判", "记录证据代码、强度、规范版本、数据库日期、关键文献和分析人员。只有证据快照完整，未来变化才可审计。"],
      ["再分类不等于诊断自动变化", "变异从VUS升为LP仍需重新检查疾病实体、合子状态、相位和患者表型；病例资料也可能已变化。"],
      ["定义重分析触发与周期", "实验室应按政策设置周期或事件触发。高疑似阴性病例、P/VUS和新生儿重症通常具有更高优先级。"],
      ["沟通变化的影响范围", "说明旧结论、新结论、变化依据、病例层影响与建议；避免只发一个新的五级分类标签。"],
    ],
    checkpoint: "数据库出现新提交只是重审触发器，不是自动改判依据。",
    practice: { prompt: "ClinVar由VUS变为专家组LP，实验室应怎么做？", tasks: ["核查疾病实体与证据", "按当前SOP独立复核", "重新评估病例影响", "记录版本变化"], reveal: "专家组结论权重高，但仍需确认适用疾病和当前病例语境，并按实验室流程出具可追溯更新。" },
    sources: [{ label: "ClinVar", url: "https://www.ncbi.nlm.nih.gov/clinvar/" }, { label: "ClinGen", url: "https://clinicalgenome.org/" }],
  },
];

export const lessonAddons: Record<string, Pick<Lesson, "practice" | "sources">> = {
  phenotype: { practice: { prompt: "把一段门诊描述转成核心、支持、阴性和未知四类表型。", tasks: ["至少2个核心表型", "只把明确检查过的项目列为阴性", "记录起病年龄"], reveal: "表型整理的质量取决于信息状态和时间，而不是HPO数量。" }, sources: [{ label: "HPO", url: "https://hpo.jax.org/" }] },
  quality: { practice: { prompt: "de novo候选VAF 0.18，父母各30×未见。列出复核顺序。", tasks: ["查看原始读段", "核查污染和亲缘", "高深度复核父母嵌合", "正交验证"], reveal: "低VAF先证者提示嵌合或伪影；父母30×不足以排除低比例嵌合。" }, sources: [{ label: "ACMG NGS Standards", url: "https://www.nature.com/articles/gim201392" }] },
  hgvs: { practice: { prompt: "为一个候选建立可复现记录。", tasks: ["GRCh38 g.坐标", "带版本转录本c.", "预测p.括号", "标准化与链方向"], reveal: "四层表示共同保留，数据库检索命中后再核对同一等位基因。" }, sources: [{ label: "HGVS", url: "https://varnomen.hgvs.org/" }] },
  acmg: { practice: { prompt: "写一条完整PM2理由，而不是只写“gnomAD未见”。", tasks: ["数据库版本", "位点覆盖", "祖源", "阈值与强度"], reveal: "说明数据版本、可检出性、相关祖源和疾病阈值，并按ClinGen通用建议使用支持强度。" }, sources: [{ label: "ClinGen Guidance", url: "https://clinicalgenome.org/tools/clingen-variant-classification-guidance/" }] },
  "case-level": { practice: { prompt: "把P/VUS隐性病拆成三层结论。", tasks: ["变异层", "基因型/相位层", "病例层"], reveal: "一条P与一条VUS即使反式，通常仍不足以单据此建立分子诊断。" }, sources: [{ label: "GeneReviews", url: "https://www.ncbi.nlm.nih.gov/books/NBK1116/" }] },
  report: { practice: { prompt: "写一个不超过120字的阳性结论段。", tasks: ["事实", "分类依据", "病例相关性", "限定与建议"], reveal: "先事实后解释，明确支持何种疾病以及仍不能证明什么。" }, sources: [{ label: "ACMG/AMP 2015", url: "https://www.acmg.net/docs/standards_guidelines_for_the_interpretation_of_sequence_variants.pdf" }] },
};

const l1: ExamQuestion[] = [
  { id:"l1-1", q:"病历没有提及听力，最合适的信息状态是？", options:["阴性表型","未知/未评估","正常","排除耳聋基因"], answer:1, tag:"表型", rationale:"未记录不等于经过适当检查后确认阴性。" },
  { id:"l1-2", q:"父母表型正常、先证者疑似显性病时，首要正确表述是？", options:["排除显性遗传","重点考虑de novo，同时保留外显率不全等可能","只筛隐性纯合","父母无需分析"], answer:1, tag:"遗传模式", rationale:"父母正常支持新生假设，但不能排除外显率不全、轻型或亲本嵌合。" },
  { id:"l1-3", q:"完整变异描述最不应缺少哪组信息？", options:["基因名和预测软件","GRCh38、带版本转录本、c.与p.","文献标题","CADD和REVEL"], answer:1, tag:"HGVS", rationale:"参考组装和带版本参考序列是可复现描述的基础。" },
  { id:"l1-4", q:"多个计算工具都预测有害，应如何使用？", options:["每个工具各计PP3","直接升级PS3","按校准组合使用一次并避免重复","等同功能实验"], answer:2, tag:"证据独立性", rationale:"工具输出高度相关，不能按工具数量累加。" },
  { id:"l1-5", q:"WES阴性结果最恰当的报告方式是？", options:["排除遗传病","未发现可报告解释，并说明限制与后续方向","等同良性","不写限制"], answer:1, tag:"阴性报告", rationale:"阴性结果保留技术与知识层面的残余风险。" },
  { id:"l1-6", q:"ClinVar专家组分类使用前首先核查什么？", options:["提交数量","疾病实体、遗传模式和规范版本","是否三颗星","是否有预测软件"], answer:1, tag:"数据库", rationale:"专家结论也绑定特定疾病实体与适用规范。" },
  { id:"l1-7", q:"隐性病两条杂合变异最关键的病例级问题是？", options:["都很罕见","是否位于反式且分别达到相应分类","是否同一外显子","总CADD是否高"], answer:1, tag:"相位", rationale:"两条变异需分别分类并建立反式关系。" },
  { id:"l1-8", q:"VUS可以直接用于哪项？", options:["不可逆临床决定","无症状亲属预测","设计进一步验证以解决不确定性","自动确诊"], answer:2, tag:"VUS", rationale:"VUS可引导证据获取，但不应作为确诊或不可逆决策的唯一依据。" },
];

const l2: ExamQuestion[] = [
  { id:"l2-1", q:"末端外显子无义变异使用PVS1前最需要判断？", options:["CADD是否>20","NMD逃逸及截短区域重要性","是否de novo","ClinVar提交数"], answer:1, tag:"PVS1", rationale:"逃逸NMD的截短变异需按PVS1决策树评估并常需降级。" },
  { id:"l2-2", q:"gnomAD未见但该位点覆盖很差，PM2应如何处理？", options:["直接PM2强","通常不能仅据未见使用","改用BA1","自动PP3"], answer:1, tag:"PM2", rationale:"低可检出性使“未观察”无法解释。" },
  { id:"l2-3", q:"父母未检出候选变异但未确认亲缘，最稳妥的是？", options:["必定PS2强","按PS2/PM6框架结合亲缘和表型计点","不需要看父母覆盖","直接排除伪影"], answer:1, tag:"PS2/PM6", rationale:"亲缘确认、父母覆盖、嵌合与表型特异性都会影响强度。" },
  { id:"l2-4", q:"功能实验只有野生型对照、无已知良性/致病对照，主要问题是？", options:["不能发表","难以校准动态范围和判定阈值","一定是PS3强","只能用PP3"], answer:1, tag:"PS3", rationale:"对照集合决定实验能否区分正常和异常功能。" },
  { id:"l2-5", q:"隐性病P/VUS已证实反式，病例结论通常是？", options:["必然确诊","仍不足以仅据此确诊，需解决VUS","VUS自动LP","仅携带者"], answer:1, tag:"PM3", rationale:"相位解决基因型结构，但不替代VUS的致病性证据。" },
  { id:"l2-6", q:"同一RNA实验已用于校准PVS1，是否还能自动叠加PS3？", options:["可以，越多越好","应检查证据依赖并按剪接规范避免重复","必须再加PP3","只要显著即可"], answer:1, tag:"证据独立性", rationale:"同一底层数据不能机械支撑多个相关代码。" },
  { id:"l2-7", q:"总体频率低但某祖源亚群显著偏高，首先应？", options:["只看总体","评估亚群质量、疾病频率和病例祖源","忽略祖源","自动BA1"], answer:1, tag:"人群证据", rationale:"亚群频率可能暴露与高外显罕见病不相容的观察，也可能反映创始效应。" },
  { id:"l2-8", q:"共分离证据最不能只依赖什么？", options:["有效减数分裂","外显率","阳性亲属人数","表型评估"], answer:2, tag:"PP1", rationale:"相关家系成员并非独立观察，需结合家系结构和有效信息。" },
];

const l3: ExamQuestion[] = [
  { id:"l3-1", q:"确定诊断解释心脏和面容，但不能解释视网膜变性，最佳策略？", options:["扩大首个疾病谱","评估双重诊断并重新分析眼病表型","忽略未解释表型","降级已确定变异"], answer:1, tag:"双重诊断", rationale:"确定诊断可以只解释部分表型，未解释的核心系统需独立分析。" },
  { id:"l3-2", q:"变异对疾病A为专家组致病，当前患者疑似同基因疾病B，正确做法？", options:["直接沿用致病","核查疾病实体、模式和机制后重新评价","使用PP5","按提交数投票"], answer:1, tag:"疾病实体", rationale:"分类不能脱离疾病实体和遗传机制迁移。" },
  { id:"l3-3", q:"表面纯合SNV但读深异常降低，最应排查？", options:["预测软件","另一等位基因外显子缺失或等位基因脱扣","PP4","性别错误"], answer:1, tag:"复杂基因型", rationale:"SNV+缺失可表现为假纯合，需要CNV与原始读段复核。" },
  { id:"l3-4", q:"VCEP旧版分类仍在ClinVar，重分析应？", options:["永久照抄","核查当前规范和新数据，同时保留旧结论来源","直接删除","只看更新时间"], answer:1, tag:"再分类", rationale:"专家组历史结论权重高，但重分析仍需核查当前适用性与新增反证。" },
  { id:"l3-5", q:"候选基因—疾病有效性为Limited，但变异满足PVS1，病例结论？", options:["临床确诊","受基因—疾病关系限制，通常保持研究级","PVS1自动补足关联","改成良性"], answer:1, tag:"基因疾病", rationale:"强变异证据不能替代基因—疾病有效性。" },
  { id:"l3-6", q:"报告“支持分子诊断”前必须同时满足的核心组合？", options:["高CADD+罕见","适用疾病关系、基因型/模式与表型一致","ClinVar提交多","患者愿意接受"], answer:1, tag:"病例整合", rationale:"病例级结论建立在变异、疾病关系、遗传模式和表型整合之上。" },
  { id:"l3-7", q:"同一患者被论文和ClinVar多次收录，PS4/PM3如何处理？", options:["每条记录都计分","去重后按独立先证者计算","按数据库数量加权","忽略原始论文"], answer:1, tag:"病例去重", rationale:"重复患者会人为放大病例证据。" },
  { id:"l3-8", q:"变异再分类为LP后，病例报告更新还需做什么？", options:["只替换标签","重新核查病例表型、相位、疾病实体和临床影响","删除旧记录","无需通知"], answer:1, tag:"重分析", rationale:"变异变化不自动等于病例结论变化，需要完整重新解释。" },
];

export const examBanks: Record<"L1" | "L2" | "L3", ExamQuestion[]> = { L1:l1, L2:l2, L3:l3 };

export const evidenceDrills: EvidenceDrill[] = [
  { id:"terminal-stop", title:"终末外显子截短", stem:"显性LOF疾病基因中发现最后外显子前部无义变异，预测逃逸NMD；截短约8%，该区段尚无明确关键功能证据。", options:["PVS1_VeryStrong","PVS1_Strong","PVS1_Moderate","暂不使用PVS1"], expected:["PVS1_Moderate"], explanation:"逃逸NMD且仅去除较小C端区段时，需按PVS1决策树评估，不能机械给极强；本练习答案锁定为中等。", risk:"忽略NMD位置与剩余蛋白功能。" },
  { id:"pm3-phase", title:"隐性病相位", stem:"先证者有一条已知致病变异和一条VUS，父母样本不可得，两变异相距很远且短读长无法定相。", options:["PM3_Strong","PM3_Supporting","相位未知，不使用PM3","默认反式"], expected:["相位未知，不使用PM3"], explanation:"缺少相位证据时不能假设反式；VUS本身也不能等同于已知致病等位基因。", risk:"看到两条杂合就默认复合杂合。" },
  { id:"de-novo", title:"新生证据", stem:"三联体显示候选仅见于先证者，父母覆盖均30×，未做亲缘确认，疾病表型高度异质。", options:["PS2_VeryStrong","PS2","按PS2/PM6框架降级评估","不需要验证"], expected:["按PS2/PM6框架降级评估"], explanation:"亲缘未确认、父母覆盖有限且表型异质，不能直接使用PS2强或极强。", risk:"把“父母未检出”当作完整新生证据。" },
  { id:"pm2", title:"人群缺失", stem:"错义变异在gnomAD未见，但位点只有20%的样本达到10×覆盖；疾病为极罕见显性病。", options:["PM2_Strong","PM2_Supporting","因可检出性差暂不使用PM2","BA1"], expected:["因可检出性差暂不使用PM2"], explanation:"数据库未观察必须建立在可靠可检出性上。", risk:"把0等位基因数当成绝对罕见。" },
  { id:"ps3", title:"功能实验质量", stem:"过表达细胞中突变蛋白量下降25%，仅有野生型对照，无已知致病/良性对照，读出与疾病机制关联不清。", options:["PS3_Strong","PS3_Supporting","暂不使用PS3","BS3"], expected:["暂不使用PS3"], explanation:"缺少校准对照、动态范围和机制相关读出，不能仅凭统计差异使用PS3。", risk:"看到功能差异和p值就赋PS3。" },
  { id:"conflict", title:"致病与良性冲突", stem:"变异满足一条功能致病证据，但在与疾病严重度和外显率不相容的健康成人群体中频率过高。", options:["忽略频率直接致病","先解决BS1/BA1与PS3冲突","证据相抵后自动VUS","按ClinVar多数票"], expected:["先解决BS1/BA1与PS3冲突"], explanation:"强冲突通常提示疾病实体、实验特异性、频率质量或变异同一性存在问题，不能机械相抵。", risk:"把相反证据当作简单加减法。" },
];

export const errorPatterns = [
  ["把数据库结论当证据", "复制ClinVar分类后再加PP5，造成循环论证。", "回到底层提交、疾病实体、证据摘要和日期。"],
  ["多个预测软件重复计分", "SIFT、PolyPhen与REVEL逐个算证据。", "采用经校准的组合工具和阈值，只使用一次PP3/BP4。"],
  ["两条杂合默认反式", "隐性病看到两条变异即写复合杂合。", "用父母来源、读段或其他定相方法建立相位。"],
  ["VUS推动确诊", "因表型很像或另一等位基因致病就升级VUS。", "病例吻合不能替代变异层证据，保持不确定并设计验证。"],
  ["PVS1机械极强", "所有截短或±1/2剪接都使用PVS1。", "检查LOF机制、转录本、NMD、关键区段与剪接框架。"],
  ["PM2强度过高", "人群数据库未见就给中等或强证据。", "核查覆盖、祖源和阈值；通用建议通常仅支持级。"],
  ["父母未检出等于PS2", "忽略亲缘、覆盖、嵌合和样本身份。", "按PS2/PM6计点框架评估并必要时正交验证。"],
  ["功能显著等于PS3", "只看论文p值，不看对照和疾病机制。", "评估实验系统、动态范围、验证和机制匹配。"],
  ["疾病实体迁移", "同一基因另一疾病的致病分类直接套用。", "分类绑定基因—疾病—遗传模式—机制组合。"],
  ["阴性等于排除", "WES未检出就写排除遗传病。", "说明覆盖、难检机制、知识局限和针对性下一步。"],
  ["过度表型扩展", "一个诊断解释不了全部表现时强行扩展疾病谱。", "考虑第二诊断、共病、记录误差和新机制证据门槛。"],
  ["证据快照缺失", "报告只留分类，不留版本和理由。", "记录规范、数据库日期、文献、代码强度和反证。"],
] as const;

export const reportTemplates = [
  { id:"ad", title:"显性新生阳性报告", case:"PTPN11相关Noonan综合征，杂合新生致病变异。", required:["基因与转录本","HGVS","合子状态与来源","分类与依据","表型相关性","验证/遗传咨询"], keywords:[["PTPN11","NM_002834"],["c.","p.("],["杂合","新生"],["致病","ClinGen"],["Noonan","表型"],["验证","遗传咨询"]] },
  { id:"ar", title:"隐性复合杂合阳性报告", case:"PAH缺乏症，两条P/LP变异分别父母来源并确认反式。", required:["两条完整变异","分别分类","反式与父母来源","生化相关性","病例级结论","建议与边界"], keywords:[["c.1222","c.1246"],["致病","可能致病"],["反式","父源","母源"],["苯丙氨酸","生化"],["支持","分子诊断"],["遗传咨询","验证","不能"]] },
  { id:"vus", title:"隐性病P/VUS不确定报告", case:"隐性病一条致病变异和一条VUS，反式已确认。", required:["两条分别分类","相位","不确定结论","VUS使用边界","后续证据路径","检测限制"], keywords:[["致病","VUS","意义未明"],["反式"],["不足","不确定","不能确诊"],["不可","临床决策"],["家系","RNA","功能","重分析"],["限制","残余风险"]] },
] as const;

export type BoundaryCaseDefinition = {
  id: string;
  title: string;
  subtitle: string;
  gene: string;
  sourceBoundary: string;
  steps: Array<{
    title: string;
    lead: string;
    stem: string;
    options: Array<[string, string]>;
    answer: string;
    feedback: string;
  }>;
  reportPrompt: string;
  reportChecks: Array<[string, string[]]>;
  reportExample: string;
  sources: Array<{ label: string; url: string }>;
};

export const boundaryCases: BoundaryCaseDefinition[] = [
  {
    id: "005",
    title: "深内含子剪接变异",
    subtitle: "CFTR · AR · WGS补充检出",
    gene: "CFTR NM_000492.4:c.3718-2477C>T",
    sourceBoundary: "变异、RNA机制和专家分类来自公开记录；汗氯数值、第二等位基因及家系组合为教学重组。",
    steps: [
      { title:"为什么WES可能漏检", lead:"先判断检测范围，再讨论变异意义。", stem:"常规WES阴性，WGS在CFTR内含子深部检出c.3718-2477C>T。最合理的解释是什么？", options:[["target","该位点通常不在常规外显子捕获目标内"],["artifact","所有深内含子变异都是伪影"],["benign","不在外显子所以必为良性"],["coverage","WES一定能可靠覆盖全部内含子"]], answer:"target", feedback:"深内含子位点通常不在常规WES目标范围；阴性外显子组不能排除这类机制。" },
      { title:"RNA机制", lead:"把预测与观察到的剪接结果分开。", stem:"公开RNA研究显示插入84 bp伪外显子并带提前终止密码子。应怎样记录？", options:[["observed","记录为已观察到的异常剪接，并注明实验材料与来源"],["predicted","只写预测软件提示"],["protein","直接声称患者完全无CFTR蛋白"],["ignore","RNA结果与分类无关"]], answer:"observed", feedback:"该变异已有异常剪接实验证据；但仍需保留实验体系、异常转录比例和疾病机制边界。" },
      { title:"剪接证据赋分", lead:"同一底层RNA结果不能机械重复计分。", stem:"按ClinGen剪接建议（文件为SVI历史署名），最稳妥的处理是？", options:[["pvs1rna","按基因特异决策树保守确定PVS1(RNA)，不再用同一RNA结果重复叠加PS3"],["double","PVS1极强、PS3强、PP3强全部叠加"],["ps3only","所有RNA实验只能使用PS3"],["none","非经典位点永远不能使用PVS1"]], answer:"pvs1rna", feedback:"ClinGen建议将观察到的剪接影响路由到PVS1(RNA)框架，并处理与预测及功能证据的依赖性。" },
      { title:"隐性相位", lead:"变异致病性与病例基因型仍需分开。", stem:"另一条CFTR致病变异由母亲遗传，本变异由父亲遗传。病例层最关键的关系是？", options:[["trans","两条变异已确认反式"],["cis","两条变异为顺式"],["unknown","相位仍未知"],["dominant","符合显性遗传"]], answer:"trans", feedback:"分别来自父母可确认反式，为隐性病病例级整合提供关键相位信息。" },
      { title:"表型强弱", lead:"部分正常转录可产生较轻表型。", stem:"患者胰腺功能尚可但汗氯升高、反复呼吸道症状。如何处理？", options:[["compatible","与该变异已知的残余功能/非经典表型可以相容"],["exclude","较轻表型排除CFTR相关病"],["downgrade","自动把致病变异降为VUS"],["ignore","表型无需纳入病例结论"]], answer:"compatible", feedback:"c.3718-2477C>T可保留部分正常转录并与较轻或非经典表现相关，不能只按严重度否定。" },
      { title:"病例结论", lead:"疾病名称取决于完整基因型与临床诊断标准。", stem:"两条致病等位基因反式且临床符合时，最佳表述是？", options:[["support","结果支持CFTR相关疾病的分子诊断，具体临床分型结合专科评估"],["variantonly","只报告单个变异，不做病例整合"],["certain","仅凭变异即可确定全部临床严重度"],["carrier","判定为单纯携带者"]], answer:"support", feedback:"可以支持病例级分子诊断，但临床类型、严重度和治疗仍需结合汗氯、器官受累及专科评价。" },
    ],
    reportPrompt:"撰写结论，包含两条变异及反式关系、深内含子与RNA机制、病例相关性、检测限制和临床分型边界。",
    reportChecks:[["CFTR与HGVS",["CFTR","c.3718-2477"]],["反式",["反式"]],["剪接机制",["剪接","RNA","伪外显子"]],["病例结论",["支持","分子诊断"]]],
    reportExample:"检出CFTR NM_000492.4:c.3718-2477C>T深内含子致病变异，与另一条致病变异经家系验证位于反式。公开RNA研究证实该变异导致异常伪外显子插入；结合临床表现，结果支持CFTR相关疾病的分子诊断。具体临床分型及管理应结合汗氯和专科评估；常规WES对深内含子变异存在覆盖限制。",
    sources:[{label:"ClinVar Variation ID 7166",url:"https://www.ncbi.nlm.nih.gov/clinvar/variation/7166/"},{label:"ClinGen剪接建议（SVI历史署名）",url:"https://pubmed.ncbi.nlm.nih.gov/37352859/"},{label:"GeneReviews：Cystic Fibrosis",url:"https://www.ncbi.nlm.nih.gov/books/NBK1250/"}],
  },
  {
    id: "006",
    title: "高频但低外显率",
    subtitle: "GJB2 · AR · 专家组例外",
    gene: "GJB2 NM_004004.6:c.109G>A p.(Val37Ile)",
    sourceBoundary: "专家组分类、频率与低外显率来自ClinVar公开证据；听力随访组合为教学重组。",
    steps: [
      { title:"频率冲突", lead:"高频是需要解释的反证，不是永远自动良性。", stem:"该变异在部分东亚人群频率很高，甚至达到通常的BA1阈值。第一步应？", options:[["resolve","核查疾病特异阈值、外显率和VCEP是否定义例外"],["ba1","不看其他证据直接BA1"],["ignore","完全忽略人群频率"],["vote","按ClinVar提交数量投票"]], answer:"resolve", feedback:"Hearing Loss VCEP明确讨论了高频与低外显率，并将该变异作为不能机械使用BA1的情境。" },
      { title:"证据层级", lead:"提交层级优先于数量。", stem:"ClinVar中存在大量提交，当前最应优先查看哪一层？", options:[["expert","ClinGen Hearing Loss VCEP专家组提交及底层证据"],["latest","最后一个单实验室提交"],["count","多数提交票数"],["stars","只看星级不看疾病实体"]], answer:"expert", feedback:"专家组结论针对明确疾病实体并公开底层标准，不能用单提交数量覆盖。" },
      { title:"VCEP证据组合", lead:"把统计富集、反式观察和共分离分开。", stem:"专家组摘要使用的核心组合是？", options:[["combo","PS4、PM3与PP1_Strong"],["pvs1","PVS1与PM2"],["ba1","BA1与BS1"],["pp5","PP5与多个预测软件"]], answer:"combo", feedback:"VCEP依据病例富集、双等位观察与家系共分离综合分类，同时明确低外显率。" },
      { title:"病例基因型", lead:"隐性病仍需满足两等位基因结构。", stem:"仅检出一条杂合p.Val37Ile、患者轻度听力下降。最稳妥的病例结论？", options:[["carrier","目前仅能说明携带一条相关等位基因，不能单据此建立隐性分子诊断"],["diagnosed","轻度表型加一条变异即可确诊"],["dominant","自动按显性耳聋解释"],["benign","存在健康携带者所以变异良性"]], answer:"carrier", feedback:"变异为致病且低外显率，不改变GJB2隐性病例通常需要双等位基因的要求。" },
      { title:"正常听力个体", lead:"不完全外显率影响BS4和家系解释。", stem:"双等位基因亲属当前听力正常，能否直接作为强良性证据？", options:[["no","不能；需考虑年龄相关外显率、检查方法和随访"],["yes","正常一次即可BS4强"],["downgrade","自动把专家组分类降为VUS"],["exclude","排除GJB2相关听力损失"]], answer:"no", feedback:"该变异可呈年龄相关、轻度和不完全外显；一次正常检查不应被当作完全非共分离。" },
      { title:"报告措辞", lead:"“致病”不等于可预测严重度。", stem:"双等位基因病例报告最应加入哪项限定？", options:[["penetrance","与轻中度、进展性及不完全外显相关，建议规范听力学随访"],["certain","必然先天重度耳聋"],["none","外显率与报告无关"],["treatment","直接给出治疗决定"]], answer:"penetrance", feedback:"应保留病原性分类，同时明确低外显率、可变表达和年龄相关随访边界。" },
    ],
    reportPrompt:"写出双等位基因病例结论，解释专家组病原性、高人群频率例外、不完全外显率以及听力随访建议。",
    reportChecks:[["GJB2与HGVS",["GJB2","c.109G>A"]],["专家组",["专家组","VCEP","ClinGen"]],["低外显率",["低外显","不完全外显"]],["随访边界",["听力","随访","进展"]]],
    reportExample:"检出GJB2 NM_004004.6:c.109G>A [p.(Val37Ile)]双等位基因型。该变异经ClinGen Hearing Loss VCEP评为致病；专家组已综合其较高人群频率、病例富集、反式观察和共分离证据。该基因型常与轻至中度、可进展且不完全外显的听力损失相关，因此结果支持分子诊断但不能单独预测严重度，建议规范听力学评估与随访。",
    sources:[{label:"ClinVar Variation ID 17023",url:"https://www.ncbi.nlm.nih.gov/clinvar/variation/17023/"},{label:"Hearing Loss VCEP publication",url:"https://pubmed.ncbi.nlm.nih.gov/31160754/"}],
  },
  {
    id: "007",
    title: "低比例组织嵌合",
    subtitle: "PIK3CA · mosaic AD · 受累组织",
    gene: "PIK3CA NM_006218.4:c.3140A>G p.(His1047Arg)",
    sourceBoundary: "变异热点、专家组证据和取材建议来自ClinVar与GeneReviews；VAF和个案表现为教学重组。",
    steps: [
      { title:"样本选择", lead:"嵌合病首先是取材问题。", stem:"节段性过度生长、血液WES阴性。下一步优先检测？", options:[["tissue","临床受累组织的高深度靶向测序"],["blood","重复同深度血液WES"],["sanger","仅用血液Sanger"],["cnv","只做PIK3CA缺失重复"]], answer:"tissue", feedback:"PROS多为合子后嵌合，GeneReviews优先建议受累组织并使用可检出低VAF的高深度方法。" },
      { title:"低VAF复核", lead:"6%既不能自动当伪影，也不能不复核。", stem:"受累组织检出热点变异VAF 6%，读段双向均衡。最佳下一步？", options:[["orthogonal","结合质量、组织对照并用高深度/数字PCR等独立方法确认"],["artifact","低于20%一律伪影"],["hetero","写成普通杂合50%"],["sanger","用常规Sanger阴性否定"]], answer:"orthogonal", feedback:"低比例嵌合需与测序误差、污染和克隆性改变区分；常规Sanger在低VAF时灵敏度不足。" },
      { title:"专家组分类", lead:"分类绑定脑畸形/过度生长疾病实体和功能获得机制。", stem:"p.His1047Arg在相关疾病中的专家组结论是？", options:[["pathogenic","致病，属于反复出现的激活型热点"],["vus","意义未明"],["benign","良性"],["lof","仅按功能缺失PVS1分类"]], answer:"pathogenic", feedback:"ClinGen Brain Malformations VCEP将其评为致病；PIK3CA相关机制为激活/功能获得，不使用PVS1。" },
      { title:"病例相关性", lead:"肿瘤热点与发育性疾病需区分语境。", stem:"同一变异也常见于肿瘤。当前先天节段性过度生长病例应如何解释？", options:[["context","结合受累组织嵌合、出生早期表型和PROS疾病实体解释"],["cancer","直接诊断恶性肿瘤"],["ignore","因为在肿瘤出现所以不能用于遗传病"],["germline","自动视作全身胚系变异"]], answer:"context", feedback:"同一激活变异可出现在肿瘤或发育性嵌合病；组织、时间、表型和疾病实体决定病例解释。" },
      { title:"阴性血液", lead:"阴性结果的残余风险取决于组织分布。", stem:"血液与口腔样本未检出，受累组织阳性。最合理结论？", options:[["distribution","符合组织限制性嵌合；血液阴性不能推翻受累组织结果"],["contamination","必然污染"],["exclude","排除PROS"],["inherit","证明来自父母遗传"]], answer:"distribution", feedback:"变异负荷可在不同组织间显著变化，外周血阴性在局灶PROS中并不罕见。" },
      { title:"报告与遗传咨询", lead:"VAF不是简单的合子比例或严重度尺。", stem:"报告必须明确哪组信息？", options:[["sample","检测组织、方法、深度、VAF、嵌合解释及方法检出限"],["vaf","只写6%"],["germline","写普通胚系杂合"],["severity","用VAF直接预测全身严重度"]], answer:"sample", feedback:"嵌合报告必须让读者知道在哪种组织、用什么灵敏度发现何种比例的变异，并谨慎讨论复发风险。" },
    ],
    reportPrompt:"写出受累组织低比例嵌合报告，包含样本、方法/VAF、疾病实体、功能获得机制、血液阴性边界和遗传咨询限定。",
    reportChecks:[["PIK3CA与HGVS",["PIK3CA","c.3140A>G"]],["嵌合与组织",["嵌合","受累组织"]],["VAF/方法",["VAF","深度","检出限"]],["阴性边界",["血液","不能排除","组织"]]],
    reportExample:"在受累组织中检出PIK3CA NM_006218.4:c.3140A>G [p.(His1047Arg)]低比例嵌合变异（VAF 6%，经高深度方法复核）。该激活型热点经ClinGen专家组评为致病；结合先天节段性过度生长，结果支持PIK3CA相关过度生长谱系。外周血阴性不能排除组织限制性嵌合，报告应注明样本、深度及检出限；复发风险与管理需由遗传和相关专科结合个体情况评估。",
    sources:[{label:"ClinVar Variation ID 13652",url:"https://www.ncbi.nlm.nih.gov/clinvar/variation/13652/"},{label:"GeneReviews：PIK3CA-Related Overgrowth Spectrum",url:"https://www.ncbi.nlm.nih.gov/books/NBK153722/"}],
  },
  {
    id: "008",
    title: "外显子级CNV",
    subtitle: "DMD · XL · exon 50 deletion",
    gene: "DMD exon 50 deletion（断点未确定）",
    sourceBoundary: "检测比例、阅读框规则和遗传模式来自GeneReviews/FDA公开材料；CK、年龄及家系组合为教学重组。",
    steps: [
      { title:"机制优先", lead:"DMD多数致病变异是外显子缺失或重复。", stem:"男童Gowers征、CK显著升高，WES SNV/indel阴性。最应补充？", options:[["cnv","DMD外显子级缺失/重复分析"],["repeat","重复相同SNV过滤"],["mt","只分析线粒体"],["stop","停止遗传检测"]], answer:"cnv", feedback:"GeneReviews指出DMD约65%–80%先证者可由基因靶向缺失/重复分析检出。" },
      { title:"技术确认", lead:"读深CNV提示需要匹配问题的确认方法。", stem:"WES读深提示exon 50缺失，最佳确认是？", options:[["mlpa","采用MLPA或等效外显子级定量方法确认，并核查样本身份"],["sanger","仅对外显子序列做Sanger"],["prediction","增加错义预测软件"],["clinvar","直接照抄数据库"]], answer:"mlpa", feedback:"外显子级CNV应使用能测量拷贝数的方法确认；常规Sanger不能确认整个外显子缺失。" },
      { title:"阅读框", lead:"规则有预测价值，但不是绝对定律。", stem:"单独删除exon 50会破坏阅读框。如何用于表型预测？", options:[["rule","支持Duchenne表型，但结合临床并保留阅读框规则例外"],["certain","100%确定病程与严重度"],["becker","所有外显子缺失都为Becker"],["none","阅读框完全无信息"]], answer:"rule", feedback:"GeneReviews给出的阅读框规则预测准确度约91%–92%，应与年龄、肌力、CK和蛋白信息整合。" },
      { title:"变异分类", lead:"先确认删除范围、转录本和NMD后再使用PVS1。", stem:"对已确认、破坏阅读框的exon 50缺失，最恰当的证据路径？", options:[["pvs1","按PVS1决策树评估功能缺失并结合DMD疾病机制"],["pm4","只因长度改变使用PM4"],["pp3","仅靠预测软件PP3"],["ba1","使用BA1"]], answer:"pvs1", feedback:"DMD功能缺失是明确机制；但仍需记录转录本、删除范围、阅读框和NMD，不应只因“CNV”机械赋分。" },
      { title:"家系与复发风险", lead:"母亲外周血阴性不等于零复发风险。", stem:"先证者确认新生DMD缺失，母亲血液未检出。最佳咨询表述？", options:[["residual","提示新生事件，同时保留母系生殖腺嵌合等残余复发风险"],["zero","下一胎风险绝对为零"],["dominant","按常染色体显性"],["father","只检测父亲"]], answer:"residual", feedback:"X连锁新生病例仍需讨论亲本嵌合和检测灵敏度；具体风险由遗传咨询结合检测结果评估。" },
      { title:"可追溯报告", lead:"不要为外显子级检测编造碱基断点。", stem:"MLPA只确认exon 50缺失时，报告应？", options:[["resolution","按检测分辨率描述外显子范围并明确断点未确定"],["fake","生成精确g.HGVS断点"],["omit","不写方法与限制"],["therapy","直接作出治疗决定"]], answer:"resolution", feedback:"CNV命名与结论必须匹配技术分辨率；治疗可及性需要独立确认适应证、临床条件与当地规范。" },
    ],
    reportPrompt:"写出DMD exon 50缺失结论，包含外显子级结果、阅读框、X连锁病例相关性、断点/方法限制和家系建议。",
    reportChecks:[["DMD与外显子",["DMD","exon 50","外显子50"]],["阅读框",["阅读框","移码","功能缺失"]],["检测限制",["MLPA","断点","分辨率"]],["家系风险",["X连锁","嵌合","遗传咨询"]]],
    reportExample:"经外显子级拷贝数方法确认DMD exon 50半合子缺失。该缺失预测破坏阅读框并符合DMD功能缺失机制；结合男童肌无力与CK升高，结果支持抗肌萎缩蛋白病的分子诊断。当前方法仅确定外显子范围，精确基因组断点未明。建议完成母系携带/嵌合评估与遗传咨询；具体表型、管理和任何变异特异治疗资格应由神经肌病专科独立评估。",
    sources:[{label:"GeneReviews：Dystrophinopathies",url:"https://www.ncbi.nlm.nih.gov/books/NBK1119/"},{label:"FDA exon 51 skipping background",url:"https://www.accessdata.fda.gov/drugsatfda_docs/nda/2017/Seife%20Production_2017_10_13.pdf"}],
  },
];
