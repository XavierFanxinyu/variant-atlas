"use client";

import { useEffect, useMemo, useState } from "react";

type View = "dashboard" | "case" | "rules" | "roadmap" | "courses" | "library" | "exam" | "mistakes";
type CaseAnswer = { inheritance: string; evidence: string[]; classification: string; report: string };
type PahAnswer = {
  inheritance: string;
  phase: string;
  variant1Class: string;
  variant2Class: string;
  rationale1: string;
  rationale2: string;
  conclusion: string;
  report: string;
};

const modules = [
  { no: "01", title: "表型与遗传模式", meta: "6 节 · 约 120 分钟", progress: 33 },
  { no: "02", title: "质量控制与候选筛选", meta: "7 节 · 约 140 分钟", progress: 0 },
  { no: "03", title: "HGVS 与转录本", meta: "5 节 · 约 100 分钟", progress: 0 },
  { no: "04", title: "ACMG / AMP 证据", meta: "12 节 · 约 240 分钟", progress: 8 },
  { no: "05", title: "病例级综合解释", meta: "6 节 · 约 120 分钟", progress: 0 },
  { no: "06", title: "报告撰写", meta: "5 节 · 约 100 分钟", progress: 0 },
];

const lessons = [
  {
    id: "phenotype",
    no: "01",
    title: "表型不是关键词清单",
    duration: "20 分钟",
    objective: "把临床资料转成可用于候选排序的结构化表型，并避免把缺失记录误作阴性表型。",
    sections: [
      ["先建立病例时间线", "记录起病年龄、进展方式、系统受累和检查时间。相同HPO术语在不同年龄出现，诊断信息量可能完全不同。"],
      ["区分阳性、阴性与未知", "只有经过针对性评估且明确未见的表现才能作为阴性表型；病历中没有写到，不等于不存在。"],
      ["给表型分层", "核心表型决定疾病谱，支持表型帮助排序，常见非特异表现不应支配分析。优先保留能区分相似疾病的术语。"],
      ["让表型服务于遗传假设", "表型整理的结果应落到疾病谱、遗传模式和可检出变异类型，而不是停留在HPO数量。"],
    ],
    checkpoint: "父母表型正常时，不能直接排除常染色体显性遗传；还需考虑de novo、不完全外显和轻型表现。",
  },
  {
    id: "quality",
    no: "02",
    title: "候选变异先过质量关",
    duration: "20 分钟",
    objective: "在讨论致病性之前，判断变异是否真实、基因型是否可信、检测是否覆盖关键机制。",
    sections: [
      ["质量指标是线索，不是判决", "DP、GQ、AD和VAF需要结合位点环境、捕获表现、比对质量及家系数据共同阅读。"],
      ["三联体中的de novo", "低比例替代读段、父母低覆盖、样本污染或亲缘关系错误都可能制造假新生结果；必要时查看原始读段并正交验证。"],
      ["识别技术盲区", "WES对部分外显子、重复区域、同源基因、低比例嵌合、复杂SV和重复扩增能力有限。阴性结果不等于排除遗传病。"],
      ["验证建议要回答问题", "Sanger或其他方法应针对变异真实性、相位、来源或结构改变进行验证，不能用一句笼统的“建议验证”结束。"],
    ],
    checkpoint: "先确认变异存在，再讨论变异意义；技术质量证据不能替代致病性证据。",
  },
  {
    id: "hgvs",
    no: "03",
    title: "坐标、转录本与HGVS",
    duration: "20 分钟",
    objective: "在GRCh38体系中稳定识别同一变异，并避免因转录本选择改变功能后果。",
    sections: [
      ["完整描述必须可复现", "记录参考基因组版本、染色体坐标、参考/替代等位基因、带版本号的转录本以及c.和p.描述。"],
      ["优先但不盲从MANE", "MANE Select有利于跨资源一致性；若疾病机制依赖其他临床相关转录本，应说明选择依据。"],
      ["一个变异可有多种表示", "不同基因组版本和转录本会产生不同坐标与HGVS。检索前先完成标准化，并核对链方向。"],
      ["预测蛋白后果要加括号", "未经RNA或蛋白实验确认的结果使用预测表达，例如p.(Arg408Trp)，并避免把预测剪接后果写成已证实事实。"],
    ],
    checkpoint: "数据库命中前先确认它与当前变异使用同一参考序列、版本、等位基因和疾病实体。",
  },
  {
    id: "acmg",
    no: "04",
    title: "ACMG证据不是打勾表",
    duration: "25 分钟",
    objective: "理解证据代码背后的机制、强度和独立性，优先路由到适用的ClinGen/VCEP规范。",
    sections: [
      ["先问有没有特异规范", "若某基因或疾病已有ClinGen VCEP规范，阈值和强度可能与通用规则不同，应优先采用其当前有效版本。"],
      ["每条证据写完整理由", "理由至少回答数据来自哪里、是否适用当前疾病机制、为何达到该强度、是否存在反证。"],
      ["避免重复计算", "多个预测工具不是多条独立证据；RNA结果与由同一结果推导出的PVS1/PP3也可能相关，需按相应规范处理。"],
      ["数据库结论不是自动证据", "ClinVar可用于定位提交和专家结论，但不能把多个提交数量直接当作独立病例，也不应机械使用PP5/BP6。"],
    ],
    checkpoint: "分类是针对明确的基因—疾病—遗传模式组合，而不是给变异贴一个脱离语境的永久标签。",
  },
  {
    id: "case-level",
    no: "05",
    title: "从变异分类到病例结论",
    duration: "20 分钟",
    objective: "分别判断变异致病性、基因—疾病有效性和该变异解释患者表型的程度。",
    sections: [
      ["三层结论必须拆开", "致病变异只有在疾病实体、遗传模式、合子状态和患者表型匹配时，才可能支持分子诊断。"],
      ["隐性病看两条等位基因", "两条变异需分别分类，并核查是否反式、是否符合疾病机制；单个致病等位基因通常仅能说明携带状态或部分解释。"],
      ["允许部分解释和双重诊断", "单一诊断不能解释全部核心表型时，不应强行扩展；应考虑第二诊断、表型扩展或非遗传因素。"],
      ["VUS保持不确定", "VUS可以引导验证或重分析，但不应单独用于确诊、预测无症状亲属或做不可逆临床决定。"],
    ],
    checkpoint: "报告中的“支持诊断”必须明确支持什么疾病、解释哪些表型，以及仍有哪些表现未解释。",
  },
  {
    id: "report",
    no: "06",
    title: "把证据写成克制的报告",
    duration: "20 分钟",
    objective: "形成结构完整、措辞有限定、来源可追溯且能支持后续临床行动的报告。",
    sections: [
      ["先写事实，再写解释", "报告顺序建议为检测发现、规范描述、合子状态与来源、分类依据、病例相关性、验证与咨询建议。"],
      ["避免结论越界", "区分“变异为致病”“与表型吻合”“支持分子诊断”；不要把实验室结果写成完整临床诊断。"],
      ["阴性也要可解释", "说明检测范围、未覆盖机制、残余风险和可考虑的下一步，而不是简单写“未发现致病变异”。"],
      ["保留证据快照", "记录指南版本、数据库检索日期和关键文献。未来重分析必须能理解当时为什么得到该结论。"],
    ],
    checkpoint: "一份好报告既告诉读者发现了什么，也清楚告诉读者这项检测不能证明什么。",
  },
];

const caseLibrary = [
  { id: "001", title: "Noonan综合征", gene: "PTPN11", mode: "AD · de novo", focus: "PS2 / 功能证据 / 病例相关性", status: "开放", tone: "live", source: "ClinGen RASopathy VCEP" },
  { id: "002", title: "PAH缺乏症", gene: "PAH", mode: "AR · 复合杂合", focus: "PM3 / 两等位基因 / 反式", status: "开放", tone: "live", source: "ClinGen PAH VCEP + GeneReviews" },
  { id: "003", title: "家族性高胆固醇血症", gene: "LDLR", mode: "AD · 家系", focus: "PVS1强度 / RNA / 共分离", status: "证据已核查", tone: "verified", source: "ClinGen FH VCEP" },
  { id: "004", title: "终末外显子截短变异", gene: "待选VCEP基因", mode: "AD", focus: "PVS1降级 / NMD / 转录本", status: "选例复核中", tone: "review", source: "ClinGen SVI PVS1" },
  { id: "005", title: "非经典剪接变异", gene: "待选VCEP基因", mode: "AD或AR", focus: "剪接预测 / RNA / 证据依赖", status: "选例复核中", tone: "review", source: "ClinGen SVI Splicing" },
  { id: "006", title: "ClinVar分类冲突", gene: "待选专家组变异", mode: "多来源", focus: "提交层级 / 时间 / VUS边界", status: "选例复核中", tone: "review", source: "ClinVar + 原始文献" },
  { id: "007", title: "疑似测序伪影", gene: "同源或低复杂区域", mode: "单人WES", focus: "VAF / IGV / 正交验证", status: "技术素材准备中", tone: "planned", source: "公开技术标准" },
  { id: "008", title: "阴性与双重诊断", gene: "多基因", mode: "三联体WES", focus: "部分解释 / 重分析 / 检测盲区", status: "病例筛选中", tone: "planned", source: "公开病例系列" },
];

