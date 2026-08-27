export type FlagshipCase = {
  id: string;
  title: string;
  route: string;
  provenance: string;
  boundary: string;
  stages: Array<{ title: string; facts: string[]; task: string; answer: string }>;
  questions: Array<{ q: string; options: string[]; answer: number; rationale: string }>;
  sources: Array<{ label: string; url: string }>;
};

export const flagshipCases: FlagshipCase[] = [
  { id:"F-WGS-01", title:"WES阴性后的深内含子＋RNA闭环", route:"SNV/indel → Non-coding → RNA → AR病例整合", provenance:"公开机制与真实已知CFTR深内含子变异类型基础上的教学重组；不对应单一患者，不增加未经来源支持的病例证据。", boundary:"训练目标是证据路由与依赖审计，不把教学情境当作新的独立先证者。", stages:[
    { title:"临床问题", facts:["反复呼吸道症状与胰腺功能异常","常规WES只见一条CFTR已知致病变异","父母样本可用"], task:"写出当前能否建立隐性病分子诊断，以及最可能遗漏的第二等位基因类型。", answer:"当前只有一个明确致病等位基因，不能建立隐性病分子诊断；应优先检查CFTR CNV、深内含子和复杂剪接机制。" },
    { title:"WGS发现", facts:["另一亲本来源的深内含子候选","位点质量可靠且人群资源极低频","两条候选分别来自父母"], task:"区分哪些是技术/相位事实，哪些仍不是致病性结论。", answer:"真实性、稀有性与反式结构已得到支持，但深内含子候选的功能后果和分类仍未解决。" },
    { title:"机制假设", facts:["剪接预测提示新供体位点","预期产生伪外显子并引入提前终止","CFTR LOF与疾病机制相符"], task:"设计RNA验证最少需要记录的质量要素。", answer:"组织表达、样本处理、对照、异常转录本序列、等位基因特异性、异常比例、NMD影响和可重复性。" },
    { title:"RNA证据", facts:["患者RNA观察到预期伪外显子","对照未见","异常转录本比例可测"], task:"说明PVS1、PS3和PP3如何避免重复。", answer:"按当前剪接规范把计算预测、RNA观察和由RNA校准的LOF后果统一路由；同一RNA结果不能机械支撑三条独立证据。" },
    { title:"病例整合", facts:["两变异已确认反式","两条分别完成分类","表型与CFTR相关疾病谱一致"], task:"把变异分类与病例结论分成两句话。", answer:"先分别陈述两条变异在明确疾病实体下的分类；再说明反式双等位基因与表型共同支持或不足以支持分子诊断。" },
    { title:"报告与留痕", facts:["需报告检测平台升级路径","需保存RNA证据快照","需提出家系与遗传咨询建议"], task:"写出不得越过的报告边界。", answer:"不得把预测后果写成实测，不得重复计权，不得把教学重组病例计入PS4/PM3独立病例数。" },
  ], questions:[
    { q:"只有一条CFTR致病变异时最准确的病例结论？", options:["已确诊","携带/部分线索，需寻找第二等位基因","自动VUS","排除CFTR相关病"], answer:1, rationale:"隐性病需要符合模式的双等位基因结构。" },
    { q:"患者RNA出现预期伪外显子后？", options:["自动叠加PVS1+PS3+PP3","按剪接规范做证据依赖审计","直接PS4","不再核查对照"], answer:1, rationale:"同一底层RNA数据不可重复计权。" },
    { q:"教学重组病例能否作为新的独立病例证据？", options:["能","不能","只ClinVar能","只WGS能"], answer:1, rationale:"它用于训练推理，不是独立患者观察。" },
  ], sources:[
    { label:"ClinGen Variant Classification Guidance", url:"https://www.clinicalgenome.org/tools/clingen-variant-classification-guidance/" },
    { label:"CFTR2", url:"https://cftr2.org/" },
    { label:"ACMG/AMP 2015", url:"https://pubmed.ncbi.nlm.nih.gov/25741868/" },
  ] },
  { id:"F-WGS-02", title:"多Mb缺失：分类与表型解释分离", route:"CNV loss → Dosage → Trio → Case relevance", provenance:"依据ACMG/ClinGen CNV标准与ClinGen剂量敏感性资源构建的教学重组；区域与数值不用于模拟新的真实患者。", boundary:"不以CNV大小或所含基因数自动定级，不把loss证据迁移到gain。", stages:[
    { title:"临床问题", facts:["发育迟缓与多系统异常","三联体WGS","核心表型只有部分符合常见微缺失综合征"], task:"定义本例需要独立回答的三个问题。", answer:"CNV是否真实；CNV如何分类；该CNV能解释当前患者多少表型。" },
    { title:"事件真实性", facts:["连续读深下降","BAF支持单拷贝状态","两个边界附近有断点信号"], task:"写出边界和嵌合仍应怎样表达。", answer:"报告方法支持的边界区间和分辨率；若信号幅度偏离整合子状态，需评估嵌合且不写成确定全身比例。" },
    { title:"专项评分", facts:["区域包含ClinGen明确HI基因","loss疾病机制匹配","公开病例与区域内容可追溯"], task:"说明为什么不能直接用PVS1。", answer:"宪法性CNV进入ACMG/ClinGen CNV loss评分框架；序列变异PVS1不是整段CNV的替代评分代码。" },
    { title:"家系证据", facts:["父母未见相同缺失","亲缘关系确认","父母位点覆盖和CNV质量合格"], task:"将“新生”放到正确层级。", answer:"新生是CNV评分和病例相关性的家系信息之一，不替代剂量敏感性和内容评价。" },
    { title:"表型解释", facts:["神经发育表型吻合","视网膜变性不在已知区域谱中","患者另有未解决系统"], task:"选择完整解释、部分解释或不足。", answer:"更稳妥为部分解释，并为未解释的核心表型保留第二诊断分析。" },
    { title:"报告", facts:["CNV达到相应分类","确认方法待完成","需给出遗传咨询建议"], task:"写出分类句和病例句的区别。", answer:"分类句描述CNV本身；病例句限定其与当前表型和遗传模式的符合程度，二者不能合并成“致病所以全部确诊”。" },
  ], questions:[
    { q:"包含HI基因的大缺失最先进入哪个框架？", options:["PVS1","CNV loss五部分评分","CNV gain评分","mtDNA规范"], answer:1, rationale:"宪法性缺失使用ACMG/ClinGen CNV框架。" },
    { q:"致病CNV对当前病例意味着？", options:["必然解释全部表型","还需独立病例整合","只看大小","无需家系"], answer:1, rationale:"分类与病例相关性必须分开。" },
    { q:"HI证据能否直接证明重复致病？", options:["能","不能","只产前能","只大CNV能"], answer:1, rationale:"loss与gain机制不同。" },
  ], sources:[{ label:"ACMG/ClinGen CNV standard", url:"https://pubmed.ncbi.nlm.nih.gov/31690835/" },{ label:"ClinGen Dosage Sensitivity", url:"https://clinicalgenome.org/working-groups/dosage-sensitivity-curation/" }] },
  { id:"F-WGS-03", title:"平衡易位中断CHD7：先重建事件", route:"SV signals → Breakpoint → Mechanism → Trio", provenance:"基于ACMG生殖系SV技术建议和CHD7明确LOF疾病机制的教学重组，不声称是公开论文中的单一患者复刻。", boundary:"断点中断疾病基因是机制线索，不是一步式分类规则。", stages:[
    { title:"临床问题", facts:["CHARGE样表型","SNV/indel与常规CNV阴性","三联体样本"], task:"为什么仍需保留结构变异通道？", answer:"平衡/复杂重排可能不产生明显读深变化，却可中断基因或调控结构。" },
    { title:"多信号整合", facts:["两条染色体出现成对split-read","discordant pair方向一致","总拷贝数近似平衡"], task:"“近似平衡”能证明什么、不能证明什么？", answer:"支持没有大段净拷贝数改变；不能证明结构简单、没有小插入/缺失或无临床影响。" },
    { title:"事件重建", facts:["两个连接点可成闭合模型","一侧位于CHD7疾病转录本","另一侧未见明确疾病基因"], task:"列出必须验证的结构信息。", answer:"双方连接点、方向、插入/微缺失、拷贝数、断点分辨率和是否存在额外复杂事件。" },
    { title:"机制评价", facts:["CHD7 LOF为明确疾病机制","断点预期破坏转录本","表型高度相关"], task:"为什么仍不能只写“中断CHD7，致病”？", answer:"需先证实真实结构和转录影响，并在明确疾病实体下应用适用的变异分类逻辑。" },
    { title:"家系", facts:["父母未见该事件","亲缘关系确认","父母表型复核"], task:"说明低水平亲本嵌合的报告边界。", answer:"常规阴性降低但不完全排除低比例生殖系/体细胞嵌合，复发风险表述需限定。" },
    { title:"报告", facts:["事件完成正交验证","边界精度已知","病例结论形成"], task:"给出最关键的三类报告字段。", answer:"结构与坐标/方法、基因/转录本和机制、病例相关性与验证/遗传咨询边界。" },
  ], questions:[
    { q:"平衡SV的第一原则？", options:["平衡即良性","重建双方断点和完整事件","只看中断基因","只看CNV"], answer:1, rationale:"结构模型先于解释。" },
    { q:"单个断点中断疾病基因？", options:["自动致病","需验证结构并核查机制","自动PVS1极强","无需家系"], answer:1, rationale:"断点是机制线索而非一步式结论。" },
    { q:"总拷贝数平衡能排除？", options:["所有临床影响","大段净拷贝数改变","基因中断","复杂结构"], answer:1, rationale:"平衡描述净拷贝数，不代表无功能影响。" },
  ], sources:[{ label:"ACMG germline SV technical standard", url:"https://pubmed.ncbi.nlm.nih.gov/36507974/" },{ label:"ClinGen Gene-Disease Validity", url:"https://search.clinicalgenome.org/kb/gene-validity" }] },
  { id:"F-WGS-04", title:"chr15 ROH到UPD/印记确认", route:"ROH → Parent-of-origin → Methylation", provenance:"依据拷贝中性ROH、UPD与印记病公开机制构建的教学重组；不把ROH长度或亲缘关系设为通用阈值。", boundary:"ROH提示风险模式，不直接确定具体亲属关系或印记病诊断。", stages:[
    { title:"临床问题", facts:["发育与行为表型提示chr15印记病谱","拷贝数分析阴性","父母样本可用"], task:"写出ROH通道要回答的核心问题。", answer:"是否存在单染色体长拷贝中性ROH、其亲本来源以及是否影响关键印记区域。" },
    { title:"ROH发现", facts:["chr15长ROH","其他染色体无类似广泛模式","总拷贝数正常"], task:"这一步最强能说到哪里？", answer:"提示chr15同二体/UPD可能，尚不能确定完整UPD、亲本来源或印记状态。" },
    { title:"亲本来源", facts:["亲子基因型支持单一亲本来源","样本身份和亲缘通过","仍可能存在异二体区段"], task:"为什么ROH不能看到所有UPD？", answer:"异二体保留杂合，不形成ROH；WGS ROH主要捕捉同二体成分。" },
    { title:"机制确认", facts:["关键印记区受影响可能","疾病取决于亲本来源/甲基化","计划甲基化检测"], task:"选择最终确认路径。", answer:"使用能回答印记/甲基化状态及必要时亲本来源的专项检测，而非仅重复CNV分析。" },
    { title:"隐性病并行风险", facts:["ROH内存在多个纯合变异","当前无明确P/LP双等位基因型","表型部分不典型"], task:"怎样避免ROH自动升级VUS？", answer:"ROH只改变候选优先级和基因型结构理解，不替代每条序列变异的致病性证据。" },
    { title:"报告", facts:["UPD/甲基化结果形成","仍有部分未解释表型","需要家系咨询"], task:"分别报告什么？", answer:"ROH/WGS提示、专项确认结果、印记病病例相关性、未解释表型及残余隐性病风险。" },
  ], questions:[
    { q:"单条chr15长ROH首先提示？", options:["确定近亲","UPD可能","确定缺失","三倍体"], answer:1, rationale:"需要亲本来源/甲基化确认。" },
    { q:"ROH能否捕捉全部异二体UPD？", options:["能","不能","只产前能","只WES能"], answer:1, rationale:"异二体可保留杂合。" },
    { q:"ROH内VUS如何处理？", options:["自动LP","仍按适用规范分类","自动PM3强","自动确诊"], answer:1, rationale:"ROH不替代变异证据。" },
  ], sources:[{ label:"ACMG NGS technical standard", url:"https://pubmed.ncbi.nlm.nih.gov/33927380/" },{ label:"GeneReviews: Prader-Willi Syndrome", url:"https://www.ncbi.nlm.nih.gov/books/NBK1330/" }] },
  { id:"F-WGS-05", title:"DMPK扩增：超范围结果不编数", route:"STR caller → Disease-specific standard → Orthogonal confirmation", provenance:"依据ACMG DM1技术标准构建的教学重组；重复数与信号不对应具体患者。", boundary:"方法不支持精确计数时只能报告范围、下界或提示，不能用估计值作确定预后。", stages:[
    { title:"临床问题", facts:["肌强直与多系统表型","常规SNV/CNV阴性","家族史提示显性传递"], task:"为什么STR必须是独立分析通道？", answer:"重复扩增的信号、验证、阈值和报告精度位点特异，常规SNV/indel流程不能代表已充分评价。" },
    { title:"WGS提示", facts:["DMPK CTG扩增caller阳性","达到疾病相关范围的证据充分","超出本方法精确计数范围"], task:"选择结果状态。", answer:"报告为提示/支持达到相应扩增范围或下界，并明确精确重复数不可得。" },
    { title:"质量审计", facts:["位点经实验室验证","批次对照合格","可能存在体细胞不稳定"], task:"还需要保存哪些方法字段？", answer:"软件/版本、验证范围、读长和覆盖、检出/计数范围、样本类型、嵌合/中断序列能力。" },
    { title:"专项确认", facts:["需要临床可报告确认","要区分等位基因类别","家系检测可能开展"], task:"确认方法应回答什么？", answer:"是否扩增、达到何种疾病特异类别/范围、是否需要解析中断或嵌合，并使用经验证的DM1专项方法。" },
    { title:"临床边界", facts:["重复数与起病年龄相关但非确定","组织间可有差异","家系内可表现差异"], task:"列出不得写出的预测。", answer:"不得以不精确重复数保证具体起病年龄、严重度或无症状亲属结局。" },
    { title:"报告", facts:["WGS提示与专项确认均有结果","需说明遗传模式","需建议遗传咨询"], task:"组织报告顺序。", answer:"WGS发现与能力边界、专项确认结果、疾病特异解释、家系/咨询建议和预后限制。" },
  ], questions:[
    { q:"超出精确计数范围时？", options:["给估计整数","报告可支持范围/下界","写未检出","按SNV报告"], answer:1, rationale:"精度必须匹配方法。" },
    { q:"常规WGS未提示FMR1扩增？", options:["排除脆性X","先核查该位点和甲基化能力","自动良性","无需专项检测"], answer:1, rationale:"未开展/能力不足不等于未检出。" },
    { q:"重复数能否确定个体预后？", options:["能","通常不能","只成人能","只三联体能"], answer:1, rationale:"外显、体细胞不稳定与家系差异限制预测。" },
  ], sources:[{ label:"ACMG DM1 technical standard (2024)", url:"https://pubmed.ncbi.nlm.nih.gov/38836869/" },{ label:"ACMG NGS technical standard", url:"https://pubmed.ncbi.nlm.nih.gov/33927380/" }] },
  { id:"F-WGS-06", title:"mtDNA组织差异：血液不是全身", route:"mtDNA → Heteroplasmy → Tissue → Case integration", provenance:"基于m.3243A>G等经典组织差异机制与mtDNA专项规范构建的教学重组；比例仅用于训练边界。", boundary:"异质性比例必须绑定组织、年龄、方法和检出限，不能单独确定分类或预后。", stages:[
    { title:"临床问题", facts:["听力、糖代谢与神经系统受累","成人发病","母系家族史不完整"], task:"为什么样本选择会改变结论？", answer:"mtDNA异质性可随组织和年龄差异；成人血液可能低水平，单一组织阴性不能代表全身。" },
    { title:"血液结果", facts:["同一mtDNA变异低比例","深度和质量合格","已审计NUMT和链偏倚"], task:"低比例能否自动解释表型？", answer:"不能；需按mtDNA专项证据结合变异知识、组织、病例和家系解释。" },
    { title:"第二组织", facts:["尿沉渣比例明显更高","同一等位基因和参考序列","方法学可比较但样本组织不同"], task:"如何报告两个比例？", answer:"分别报告组织、采样时间、方法、深度/检出限和比例，不合并成患者固定异质性。" },
    { title:"家系", facts:["母亲血液低比例或未检出","母亲表型评估有限","其他母系亲属不可得"], task:"母亲血液阴性意味着什么？", answer:"降低在该组织该检出限下检出的可能，但不能完全排除其他组织或更低水平异质性。" },
    { title:"专项分类", facts:["变异有公开病例和功能资料","需核查单倍群背景","患者表型存在但非完全特异"], task:"说明为什么不直接套核基因PVS1。", answer:"mtDNA有专项证据规格，涉及异质性、单倍群、组织和线粒体功能语境，不能原样套用核基因LOF逻辑。" },
    { title:"报告", facts:["需要给出组织限定","需要遗传咨询","不能确定严重度"], task:"写出结论边界。", answer:"限定该变异在具体组织和方法下的观察及分类，结合临床支持程度；不由比例直接预测严重度或复发风险。" },
  ], questions:[
    { q:"成人血液mtDNA低比例/阴性？", options:["排除其他组织","需结合组织差异和检出限","自动良性","自动同质性"], answer:1, rationale:"组织和年龄影响异质性。" },
    { q:"两个组织比例如何报告？", options:["取平均","分别绑定组织与方法","只报最高","只报血液"], answer:1, rationale:"比例不能脱离组织语境。" },
    { q:"同质性本身是否证明致病？", options:["是","否","只线粒体病是","只母系遗传是"], answer:1, rationale:"仍需专项证据与单倍群语境。" },
  ], sources:[{ label:"mtDNA ACMG/AMP specifications", url:"https://pubmed.ncbi.nlm.nih.gov/32906214/" },{ label:"MITOMAP", url:"https://www.mitomap.org/" }] },
];
