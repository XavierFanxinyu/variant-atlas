export type GuidelineRecord = {
  id: string;
  title: string;
  owner: string;
  version: string;
  published: string;
  reviewed: string;
  status: "现行" | "基础框架" | "疾病特异";
  scope: string;
  useWhen: string;
  caution: string;
  url: string;
};

export const guidelineRecords: GuidelineRecord[] = [
  { id:"acmg-seq", title:"序列变异解释标准与指南", owner:"ACMG / AMP", version:"2015基础框架", published:"2015-05", reviewed:"2026-08-27", status:"基础框架", scope:"生殖系序列变异五级分类", useWhen:"没有更具体的ClinGen/VCEP规则时作为基础框架，并叠加当前ClinGen通用建议。", caution:"原始组合规则不能替代疾病特异规范；PP5/BP6等历史代码不应机械使用。", url:"https://pubmed.ncbi.nlm.nih.gov/25741868/" },
  { id:"clingen-current", title:"Variant Classification Guidance", owner:"ClinGen Variant Classification WG", version:"在线现行入口", published:"2025-07更新", reviewed:"2026-08-27", status:"现行", scope:"PVS1、PS2/PM6、PS3/BS3、PM2、PM3、PP3/BP4、剪接等通用细化", useWhen:"每次变异分类前查询当前可用的通用建议、版本和发布日期。", caution:"ClinGen SVI Working Group已在2025年退出历史舞台；旧文件可保留原组织名，当前工作组名称应使用Variant Classification WG。", url:"https://www.clinicalgenome.org/tools/clingen-variant-classification-guidance/" },
  { id:"vcep-protocol", title:"Variant Curation Expert Panel Protocol", owner:"ClinGen", version:"Version 12", published:"2025-12-18", reviewed:"2026-08-27", status:"现行", scope:"VCEP规范开发、审批、版本与证据摘要要求", useWhen:"核查疾病特异规范的状态、版本、适用疾病实体和批准层级。", caution:"ClinVar中的历史专家组分类仍有价值，但重分析必须核对当前版本和新增证据。", url:"https://clinicalgenome.org/docs/clingen-variant-curation-expert-panel-vcep-protocol/" },
  { id:"summary-text", title:"Standardized Evidence Summary Text", owner:"ClinGen", version:"Version 3", published:"2025-12", reviewed:"2026-08-27", status:"现行", scope:"专家证据摘要的结构化表达与可追溯字段", useWhen:"训练证据底稿、分类理由和版本记录的写作结构。", caution:"这是证据摘要写法，不是新的分类阈值；仍需引用实际适用规范。", url:"https://clinicalgenome.org/docs/standardized-text-for-clingen-variant-curation-expert-panels/" },
  { id:"cnv", title:"宪法性拷贝数变异解释与报告技术标准", owner:"ACMG / ClinGen", version:"2020", published:"2020-02", reviewed:"2026-08-27", status:"现行", scope:"生殖系CNV loss/gain五部分证据评分与分类", useWhen:"评价WES/WGS检出的宪法性缺失和重复。", caution:"loss与gain分开评分；CNV分类与该CNV解释患者表型的程度也必须分开。", url:"https://pubmed.ncbi.nlm.nih.gov/31690835/" },
  { id:"ngs", title:"生殖系疾病NGS技术标准", owner:"ACMG", version:"2021 revision", published:"2021-07", reviewed:"2026-08-27", status:"现行", scope:"检测设计、验证、分析、确认、报告和重分析", useWhen:"定义WES/WGS检测能力、质量边界与阴性结果限制。", caution:"技术验证阈值必须来自本实验室方法学，不能从公开案例直接移植。", url:"https://pubmed.ncbi.nlm.nih.gov/33927380/" },
  { id:"sv", title:"生殖系结构变异检测技术考虑", owner:"ACMG", version:"2023", published:"2023-03", reviewed:"2026-08-27", status:"现行", scope:"SV检测、事件重建、确认与报告", useWhen:"解释平衡/复杂重排、断点中断和多信号结构事件。", caution:"caller输出不是最终事件；需要整合split-read、discordant pair、深度和BAF等信号。", url:"https://pubmed.ncbi.nlm.nih.gov/36507974/" },
  { id:"mtdna", title:"mtDNA变异ACMG/AMP规范", owner:"ClinGen /专家组", version:"2020", published:"2020-11", reviewed:"2026-08-27", status:"现行", scope:"线粒体变异证据、异质性、组织和单倍群语境", useWhen:"解释WGS mtDNA发现及组织差异性异质性。", caution:"血液低水平或阴性不能代表其他组织；异质性比例不能单独预测严重度。", url:"https://pubmed.ncbi.nlm.nih.gov/32906214/" },
  { id:"sf", title:"ACMG Secondary Findings", owner:"ACMG", version:"SF v3.3 · 84 genes", published:"2025", reviewed:"2026-08-27", status:"现行", scope:"临床外显子组/基因组二级发现最低清单", useWhen:"仅在检测同意、实验室政策与可报告变异标准允许时处理二级发现。", caution:"基因位于清单内不代表其所有变异均应报告；VUS不因清单身份而升级。", url:"https://search.clinicalgenome.org/kb/genes/acmgsf" },
];

export const routingOrder = [
  "先确认疾病实体、遗传模式、变异类型和检测场景。",
  "优先查找当前有效的ClinGen VCEP疾病/基因特异规范。",
  "没有VCEP规范时，使用ACMG/AMP基础框架并叠加当前ClinGen通用建议。",
  "CNV、SV、mtDNA、STR等变异类型进入各自专项技术标准，不混用SNV规则。",
  "记录规范版本、发布日期、检索日期、证据快照及偏离规范的理由。",
];