const examQuestions = [
  { q: "父母表型正常、先证者疑似显性病时，首要正确表述是？", options: ["排除显性遗传", "重点考虑de novo，同时保留不完全外显等可能", "只筛隐性纯合", "父母无需纳入分析"], answer: 1, tag: "遗传模式" },
  { q: "多个计算工具均预测有害，应如何使用？", options: ["每个工具各计一次PP3", "直接升级为PS3", "按经校准的组合/阈值使用一次，避免重复计分", "等同于功能实验"], answer: 2, tag: "证据独立性" },
  { q: "隐性病检出一条致病变异和一条VUS，最稳妥的病例结论是？", options: ["已经确诊", "VUS自动升级", "需核查相位与第二变异证据，通常不能仅据此确诊", "两条变异一定反式"], answer: 2, tag: "病例级解释" },
  { q: "ClinVar存在专家组分类时，正确做法是？", options: ["只复制五级分类", "核查疾病实体、规范版本、证据摘要和当前适用性", "按提交数量投票", "将所有提交都作为PS4病例"], answer: 1, tag: "数据库检索" },
  { q: "WES阴性结果最恰当的报告方式是？", options: ["排除遗传病", "未发现可报告变异，并说明检测限制和后续方向", "不写任何限制", "等同于良性"], answer: 1, tag: "报告写作" },
];

type EvidenceRule = { code: string; title: string; direction: "致病" | "良性"; strength: string; domain: string; original: string; current: string; pitfalls: string; status: "ClinGen细化" | "原始框架" | "不建议使用"; source: string };

const evidenceRules: EvidenceRule[] = [
  { code:"PVS1", title:"预测功能缺失", direction:"致病", strength:"极强/可降级", domain:"机制", original:"无义、移码、±1/2剪接、起始丢失或外显子缺失，且功能缺失是明确致病机制。", current:"使用ClinGen PVS1决策树；核查LOF机制、疾病相关转录本、NMD、关键区域及逃逸NMD后的蛋白影响。", pitfalls:"末端截短、非疾病相关转录本、LOF非致病机制；剪接证据须避免与PP3/PS1重复。", status:"ClinGen细化", source:"ClinGen PVS1 + Splicing" },
  { code:"PS1", title:"相同氨基酸改变", direction:"致病", strength:"强/可调整", domain:"蛋白/剪接", original:"与已明确致病变异导致相同氨基酸改变，但核苷酸变化不同。", current:"必须核查既有变异确属致病、疾病机制一致，并分别评估两个核苷酸改变的剪接影响。", pitfalls:"仅凭相同蛋白注释；忽视新变异或参照变异的剪接效应。", status:"ClinGen细化", source:"ClinGen Splicing" },
  { code:"PS2", title:"确认亲缘的新生变异", direction:"致病", strength:"支持至极强", domain:"家系", original:"患者中为新生变异，父母双方亲缘关系确认，且无家族史。", current:"ClinGen按亲缘确认、表型一致性和疾病遗传异质性计点；多例可累加并调整强度。", pitfalls:"把单例自动当强证据；只确认父亲；未排除父母嵌合、样本问题或病例重复。", status:"ClinGen细化", source:"ClinGen PS2/PM6 v1.1" },
  { code:"PS3", title:"有害功能实验", direction:"致病", strength:"支持至强", domain:"功能", original:"完善的体外或体内功能研究支持对基因或基因产物有害。", current:"按实验系统、对照、验证、动态范围和疾病机制匹配程度评定强度。", pitfalls:"论文写“显著”就使用；实验只测一般分子差异；同一实验重复支持多个代码。", status:"ClinGen细化", source:"ClinGen PS3/BS3" },
  { code:"PS4", title:"病例富集", direction:"致病", strength:"支持至强", domain:"病例/统计", original:"受累者中的变异患病率显著高于对照。", current:"优先使用设计良好的病例对照数据；极罕见病可按独立先证者数量由VCEP设定阈值。", pitfalls:"重复患者、选择偏倚、对照祖源不匹配、把ClinVar提交数当独立病例。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP阈值" },
  { code:"PM1", title:"热点或关键功能域", direction:"致病", strength:"中等/可调整", domain:"位置", original:"位于突变热点或明确关键功能域，且该区域无良性变异。", current:"需要基因/疾病特异证据定义区域；不能仅凭蛋白结构域名称或预测软件图。", pitfalls:"区域定义过宽；忽略同一区域大量良性错义变异。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP规范" },
  { code:"PM2", title:"人群中缺失或极低频", direction:"致病", strength:"支持", domain:"人群", original:"在大规模人群数据库中缺失，或隐性病中低于预期携带频率。", current:"ClinGen通用建议降为支持级；检查覆盖、祖源、数据质量、疾病频率、外显率和遗传异质性。", pitfalls:"把缺失当强证据；未查看位点覆盖；忽略创始人效应和祖源差异。", status:"ClinGen细化", source:"ClinGen PM2 v1.0" },
  { code:"PM3", title:"隐性病中与致病变异反式", direction:"致病", strength:"支持至极强", domain:"等位/相位", original:"在隐性病中，与另一条致病变异位于反式。", current:"按另一等位基因分类、相位确认方式、纯合观察及病例重复情况计点，累积后映射强度。", pitfalls:"默认两条变异反式；用VUS作为等价致病等位基因；同一家庭重复计分。", status:"ClinGen细化", source:"ClinGen PM3 v1.0" },
  { code:"PM4", title:"蛋白长度改变", direction:"致病", strength:"中等", domain:"蛋白", original:"非重复区域的框内缺失/插入，或终止密码子丢失导致蛋白长度改变。", current:"核查区域功能、重复背景、可耐受变异及具体疾病机制；部分VCEP会调整强度。", pitfalls:"与PVS1同时使用却未区分机制；所有框内indel一律PM4。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP规范" },
  { code:"PM5", title:"同一残基不同致病错义", direction:"致病", strength:"支持至中等", domain:"蛋白", original:"同一氨基酸残基已有另一种明确致病的错义改变。", current:"核查参照变异证据质量、氨基酸改变严重度和剪接影响；多个参照变异不必然独立累加。", pitfalls:"参照变异本身只是VUS；不同疾病机制；与PS1混淆。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP规范" },
  { code:"PM6", title:"未确认亲缘的新生变异", direction:"致病", strength:"支持至强", domain:"家系", original:"推定为新生变异，但父母双方亲缘关系未完全确认。", current:"与PS2共用ClinGen计点框架，因亲缘未确认获得较低点值。", pitfalls:"把“父母未检出”直接当PM6；未检查父母覆盖、嵌合或样本身份。", status:"ClinGen细化", source:"ClinGen PS2/PM6 v1.1" },
  { code:"PP1", title:"与疾病共分离", direction:"致病", strength:"支持至强", domain:"家系", original:"变异在多个受累家系成员中与疾病共分离。", current:"根据有效减数分裂、外显率、表型特异性和家系结构评估；可用似然方法或VCEP阈值。", pitfalls:"只数阳性亲属；忽略同一单倍型上其他变异；把共分离当作变异本身的直接功能证据。", status:"ClinGen细化", source:"ClinGen PP1/BS4, PP4" },
  { code:"PP2", title:"错义致病机制占主导", direction:"致病", strength:"支持", domain:"基因机制", original:"基因中良性错义变异少，而错义变异是常见致病机制。", current:"必须用基因/疾病特异背景建立；许多VCEP仅在明确阈值下使用或不使用。", pitfalls:"任何错义变异都套PP2；未区分LOF、显性负效或功能获得机制。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP规范" },
  { code:"PP3", title:"计算证据支持有害", direction:"致病", strength:"支持至强", domain:"计算/剪接", original:"多种计算证据支持对基因或基因产物有害。", current:"错义预测使用经校准的工具与阈值；剪接证据按ClinGen Splicing规范，可调整强度但避免工具堆叠。", pitfalls:"多个工具重复计分；默认阈值；与PVS1、PS1或RNA证据重复。", status:"ClinGen细化", source:"ClinGen PP3/BP4 + Splicing" },
  { code:"PP4", title:"表型高度特异", direction:"致病", strength:"支持至强", domain:"表型", original:"患者表型或家族史对单一遗传病高度特异。", current:"需考虑表型特异性、检测范围、遗传异质性及替代诊断；可按ClinGen框架调整强度。", pitfalls:"常见或非特异表型；候选基因面板本身造成循环论证；与病例筛选重复。", status:"ClinGen细化", source:"ClinGen PP1/BS4, PP4" },
  { code:"PP5", title:"权威来源报告致病", direction:"致病", strength:"不使用", domain:"来源", original:"可信来源近期报告为致病，但实验室无法独立获得其证据。", current:"ClinGen建议不要使用PP5；应定位原始证据或引用专家组分类本身，不能把权威声誉转成独立证据。", pitfalls:"复制ClinVar结论再加PP5；与该来源公开的底层证据重复。", status:"不建议使用", source:"ClinGen PP5/BP6" },
  { code:"BA1", title:"高频良性独立证据", direction:"良性", strength:"独立", domain:"人群", original:"等位基因频率高于5%。", current:"使用适当人群数据与高质量等位基因；核查ClinGen BA1例外列表及疾病/基因特异阈值。", pitfalls:"忽略低外显风险等位基因、创始变异和例外列表；用低质量频率。", status:"ClinGen细化", source:"ClinGen BA1 update + exception list" },
  { code:"BS1", title:"频率高于疾病允许值", direction:"良性", strength:"强/可调整", domain:"人群", original:"等位基因频率高于该疾病所能允许的最高频率。", current:"阈值需结合患病率、遗传异质性、外显率、遗传模式和祖源；优先采用VCEP特异阈值。", pitfalls:"使用全人群平均掩盖亚群高频；把BS1与BA1混用。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP阈值" },
  { code:"BS2", title:"健康个体中的不相容观察", direction:"良性", strength:"强/可调整", domain:"人群/表型", original:"在预期早发且完全外显的疾病中，健康成人具有相应致病基因型。", current:"必须满足年龄、外显率、遗传模式和表型评估充分；对于不完全外显疾病通常降级或不使用。", pitfalls:"数据库“健康”未经深度表型；晚发病；隐性病杂合携带者。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP规范" },
  { code:"BS3", title:"功能实验显示无有害效应", direction:"良性", strength:"支持至强", domain:"功能", original:"完善的体外或体内研究显示对蛋白功能或剪接无有害影响。", current:"与PS3使用同一实验质量框架；阴性实验必须对疾病机制敏感且有充分动态范围。", pitfalls:"实验不能测到相关功能却得出无害；野生型相似但对照不足。", status:"ClinGen细化", source:"ClinGen PS3/BS3" },
  { code:"BS4", title:"不与疾病共分离", direction:"良性", strength:"支持至强", domain:"家系", original:"变异在家系受累成员中不共分离。", current:"需排除表型模拟、遗传异质性、年龄依赖外显和样本问题；按ClinGen共分离框架评估。", pitfalls:"常见表型中的拟表型；把未携带变异的可疑亲属视为确诊受累者。", status:"ClinGen细化", source:"ClinGen PP1/BS4, PP4" },
  { code:"BP1", title:"仅截短机制基因中的错义", direction:"良性", strength:"支持", domain:"基因机制", original:"错义变异位于主要由截短变异致病的基因。", current:"只有在明确的基因—疾病机制下使用；部分区域或疾病可能存在错义机制例外。", pitfalls:"按整个基因一刀切；忽略功能获得或显性负效的特定区域。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP规范" },
  { code:"BP2", title:"与另一致病变异同相或不相容反相", direction:"良性", strength:"支持", domain:"等位/相位", original:"显性完全外显病中与致病变异反式，或任意遗传模式下与致病变异同相。", current:"先明确疾病遗传模式、相位和两变异作用；复杂遗传与修饰效应需谨慎。", pitfalls:"相位未确认；隐性病反式观察误用BP2；忽略双重诊断。", status:"原始框架", source:"ACMG/AMP 2015 + VCEP规范" },
  { code:"BP3", title:"非功能重复区的框内改变", direction:"良性", strength:"支持", domain:"蛋白", original:"位于无已知功能的重复区域中的框内缺失/插入。", current:"需要确认重复区域对蛋白功能不重要，并结合该区域良性长度变异背景。", pitfalls:"仅因为是重复序列就使用；重复单元实际影响关键结构。", status:"原始框架", source:"ACMG/AMP 2015" },
  { code:"BP4", title:"计算证据支持无害", direction:"良性", strength:"支持至强", domain:"计算/剪接", original:"多种计算证据提示对基因或基因产物无影响。", current:"错义工具需校准阈值；剪接按ClinGen规范处理，并注意“未预测有害”不等于实验性无害。", pitfalls:"多个工具重复；低置信预测；与BP7或RNA证据重复。", status:"ClinGen细化", source:"ClinGen PP3/BP4 + Splicing" },
  { code:"BP5", title:"存在其他分子病因", direction:"良性", strength:"支持", domain:"病例", original:"变异见于已有另一分子基础可解释疾病的病例。", current:"只有在疾病通常单因且替代病因充分解释表型时才有意义；双重诊断或修饰效应时不适用。", pitfalls:"把任何第二诊断都当BP5；忽略两个疾病共同存在。", status:"原始框架", source:"ACMG/AMP 2015" },
  { code:"BP6", title:"权威来源报告良性", direction:"良性", strength:"不使用", domain:"来源", original:"可信来源近期报告为良性，但证据无法供实验室独立评价。", current:"ClinGen建议不要使用BP6；应取得底层证据或引用专家组结论，避免声誉型证据。", pitfalls:"复制数据库分类并再计BP6；与公开频率/功能证据重复。", status:"不建议使用", source:"ClinGen PP5/BP6" },
  { code:"BP7", title:"无剪接影响的同义变异", direction:"良性", strength:"支持", domain:"剪接/保守性", original:"同义变异，预测不影响剪接，且核苷酸不高度保守。", current:"ClinGen剪接框架扩展和细化适用范围；需使用经校准的剪接预测并考虑RNA相关证据。", pitfalls:"所有同义变异自动BP7；深外显子剪接调控；与BP4重复。", status:"ClinGen细化", source:"ClinGen Splicing" },
];

const combinationRows = [
  ["致病", "1×极强 + ≥1×强；或1×极强 + ≥2×中等；或≥2×强；以及ACMG/AMP表5的其他组合"],
  ["可能致病", "1×极强 + 1×中等；或1×强 + 1–2×中等；或≥3×中等；以及表5其他组合"],
  ["良性", "1×BA1；或≥2×良性强证据"],
  ["可能良性", "1×良性强 + 1×良性支持；或≥2×良性支持"],
  ["意义未明", "未达到上述组合，或致病与良性证据相互矛盾"],
];

const caseSteps = ["病例资料", "表型整理", "遗传模式", "候选比较", "证据赋值", "综合分类", "报告撰写"];
const evidenceOptions = ["PS2_VeryStrong", "PS3", "PM2_Supporting", "PP1_Strong", "PP3", "PP4"];
const pahSteps = ["筛查与复核", "鉴别诊断", "遗传模式", "双变异与相位", "分别判级", "病例级结论", "报告与评分"];
const emptyPahAnswer: PahAnswer = { inheritance: "", phase: "", variant1Class: "", variant2Class: "", rationale1: "", rationale2: "", conclusion: "", report: "" };

export default function LearningWorkspace() {
  const [view, setView] = useState<View>("dashboard");
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [answer, setAnswer] = useState<CaseAnswer>({ inheritance: "", evidence: [], classification: "", report: "" });
  const [activeCaseId, setActiveCaseId] = useState("001");
  const [pahStep, setPahStep] = useState(0);
  const [pahAnswer, setPahAnswer] = useState<PahAnswer>(emptyPahAnswer);
  const [lessonId, setLessonId] = useState("phenotype");
  const [lessonDone, setLessonDone] = useState<string[]>([]);
  const [examAnswers, setExamAnswers] = useState<number[]>(Array(examQuestions.length).fill(-1));
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [ruleDirection, setRuleDirection] = useState("全部");
  const [ruleDomain, setRuleDomain] = useState("全部");
  const [ruleSearch, setRuleSearch] = useState("");
  const [selectedRule, setSelectedRule] = useState("PVS1");
  const [workbench, setWorkbench] = useState<string[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("variant-atlas-demo");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration of the user's local learning draft */
        setStep(state.step ?? 0);
        setAnswer(state.answer ?? { inheritance: "", evidence: [], classification: "", report: "" });
        setActiveCaseId(state.activeCaseId ?? "001");
        setPahStep(state.pahStep ?? 0);
        setPahAnswer(state.pahAnswer ?? emptyPahAnswer);
        setLessonDone(state.lessonDone ?? []);
        setMistakes(state.mistakes ?? []);
        /* eslint-enable react-hooks/set-state-in-effect */
      } catch { /* ignore a damaged local draft */ }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("variant-atlas-demo", JSON.stringify({ step, answer, activeCaseId, pahStep, pahAnswer, lessonDone, mistakes }));
  }, [step, answer, activeCaseId, pahStep, pahAnswer, lessonDone, mistakes]);

  const score = useMemo(() => {
    let value = 0;
    if (answer.inheritance === "AD") value += 20;
    const expected = ["PS2_VeryStrong", "PS3", "PP1_Strong", "PP3"];
    value += expected.filter((item) => answer.evidence.includes(item)).length * 10;
    if (answer.classification === "Pathogenic") value += 20;
    if (answer.report.length >= 60) value += 20;
    return Math.min(value, 100);
  }, [answer]);

  const pahScore = useMemo(() => {
    let value = 0;
    if (pahAnswer.inheritance === "AR") value += 10;
    if (pahAnswer.phase === "trans") value += 15;
    if (pahAnswer.variant1Class === "Pathogenic") value += 15;
    if (pahAnswer.variant2Class === "Likely pathogenic") value += 15;
    if (pahAnswer.rationale1.length >= 50) value += 10;
    if (pahAnswer.rationale2.length >= 50) value += 10;
    if (pahAnswer.conclusion === "supports") value += 10;
    if (pahAnswer.report.length >= 100 && pahAnswer.report.includes("PAH") && pahAnswer.report.includes("c.1222") && pahAnswer.report.includes("c.1246")) value += 15;
    return value;
  }, [pahAnswer]);

  const examScore = useMemo(() => examQuestions.reduce((total, question, index) => total + (examAnswers[index] === question.answer ? 20 : 0), 0), [examAnswers]);

  const activeLesson = lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];
  const activeRule = evidenceRules.find((rule) => rule.code === selectedRule) ?? evidenceRules[0];
  const filteredRules = evidenceRules.filter((rule) => (ruleDirection === "全部" || rule.direction === ruleDirection) && (ruleDomain === "全部" || rule.domain.includes(ruleDomain)) && `${rule.code}${rule.title}${rule.original}${rule.current}`.toLowerCase().includes(ruleSearch.toLowerCase()));
  const workbenchResult = useMemo(() => classifyTraditional(workbench), [workbench]);

  function submitExam() {
    const nextMistakes = examQuestions.filter((question, index) => examAnswers[index] !== question.answer).map((question) => question.tag);
    setMistakes(Array.from(new Set([...mistakes, ...nextMistakes])));
    setExamSubmitted(true);
  }

  function navigate(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openCase(id: string) {
    setActiveCaseId(id);
    setChecked(false);
    navigate("case");
  }

  function toggleEvidence(item: string) {
    setAnswer((current) => ({
      ...current,
      evidence: current.evidence.includes(item)
        ? current.evidence.filter((value) => value !== item)
        : [...current.evidence, item],
    }));
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("dashboard")} aria-label="返回学习首页">
          <span className="brand-mark">VA</span>
          <span><strong>Variant Atlas</strong><small>遗传解读训练</small></span>
        </button>
        <nav aria-label="主导航">
          <button className={view === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")}>学习台</button>
          <button className={view === "courses" ? "active" : ""} onClick={() => navigate("courses")}>课程</button>
          <button className={view === "rules" ? "active" : ""} onClick={() => navigate("rules")}>证据规则</button>
          <button className={view === "library" || view === "case" ? "active" : ""} onClick={() => navigate("library")}>病例库</button>
          <button className={view === "exam" ? "active" : ""} onClick={() => navigate("exam")}>测验</button>
        </nav>
        <div className="profile"><span>L1</span><div><b>基础识别</b><small>个人学习空间</small></div></div>
      </header>

      <main>
        {view === "dashboard" && (
          <>
            <section className="hero-grid">
              <div className="hero-copy">
                <span className="eyebrow">WES / WGS · 单基因病诊断</span>
                <h1>把每条证据，<br />落到一个真实判断上。</h1>
                <p>从GRCh38候选变异出发，练习表型、遗传模式、ACMG证据与报告写作。每一步先判断，再查看规范依据。</p>
                <div className="hero-actions">
                  <button className="primary" onClick={() => openCase("001")}>继续样板病例 <span>→</span></button>
                  <button className="secondary" onClick={() => navigate("courses")}>进入核心课程</button>
                </div>
              </div>
              <div className="case-card featured">
                <div className="card-top"><span>正在学习</span><b>CASE 001</b></div>
                <h2>三联体中的<br />Noonan综合征</h2>
                <p>新生变异 · 常染色体显性 · PTPN11</p>
                <div className="case-meta"><span>当前进度</span><strong>{step + 1} / 7</strong></div>
                <div className="progress"><i style={{ width: `${((step + 1) / 7) * 100}%` }} /></div>
                <button onClick={() => openCase("001")}>进入病例工作台 <span>↗</span></button>
              </div>
            </section>

            <section className="metrics" aria-label="学习概况">
              <div><span>学习路径</span><strong>6<small> 个模块</small></strong></div>
              <div><span>病例矩阵</span><strong>8<small> 个训练情境</small></strong></div>
              <div><span>证据手册</span><strong>28<small> 条标准全覆盖</small></strong></div>
              <div><span>证据快照</span><strong>2026<small>-08-13</small></strong></div>
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span>CURRICULUM</span><h2>学习路径</h2></div><p>每节约20分钟。统计基础可快速通过，重点训练分子机制和证据适用边界。</p></div>
              <div className="module-grid">
                {modules.map((module) => (
                  <button className="module-card module-action" key={module.no} onClick={() => { setLessonId(lessons[Number(module.no) - 1].id); navigate("courses"); }}>
                    <span className="module-no">{module.no}</span><h3>{module.title}</h3><p>{module.meta}</p>
                    <div className="mini-progress"><i style={{ width: `${module.progress}%` }} /></div>
                    <small>{module.progress ? `${module.progress}% 已完成` : "尚未开始"}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="dashboard-tools">
              <button onClick={() => navigate("library")}><span>CASE MATRIX</span><b>查看8例覆盖矩阵</b><small>开放病例、已核查证据与待审核边界病例</small></button>
              <button onClick={() => navigate("exam")}><span>ASSESSMENT</span><b>完成L1阶段测验</b><small>5题即时反馈，错误自动进入错题本</small></button>
              <button onClick={() => navigate("mistakes")}><span>REVIEW</span><b>查看错题本</b><small>{mistakes.length ? `${mistakes.length} 个待巩固主题` : "暂无错题，先完成阶段测验"}</small></button>
            </section>

            <section className="principle-strip">
              <div><span className="pulse" />证据原则</div>
              <p>变异致病性 ≠ 病例诊断。平台始终分开评价变异、基因—疾病关系和患者表型相关性。</p>
              <button onClick={() => navigate("roadmap")}>查看能力标准 →</button>
            </section>
          </>
        )}

        {view === "courses" && (
          <section className="course-workspace">
            <aside className="course-index">
              <span className="eyebrow">CORE COURSE</span><h1>核心课程</h1><p>每节约20分钟，完成后保存在本机。</p>
              {lessons.map((lesson) => <button className={lesson.id === activeLesson.id ? "active" : ""} onClick={() => setLessonId(lesson.id)} key={lesson.id}><span>{lessonDone.includes(lesson.id) ? "✓" : lesson.no}</span><div><b>{lesson.title}</b><small>{lesson.duration}</small></div></button>)}
            </aside>
            <article className="lesson-reader">
              <div className="lesson-meta"><span>MODULE {activeLesson.no}</span><b>{activeLesson.duration}</b></div>
              <h1>{activeLesson.title}</h1><p className="lesson-objective">学习目标：{activeLesson.objective}</p>
              {activeLesson.sections.map(([title, body], index) => <section key={title}><span>{String(index + 1).padStart(2,"0")}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}
              <div className="lesson-checkpoint"><b>本节检查点</b><p>{activeLesson.checkpoint}</p></div>
              <div className="lesson-actions"><button className="secondary" onClick={() => navigate("rules")}>查看关联证据</button><button className="primary" onClick={() => setLessonDone(Array.from(new Set([...lessonDone, activeLesson.id])))}>{lessonDone.includes(activeLesson.id) ? "已完成 ✓" : "标记本节完成"}</button></div>
            </article>
          </section>
        )}

        {view === "library" && (
          <section className="page-section">
            <div className="page-intro"><span className="eyebrow">CASE MATRIX</span><h1>病例覆盖矩阵</h1><p>已有两例开放完整作答；其余病例只有完成来源、HGVS、疾病机制与答案版本审核后才会解锁。</p></div>
            <div className="library-grid">{caseLibrary.map((item) => <article className={`library-card ${item.tone}`} key={item.id}><div className="library-top"><span>CASE {item.id}</span><b>{item.status}</b></div><h2>{item.title}</h2><p className="gene-label">{item.gene} · {item.mode}</p><div className="focus-box"><span>训练重点</span><p>{item.focus}</p></div><small>主要依据：{item.source}</small>{item.id === "001" || item.id === "002" ? <button onClick={() => openCase(item.id)}>开始完整病例 →</button> : item.id === "003" ? <a href="https://www.ncbi.nlm.nih.gov/clinvar/RCV000003934/" target="_blank" rel="noreferrer">查看专家组公开记录 ↗</a> : <button disabled>审核完成后开放</button>}</article>)}</div>
            <div className="matrix-legend"><span><i className="dot live"/>可作答</span><span><i className="dot verified"/>证据已核查，交互待制作</span><span><i className="dot review"/>选例与证据审核中</span><span><i className="dot planned"/>素材准备中</span></div>
          </section>
        )}

        {view === "exam" && (
          <section className="page-section exam-page">
            <div className="page-intro"><span className="eyebrow">L1 ASSESSMENT</span><h1>基础识别阶段测验</h1><p>每题20分。提交后显示依据，错误主题自动进入本机错题本。</p></div>
            <div className="exam-layout"><div className="exam-questions">{examQuestions.map((question, qIndex) => <article className="exam-card" key={question.q}><span>QUESTION {qIndex + 1}</span><h2>{question.q}</h2><div>{question.options.map((option, optionIndex) => <button className={examAnswers[qIndex] === optionIndex ? "selected" : ""} onClick={() => { const next=[...examAnswers]; next[qIndex]=optionIndex; setExamAnswers(next); setExamSubmitted(false); }} key={option}><i>{String.fromCharCode(65 + optionIndex)}</i>{option}</button>)}</div>{examSubmitted && <Feedback ok={examAnswers[qIndex] === question.answer}>{examAnswers[qIndex] === question.answer ? "回答正确。" : `正确答案：${question.options[question.answer]}。`}</Feedback>}</article>)}</div><aside className="exam-summary"><span>作答进度</span><strong>{examAnswers.filter(value => value >= 0).length}<small> / 5</small></strong><div className="mini-progress"><i style={{width:`${examAnswers.filter(value => value >= 0).length * 20}%`}}/></div><button className="primary" disabled={examAnswers.some(value => value < 0)} onClick={submitExam}>提交测验</button>{examSubmitted && <div className="exam-result"><span>得分</span><b>{examScore}</b><small>/100</small><button onClick={() => navigate("mistakes")}>查看错题本 →</button></div>}</aside></div>
          </section>
        )}

        {view === "mistakes" && (
          <section className="page-section">
            <div className="page-intro"><span className="eyebrow">REVIEW BOOK</span><h1>错题本</h1><p>错题按能力主题聚合，避免只记住某一道题的选项。</p></div>
            {mistakes.length ? <div className="mistake-list">{mistakes.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2,"0")}</span><div><h2>{item}</h2><p>{item === "遗传模式" ? "复习de novo、不完全外显、表现度差异及父母低比例嵌合。" : item === "证据独立性" ? "复习预测证据、功能证据及同一底层数据的重复计分风险。" : item === "病例级解释" ? "复习隐性病相位、两等位基因分别分类和VUS边界。" : item === "数据库检索" ? "复习ClinVar提交层级、专家组规范、疾病实体和更新日期。" : "复习阴性结果的残余风险、检测盲区和下一步建议。"}</p></div><button onClick={() => navigate(item === "数据库检索" || item === "证据独立性" ? "rules" : "courses")}>开始复习 →</button></article>)}</div> : <div className="empty-state"><span>✓</span><h2>目前没有错题</h2><p>完成阶段测验后，错误主题会自动汇总到这里。</p><button className="primary" onClick={() => navigate("exam")}>开始测验</button></div>}
          </section>
        )}

        {view === "rules" && (
          <section className="evidence-page">
            <div className="evidence-hero"><div><span className="eyebrow">EVIDENCE HANDBOOK · 28 CRITERIA</span><h1>证据规则工作手册</h1><p>左侧保留2015年ACMG/AMP原始框架，右侧标注ClinGen现行通用细化。真正解读时，适用的基因/疾病VCEP规范优先于这里的通用提示。</p></div><div className="evidence-counts"><span><b>16</b>致病证据</span><span><b>12</b>良性证据</span><span><b>11</b>ClinGen通用细化主题</span></div></div>
            <div className="evidence-alert"><b>使用顺序</b><p>确认基因—疾病—遗传模式 → 查找VCEP特异规范 → 应用ClinGen通用建议 → 回到ACMG/AMP组合规则 → 记录版本、来源与反证。</p></div>
            <div className="rule-toolbar">
              <label><span>检索</span><input value={ruleSearch} onChange={(event) => setRuleSearch(event.target.value)} placeholder="代码、名称或关键词" /></label>
              <div><span>方向</span>{["全部","致病","良性"].map(item => <button className={ruleDirection === item ? "active" : ""} onClick={() => setRuleDirection(item)} key={item}>{item}</button>)}</div>
              <div><span>证据域</span>{["全部","人群","家系","功能","计算","机制"].map(item => <button className={ruleDomain === item ? "active" : ""} onClick={() => setRuleDomain(item)} key={item}>{item}</button>)}</div>
            </div>
            <div className="rule-handbook">
              <aside className="rule-list"><div className="rule-list-head"><span>显示 {filteredRules.length} / 28</span><b>{ruleDirection === "全部" ? "全部标准" : `${ruleDirection}证据`}</b></div>{filteredRules.map(rule => <button className={`${rule.code === activeRule.code ? "active" : ""} ${rule.direction === "致病" ? "pathogenic" : "benign"}`} onClick={() => setSelectedRule(rule.code)} key={rule.code}><span>{rule.code}</span><div><b>{rule.title}</b><small>{rule.strength} · {rule.domain}</small></div><i>{rule.status === "不建议使用" ? "停" : rule.status === "ClinGen细化" ? "新" : "原"}</i></button>)}</aside>
              <article className="rule-detail">
                <div className="detail-top"><div><span className={`direction ${activeRule.direction === "致病" ? "pathogenic" : "benign"}`}>{activeRule.direction}</span><span>{activeRule.strength}</span><span>{activeRule.domain}</span></div><b>{activeRule.status}</b></div>
                <h1><span>{activeRule.code}</span>{activeRule.title}</h1>
                <section><span>2015 原始框架</span><p>{activeRule.original}</p></section>
                <section className="current-guidance"><span>当前通用使用提示</span><p>{activeRule.current}</p></section>
                <section className="pitfall-guidance"><span>高风险误用</span><p>{activeRule.pitfalls}</p></section>
                <div className="detail-source"><span>主要依据</span><b>{activeRule.source}</b><small>证据快照：2026-08-13</small></div>
                <div className="detail-actions"><button className="secondary" onClick={() => navigate("case")}>在病例中练习</button><a href="https://www.clinicalgenome.org/tools/clingen-variant-classification-guidance/" target="_blank" rel="noreferrer">打开ClinGen现行汇总 ↗</a></div>
              </article>
            </div>
            <section className="combination-panel"><div><span className="eyebrow">COMBINATION RULES</span><h2>五级分类组合速查</h2><p>这是ACMG/AMP 2015表5的压缩提示。采用强度调整、VCEP规范或贝叶斯/计分化框架时，应使用对应规范的完整组合方法。</p></div><div>{combinationRows.map(([label, body]) => <article key={label}><b>{label}</b><p>{body}</p></article>)}</div></section>
            <section className="evidence-workbench"><div className="workbench-intro"><span className="eyebrow">COMBINATION PRACTICE</span><h2>证据组合练习台</h2><p>点击加入证据，观察ACMG/AMP表5组合结果。练习台采用代码原始强度，但按ClinGen通用建议将PM2作为支持级；暂不模拟其他代码的升降级。实际工作以适用VCEP的强度与组合规则为准。</p><div className={`workbench-result ${workbenchResult.tone}`}><span>当前结果</span><strong>{workbenchResult.label}</strong><p>{workbenchResult.reason}</p></div><button onClick={() => setWorkbench([])}>清空组合</button></div><div className="workbench-codes">{evidenceRules.map(rule => <button className={`${workbench.includes(rule.code) ? "selected" : ""} ${rule.direction === "致病" ? "pathogenic" : "benign"}`} disabled={rule.status === "不建议使用"} onClick={() => setWorkbench(workbench.includes(rule.code) ? workbench.filter(code => code !== rule.code) : [...workbench, rule.code])} key={rule.code}><b>{rule.code}</b><span>{rule.code === "PM2" ? "支持（ClinGen通用）" : rule.strength}</span></button>)}</div></section>
            <section className="revision-map"><h2>ClinGen通用修订地图</h2><div><article><b>人群</b><p>BA1例外列表；PM2降为支持；gnomAD v4使用指导。</p></article><article><b>机制与剪接</b><p>PVS1决策树；PVS1/PS1/PP3/BP4/BP7剪接框架。</p></article><article><b>病例与家系</b><p>PS2/PM6计点；PM3反式计点；PP1/BS4与PP4。</p></article><article><b>功能与计算</b><p>PS3/BS3实验质量；PP3/BP4工具校准。</p></article><article><b>来源型证据</b><p>PP5/BP6不建议使用，应回溯底层证据。</p></article><article><b>分类框架</b><p>强度改名规范；贝叶斯模型；自然尺度计分系统。</p></article></div></section>
            <div className="sources-panel"><h2>主版本与原始来源</h2><ul><li><a href="https://www.acmg.net/docs/standards_guidelines_for_the_interpretation_of_sequence_variants.pdf" target="_blank" rel="noreferrer">ACMG/AMP序列变异解读指南（2015，原始28条标准及组合表）</a></li><li><a href="https://www.clinicalgenome.org/tools/clingen-variant-classification-guidance/" target="_blank" rel="noreferrer">ClinGen Variant Classification Guidance（页面标注最后更新：2025-07）</a></li><li><a href="https://www.clinicalgenome.org/curation-activities/variant-pathogenicity/documents/" target="_blank" rel="noreferrer">ClinGen变异致病性文件与VCEP规范</a></li><li><a href="https://varnomen.hgvs.org/" target="_blank" rel="noreferrer">HGVS Nomenclature Recommendations</a></li></ul><p>本页是教学用工作手册，不替代实验室SOP或基因/疾病特异规范。动态资源须在每次真实解读时重新核查。</p></div>
          </section>
        )}

        {view === "case" && activeCaseId === "001" && (
          <section className="case-workspace">
            <aside className="case-sidebar">
              <button className="back" onClick={() => navigate("dashboard")}>← 返回学习台</button>
              <span className="eyebrow">CASE 001 · 公开证据教学病例</span><h1>Noonan综合征</h1><p>三联体WES · GRCh38</p>
              <ol>{caseSteps.map((item, index) => <li className={index === step ? "current" : index < step ? "done" : ""} key={item}><button onClick={() => index <= step && setStep(index)}><span>{index < step ? "✓" : index + 1}</span>{item}</button></li>)}</ol>
              <div className="snapshot"><b>证据快照</b><span>2026-08-13</span><small>答案按该日期锁定</small></div>
            </aside>
            <div className="case-main">
              <div className="case-status"><span>步骤 {step + 1} / 7</span><div><i style={{ width: `${((step + 1) / 7) * 100}%` }} /></div></div>
              {step === 0 && <CaseBlock title="病例资料" lead="先形成疾病谱假设，不急于看变异。"><div className="clinical-note"><b>先证者</b><p>6岁男童，身高低于同龄儿，肺动脉瓣狭窄，眼距宽、睑裂下斜，胸廓异常。父母表型正常，无类似家族史。</p><b>检测</b><p>先证者及父母三联体WES。性别及亲缘关系质控支持申报关系；未见明显污染。</p></div><PromptBox>哪些阳性和阴性HPO术语最能帮助后续筛选？进入下一步查看结构化表型。</PromptBox></CaseBlock>}
              {step === 1 && <CaseBlock title="表型整理" lead="区分核心表型、支持表型和真正有信息量的阴性表型。"><div className="hpo-grid"><span>HP:0001642<br/><b>肺动脉瓣狭窄</b></span><span>HP:0004322<br/><b>身材矮小</b></span><span>HP:0000316<br/><b>眼距过宽</b></span><span>HP:0000768<br/><b>胸廓异常</b></span></div><PromptBox>心脏表型与特征性面容组合指向RASopathy谱系；父母表型正常不能单独排除显性遗传。</PromptBox></CaseBlock>}
              {step === 2 && <CaseBlock title="遗传模式假设" lead="选择最符合病例与三联体结构的首要模式。"><ChoiceRow options={[['AD','常染色体显性 / de novo'],['AR','常染色体隐性'],['XL','X连锁'],['MT','线粒体遗传']]} value={answer.inheritance} onChange={(value) => setAnswer({...answer, inheritance:value})}/>{checked && <Feedback ok={answer.inheritance === "AD"}>{answer.inheritance === "AD" ? "正确。该表型谱首先考虑常染色体显性RASopathy；父母正常使de novo机制成为重要假设。" : "需要重看表型组合。Noonan综合征主要相关基因多为常染色体显性，三联体重点检索de novo变异。"}</Feedback>}</CaseBlock>}
              {step === 3 && <CaseBlock title="候选变异比较" lead="候选列表是教学用精简结果，暂不代表完整VCF过滤。"><div className="variant-table"><div className="head"><span>基因 / 变异</span><span>遗传</span><span>质量</span><span>表型</span></div><div className="selected"><span><b>PTPN11</b><small>NM_002834.5:c.922A&gt;G<br/>p.(Asn308Asp)</small></span><span>de novo<br/>杂合</span><span>DP 86<br/>VAF 0.51</span><span>强匹配</span></div><div><span><b>USH2A</b><small>杂合错义</small></span><span>父源</span><span>通过</span><span>不匹配</span></div><div><span><b>TTN</b><small>杂合错义</small></span><span>母源</span><span>通过</span><span>弱匹配</span></div></div><PromptBox>PTPN11变异位于GRCh38 chr12:112477719，MANE Select转录本为NM_002834.5。ClinVar中由RASopathy专家组评审为致病。</PromptBox></CaseBlock>}
              {step === 4 && <CaseBlock title="证据赋值" lead="请选择能由当前公开证据支持的代码；注意不重复计算。"><div className="evidence-picker">{evidenceOptions.map(item => <button className={answer.evidence.includes(item) ? "chosen" : ""} onClick={() => toggleEvidence(item)} key={item}>{item}<span>{answer.evidence.includes(item) ? "✓" : "+"}</span></button>)}</div>{checked && <Feedback ok={answer.evidence.includes("PS2_VeryStrong") && answer.evidence.includes("PS3")}>专家组历史分类使用PS2_VeryStrong、PS3、PP1_Strong、PP3等证据。PM2在现有人群数据中需要按最新数据和当前规范重新判断，不能照抄2017年的ExAC结论；PP4也需避免与病例选择造成重复强化。</Feedback>}<div className="citation-note"><b>教学要点</b><p>本题展示“读取专家组既有分类”，不是让单个新病例重复创造PS2_VeryStrong。提交日期、患者是否重复、功能实验质量都必须核查。</p></div></CaseBlock>}
              {step === 5 && <CaseBlock title="综合分类" lead="分类针对PTPN11—Noonan综合征这一明确疾病关系。"><ChoiceRow options={[['Pathogenic','致病'],['Likely pathogenic','可能致病'],['VUS','意义未明'],['Likely benign','可能良性']]} value={answer.classification} onChange={(value) => setAnswer({...answer, classification:value})}/>{checked && <Feedback ok={answer.classification === "Pathogenic"}>{answer.classification === "Pathogenic" ? "与ClinGen RASopathy VCEP专家组结论一致：Pathogenic。" : "该变异已有ClinGen专家组针对Noonan综合征的致病分类；应优先核查并采用适用的VCEP规范。"}</Feedback>}<div className="three-levels"><div><span>1</span><b>变异</b><p>对Noonan综合征为致病</p></div><div><span>2</span><b>疾病关系</b><p>PTPN11—Noonan：明确</p></div><div><span>3</span><b>病例相关性</b><p>遗传模式与表型高度匹配</p></div></div></CaseBlock>}
              {step === 6 && <CaseBlock title="报告撰写" lead="用限定清晰、可追溯的语言完成病例级结论。"><textarea value={answer.report} onChange={(event) => setAnswer({...answer, report:event.target.value})} placeholder="建议包含：检测发现、转录本与HGVS、合子状态和来源、分类与证据摘要、表型相关性、验证及遗传咨询提示……"/><div className="report-checks"><span className={answer.report.includes("PTPN11") ? "met" : ""}>PTPN11</span><span className={answer.report.includes("c.922") ? "met" : ""}>完整HGVS</span><span className={answer.report.length >= 60 ? "met" : ""}>结论充分</span><span className={answer.report.includes("验证") ? "met" : ""}>验证建议</span></div>{checked && <Feedback ok={answer.report.length >= 60}>参考表达：检测到PTPN11基因NM_002834.5:c.922A&gt;G [p.(Asn308Asp)]杂合变异，三联体结果支持新生来源。该变异经ClinGen RASopathy专家组评审为致病，患者表型及遗传模式与Noonan综合征高度吻合，支持建立分子诊断。建议结合临床表现，按实验室流程确认变异及亲缘关系并进行遗传咨询。</Feedback>}</CaseBlock>}
              <div className="case-actions"><button className="secondary" disabled={step === 0} onClick={() => {setStep(Math.max(0, step - 1));setChecked(false)}}>上一步</button><button className="check" onClick={() => setChecked(true)}>检查本步</button><button className="primary" disabled={step === 6} onClick={() => {setStep(Math.min(6, step + 1));setChecked(false)}}>保存并继续 →</button></div>
              {step === 6 && checked && <div className="score-card"><span>本次练习得分</span><strong>{score}</strong><small>/ 100</small><p>这是规则化形成性评价，不代表职业资质或临床授权。</p></div>}
            </div>
          </section>
        )}

        {view === "case" && activeCaseId === "002" && (
          <section className="case-workspace pah-case">
            <aside className="case-sidebar">
              <button className="back" onClick={() => navigate("library")}>← 返回病例库</button>
              <span className="eyebrow">CASE 002 · 教学重组病例</span><h1>PAH缺乏症</h1><p>三联体WES · GRCh38 · 复合杂合</p>
              <div className="synthetic-badge"><b>证据边界</b><span>变异与专家分类来自公开真实记录；个案数值、父母来源和相位为教学重组，不对应单一真实患者。</span></div>
              <ol>{pahSteps.map((item, index) => <li className={index === pahStep ? "current" : index < pahStep ? "done" : ""} key={item}><button onClick={() => index <= pahStep && setPahStep(index)}><span>{index < pahStep ? "✓" : index + 1}</span>{item}</button></li>)}</ol>
              <div className="snapshot"><b>证据快照</b><span>2026-08-13</span><small>答案按该日期锁定</small></div>
            </aside>
            <div className="case-main">
              <div className="case-status"><span>步骤 {pahStep + 1} / 7</span><div><i style={{ width: `${((pahStep + 1) / 7) * 100}%` }} /></div></div>

              {pahStep === 0 && <CaseBlock title="筛查异常与复核" lead="先确认高苯丙氨酸血症，再把分子结果放回生化背景。">
                <div className="clinical-note"><b>教学重组个案</b><p>足月新生儿，新生儿筛查提示苯丙氨酸升高。复查血浆氨基酸：Phe 680 μmol/L，Phe:Tyr 5.2；采样前未开始限制苯丙氨酸饮食。患儿一般情况稳定，父母无相关表现。</p><b>检测</b><p>患儿及父母三联体WES；亲缘关系与样本质控通过。以下候选使用GRCh38与MANE Select转录本NM_000277.3。</p></div>
                <PromptBox>GeneReviews 2025指出，异常筛查后的诊断建立需要生化复核与分子检测；分子分析不应延误必要处置。</PromptBox>
              </CaseBlock>}

              {pahStep === 1 && <CaseBlock title="鉴别诊断与缺口" lead="持续高苯丙氨酸血症不能在看到PAH变异后就停止鉴别。">
                <div className="differential-grid"><article><span>01</span><b>确认生化阈值</b><p>Phe &gt;120 μmol/L且Phe:Tyr ≥3支持生化异常；本教学数据符合。</p></article><article><span>02</span><b>排除BH4相关缺陷</b><p>尿/血蝶呤及必要时红细胞DHPR活性；也可使用覆盖高苯丙氨酸血症相关基因的检测。</p></article><article><span>03</span><b>不要等待分型才处置</b><p>异常筛查后应及时联系代谢专科；分子结果用于确认、管理信息与遗传咨询。</p></article></div>
                <div className="citation-note"><b>病例补充</b><p>本教学个案设定蝶呤谱与DHPR活性未提示BH4合成或再循环缺陷。这个设定仅用于训练病例综合，不是公开患者数据。</p></div>
              </CaseBlock>}

              {pahStep === 2 && <CaseBlock title="遗传模式假设" lead="选择PAH缺乏症与当前家系最匹配的遗传模式。">
                <ChoiceRow options={[["AR","常染色体隐性"],["AD","常染色体显性"],["XL","X连锁"],["MT","线粒体遗传"]]} value={pahAnswer.inheritance} onChange={(value) => setPahAnswer({...pahAnswer, inheritance:value})}/>
                {checked && <Feedback ok={pahAnswer.inheritance === "AR"}>{pahAnswer.inheritance === "AR" ? "正确。PAH缺乏症为常染色体隐性遗传，需分别评价两条等位基因并确认其相位。" : "PAH缺乏症的明确遗传模式是常染色体隐性；无家族史并不反对该模式。"}</Feedback>}
              </CaseBlock>}

              {pahStep === 3 && <CaseBlock title="双变异与相位" lead="相位是隐性病病例级解释的核心，不应看到两条杂合变异就默认反式。">
                <div className="allele-pair">
                  <article><span>母源等位基因</span><h3>PAH c.1222C&gt;T</h3><p>NM_000277.3 · p.(Arg408Trp)</p><small>GRCh38 chr12:102840493 G&gt;A · VAF 0.48</small><a href="https://www.ncbi.nlm.nih.gov/clinvar/variation/577/" target="_blank" rel="noreferrer">ClinVar Variation ID 577 ↗</a></article>
                  <div className="phase-mark">?</div>
                  <article><span>父源等位基因</span><h3>PAH c.1246C&gt;A</h3><p>NM_000277.3 · p.(Pro416Thr)</p><small>GRCh38 chr12:102840469 G&gt;T · VAF 0.52</small><a href="https://www.ncbi.nlm.nih.gov/clinvar/variation/987913/" target="_blank" rel="noreferrer">ClinVar Variation ID 987913 ↗</a></article>
                </div>
                <ChoiceRow options={[["trans","反式（分别来自父母）"],["cis","顺式（位于同一等位基因）"],["unknown","相位未知"],["de_novo","均为新生"]]} value={pahAnswer.phase} onChange={(value) => setPahAnswer({...pahAnswer, phase:value})}/>
                {checked && <Feedback ok={pahAnswer.phase === "trans"}>{pahAnswer.phase === "trans" ? "正确。两条变异分别由母亲和父亲传递，因此在患儿中可判定为反式。" : "三联体结果显示一条母源、一条父源；这能直接建立反式关系。"}</Feedback>}
              </CaseBlock>}

              {pahStep === 4 && <CaseBlock title="两条变异分别判级" lead="先独立判断每条变异，再讨论它们能否共同解释病例。请写出来源、强度、适用性与反证。">
                <div className="dual-curation">
                  <article><div className="curation-head"><span>VARIANT A</span><b>c.1222C&gt;T · p.(Arg408Trp)</b></div><div className="evidence-chips"><span>PS3</span><span>PM3_Strong</span><span>PP3</span><span>PP4_Moderate</span></div><p>PAH VCEP记录：功能研究支持约1–2%野生型活性；既往在反式致病等位基因背景中观察；专家组于2018年分类。</p><ChoiceRow options={[["Pathogenic","致病"],["Likely pathogenic","可能致病"],["VUS","意义未明"],["Benign","良性"]]} value={pahAnswer.variant1Class} onChange={(value) => setPahAnswer({...pahAnswer, variant1Class:value})}/><label className="rationale-field"><span>证据理由</span><textarea value={pahAnswer.rationale1} onChange={(event) => setPahAnswer({...pahAnswer, rationale1:event.target.value})} placeholder="至少50字：说明专家组、疾病实体、证据代码与强度，以及是否存在反证……"/></label></article>
                  <article><div className="curation-head"><span>VARIANT B</span><b>c.1246C&gt;A · p.(Pro416Thr)</b></div><div className="evidence-chips"><span>PP3_Strong</span><span>PM2_Supporting</span><span>PM3_Supporting</span><span>PM5_Supporting</span><span>PP4</span></div><p>PAH VCEP 2024记录：REVEL 0.965、gnomAD v4.1.0未见、既往病例及同残基变化提供支持；专家组结论为可能致病。</p><ChoiceRow options={[["Pathogenic","致病"],["Likely pathogenic","可能致病"],["VUS","意义未明"],["Benign","良性"]]} value={pahAnswer.variant2Class} onChange={(value) => setPahAnswer({...pahAnswer, variant2Class:value})}/><label className="rationale-field"><span>证据理由</span><textarea value={pahAnswer.rationale2} onChange={(event) => setPahAnswer({...pahAnswer, rationale2:event.target.value})} placeholder="至少50字：不要把多个预测工具重复计分，也不要把专家组结论再算作PP5……"/></label></article>
                </div>
                {checked && <Feedback ok={pahAnswer.variant1Class === "Pathogenic" && pahAnswer.variant2Class === "Likely pathogenic" && pahAnswer.rationale1.length >= 50 && pahAnswer.rationale2.length >= 50}>公开专家组结论分别为Pathogenic与Likely Pathogenic。理由不足50字时不会获得书写分；重点是说明为什么证据适用于PAH—苯丙酮尿症这一疾病实体，而不只是列代码。</Feedback>}
                <div className="citation-note warning-note"><b>防重复计分</b><p>教学重组的父母来源与相位不能反向写入公共变异分类，也不能当成新的PM3病例。真实实验室若要用本地病例调整分类，必须确认独立性、表型与相位，并按当前PAH VCEP规范计点。</p></div>
              </CaseBlock>}

              {pahStep === 5 && <CaseBlock title="病例级结论" lead="把变异分类、双等位基因、相位、生化表型和鉴别诊断合在一起。">
                <ChoiceRow options={[["supports","支持PAH缺乏症分子诊断"],["carrier","仅提示携带者"],["uncertain","仍为分子诊断不确定"],["rules_out","排除PAH缺乏症"]]} value={pahAnswer.conclusion} onChange={(value) => setPahAnswer({...pahAnswer, conclusion:value})}/>
                {checked && <Feedback ok={pahAnswer.conclusion === "supports"}>{pahAnswer.conclusion === "supports" ? "正确。两条P/LP变异反式存在，且生化表型与疾病机制吻合，支持PAH缺乏症的分子诊断。" : "GeneReviews明确：双等位PAH致病/可能致病变异可建立分子诊断；一条致病加一条VUS则通常不能。"}</Feedback>}
                <div className="three-levels"><div><span>1</span><b>变异层</b><p>A为致病，B为可能致病</p></div><div><span>2</span><b>基因型层</b><p>两条变异经父母来源证实反式</p></div><div><span>3</span><b>病例层</b><p>生化异常吻合，BH4相关缺陷已作鉴别</p></div></div>
              </CaseBlock>}

              {pahStep === 6 && <CaseBlock title="报告与形成性评分" lead="报告必须同时写清两条变异、相位、分别分类和病例级限定。">
                <textarea value={pahAnswer.report} onChange={(event) => setPahAnswer({...pahAnswer, report:event.target.value})} placeholder="建议包含：PAH、NM_000277.3、两条c./p.描述、杂合与父母来源、反式、分别分类及依据、生化相关性、验证/咨询与检测边界……"/>
                <div className="report-checks"><span className={pahAnswer.report.includes("PAH") ? "met" : ""}>PAH</span><span className={pahAnswer.report.includes("c.1222") ? "met" : ""}>变异A HGVS</span><span className={pahAnswer.report.includes("c.1246") ? "met" : ""}>变异B HGVS</span><span className={pahAnswer.report.includes("反式") ? "met" : ""}>相位</span><span className={pahAnswer.report.length >= 100 ? "met" : ""}>≥100字</span></div>
                {checked && <Feedback ok={pahAnswer.report.length >= 100 && pahAnswer.report.includes("PAH") && pahAnswer.report.includes("c.1222") && pahAnswer.report.includes("c.1246")}>参考结构：教学个案检出PAH基因NM_000277.3:c.1222C&gt;T [p.(Arg408Trp)]与c.1246C&gt;A [p.(Pro416Thr)]杂合变异，分别来自母亲与父亲，支持反式。两变异经PAH VCEP分别评为致病和可能致病；结合持续高苯丙氨酸血症及鉴别检查，结果支持PAH缺乏症的分子诊断。建议按实验室流程确认并结合代谢专科评估及遗传咨询。</Feedback>}
                <div className="case-sources"><b>本例原始依据</b><a href="https://www.ncbi.nlm.nih.gov/books/NBK1504/" target="_blank" rel="noreferrer">GeneReviews：PAH Deficiency（2025修订）↗</a><a href="https://www.ncbi.nlm.nih.gov/clinvar/variation/577/" target="_blank" rel="noreferrer">ClinVar：c.1222C&gt;T专家组记录 ↗</a><a href="https://www.ncbi.nlm.nih.gov/clinvar/variation/987913/" target="_blank" rel="noreferrer">ClinVar：c.1246C&gt;A专家组记录 ↗</a></div>
              </CaseBlock>}

              <div className="case-actions"><button className="secondary" disabled={pahStep === 0} onClick={() => {setPahStep(Math.max(0, pahStep - 1));setChecked(false)}}>上一步</button><button className="check" onClick={() => setChecked(true)}>检查本步</button><button className="primary" disabled={pahStep === 6} onClick={() => {setPahStep(Math.min(6, pahStep + 1));setChecked(false)}}>保存并继续 →</button></div>
              {pahStep === 6 && checked && <div className="score-card"><span>CASE 002 形成性得分</span><strong>{pahScore}</strong><small>/ 100</small><div className="score-breakdown"><span>模式 10</span><span>相位 15</span><span>双变异 30</span><span>理由 20</span><span>病例结论 10</span><span>报告 15</span></div><p>这是站内规则化学习反馈，不代表临床授权或职业资格。</p></div>}
            </div>
          </section>
        )}

        {view === "roadmap" && (
          <section className="page-section roadmap">
            <div className="page-intro"><span className="eyebrow">COMPETENCY MAP</span><h1>独立解读能力地图</h1><p>认证只表示站内训练水平，不等同于临床遗传学职业资格。</p></div>
            <div className="level-list"><article><span>L1</span><div><h2>基础识别</h2><p>理解遗传模式、HGVS、检测边界和五级分类。</p></div><b>当前</b></article><article><span>L2</span><div><h2>证据评估</h2><p>能判断单条证据的适用性、强度和重复计分风险。</p></div><b>待解锁</b></article><article><span>L3</span><div><h2>病例解读</h2><p>完成候选比较、基因—疾病核查、分类与病例相关性判断。</p></div><b>待解锁</b></article><article><span>L4</span><div><h2>综合报告</h2><p>在限时盲态病例中完成完整、克制且可追溯的报告。</p></div><b>待解锁</b></article></div>
            <div className="warning-panel"><b>高风险错误</b><p>把VUS作为确诊依据 · 复制数据库结论而不核查 · 使用错误转录本 · 同一证据重复计分 · 忽略反证 · 阴性结果声称排除遗传病</p></div>
          </section>
        )}
      </main>
      <footer><span>Variant Atlas · 教学用途</span><p>不接收真实患者信息，不替代临床诊断。医学结论须由合格专业人员复核。</p><span>GRCh38 · v0.4</span></footer>
    </div>
  );
}

function CaseBlock({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return <div className="case-block"><span className="eyebrow">STEP WORKSPACE</span><h2>{title}</h2><p className="lead">{lead}</p>{children}</div>;
}

function PromptBox({ children }: { children: React.ReactNode }) { return <div className="prompt-box"><span>思考提示</span><p>{children}</p></div>; }

function ChoiceRow({ options, value, onChange }: { options: string[][]; value: string; onChange: (value: string) => void }) {
  return <div className="choice-row">{options.map(([key,label]) => <button className={value === key ? "selected" : ""} onClick={() => onChange(key)} key={key}><b>{key}</b><span>{label}</span></button>)}</div>;
}

function Feedback({ ok, children }: { ok: boolean; children: React.ReactNode }) { return <div className={`feedback ${ok ? "good" : "review"}`}><b>{ok ? "判断通过" : "建议复核"}</b><p>{children}</p></div>; }

function classifyTraditional(codes: string[]) {
  const has = (code: string) => codes.includes(code);
  const pvs = codes.filter(code => code === "PVS1").length;
  const ps = codes.filter(code => /^PS[1-4]$/.test(code)).length;
  const pm = codes.filter(code => /^PM[1-6]$/.test(code) && code !== "PM2").length;
  const pp = codes.filter(code => /^PP[1-4]$/.test(code)).length + (has("PM2") ? 1 : 0);
  const bs = codes.filter(code => /^BS[1-4]$/.test(code)).length;
  const bp = codes.filter(code => /^BP[1-5]$|^BP7$/.test(code)).length;
  const pathogenicEvidence = pvs + ps + pm + pp > 0;
  const benignEvidence = has("BA1") || bs + bp > 0;
  if (pathogenicEvidence && benignEvidence) return { label:"意义未明 / 冲突", reason:"同时存在致病与良性证据，必须先解决冲突、适用性和证据独立性。", tone:"vus" };
  if (has("BA1") || bs >= 2) return { label:"良性", reason:has("BA1") ? "满足BA1独立良性证据。" : "满足至少2条良性强证据。", tone:"benign" };
  if ((bs >= 1 && bp >= 1) || bp >= 2) return { label:"可能良性", reason:"满足传统表5的可能良性组合。", tone:"likely-benign" };
  const pathogenic = (pvs >= 1 && (ps >= 1 || pm >= 2 || (pm >= 1 && pp >= 1) || pp >= 2)) || ps >= 2 || (ps >= 1 && (pm >= 3 || (pm >= 2 && pp >= 2) || (pm >= 1 && pp >= 4)));
  if (pathogenic) return { label:"致病", reason:"满足传统ACMG/AMP表5的致病组合。仍需确认每条证据独立且适用。", tone:"pathogenic" };
  const likely = (pvs >= 1 && pm >= 1) || (ps >= 1 && pm >= 1) || (ps >= 1 && pp >= 2) || pm >= 3 || (pm >= 2 && pp >= 2) || (pm >= 1 && pp >= 4);
  if (likely) return { label:"可能致病", reason:"满足传统ACMG/AMP表5的可能致病组合。", tone:"likely-pathogenic" };
  return { label:codes.length ? "意义未明" : "尚未加入证据", reason:codes.length ? "当前组合尚未达到致病、可能致病、良性或可能良性的组合阈值。" : "从右侧选择证据代码开始练习。", tone:"vus" };
}
