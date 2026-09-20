# v1.5 人工审核与证据强度专题

核查日期：2026-09-20。保存本轮检索的来源定位与采用范围，供复核和后续升级；不是独立临床规范。

## 检索方法与限制

research-lookup 首选 parallel-cli 未配置，使用内置网页检索直接查 ClinGen 官方汇总、官方建议PDF和原始论文；不使用非原始博客或软件默认值作为阈值依据。检索包括 PM3 in-trans、PS2/PM6 de novo、PVS1、PS3/BS3、PP1/BS4/PP4、PP3/BP4 calibration、splicing 及 ACMG/AMP 2015。

部分 PMC/出版商全文打开触发访问检查或跳转失败。可读的官方PDF、PMC网页和原始论文的搜索索引用于确认下述信息；不能核实的额外数值不加入。检索索引的“发布于几个月前”不作为文件发布日期，日期取原文版本/批准日期。未宣称穷尽2026年的所有VCEP，也未整体刷新原有其他领域规范的复核日期。

## 来源与采用范围

| 原始来源 | 本轮采用内容 |
| --- | --- |
| [ClinGen Variant Classification Guidance](https://www.clinicalgenome.org/tools/clingen-variant-classification-guidance/)（页面标注2025-07） | 确认现行汇总入口仍列下述通用建议；PP5/BP6不再使用。不是2026新指南。 |
| [PM3 v1.0](https://clinicalgenome.org/docs/pm3-recommendation-for-in-trans-criterion-pm3-version-1.0/)（2019-05-02，2页） | 表1逐观察权重、纯合/VUS类别总上限；表2强度阈值；第2页稀有度、未知相位不同另一变异、独立分类避免循环论证。 |
| [PS2/PM6 v1.1](https://www.clinicalgenome.org/docs/ps2-pm6-recommendation-for-de-novo-ps2-and-pm6-acmg-amp-criteria-version-1.0/)（2021-05-05更新，2页） | 两表中的表型/亲缘计点与强度；高异质性类贡献上限；特殊遗传模式条款。URL虽含1.0，文件标题明确1.1。 |
| [PM2 v1.0](https://www.clinicalgenome.org/docs/pm2-recommendation-for-absence-rarity/)（2020-09-04） | 改为Supporting，不把未检出自动升级。 |
| [Abou Tayoun et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/6185798/) · DOI 10.1002/humu.23626 | PVS1四强度、变异类型/机制/NMD/转录本决策路径。未把完整决策树改写成自动分类器。 |
| [Brnich et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/6938631/) · DOI 10.1186/s13073-019-0690-2 | 实验相关性与校准；Table 3 OddsPath严格不等号。不能把p值当OddsPath。 |
| [Biesecker et al. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10806742/) | Tables 2–4：有效共分离、表型检出率、等位基因分配及PP1/PP4共享上限；复杂家系转正式分析。 |
| [Pejaver et al. 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9748256/) · DOI 10.1016/j.ajhg.2022.10.013 | Tables 2/4与建议段落：预选单一校准工具；REVEL区间；PP3与PM1共享Strong上限。表2的BP4 VeryStrong研究区间与表4临床建议分开呈现，不自动启用。 |
| [Walker et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10357475/) | RNA证据进入PVS1/BP7(RNA)；避免同一剪接效应重复加权；实验组织/设计限制。 |
| [Richards et al. 2015](https://pmc.ncbi.nlm.nih.gov/articles/4544753/) · DOI 10.1038/gim.2015.30 | 原始代码适用条件；无通用数值升降级路径的代码不创造阈值。 |
| [ClinGen CSpec Registry](https://cspec.clinicalgenome.org/cspec/ui/svi/) | 动态基因–疾病特异规范路由；未声称已审核全部条目。 |

以上为原创简要教学提炼和必要数值，不复制指南全文。全部新数值在页面有版本、表格定位与原文链接。

## 实现与安全边界

- 28条强度说明区分通用计点、校准/决策树、VCEP特异及停用。不是每个代码都能升到每个等级。
- PM3仅实现通用v1.0。保留逐行原始分与分组封顶结果；缺少范围确认、来源、家系号或前提核查的行不计入。重复家系号全部暂排，不按排列顺序取第一条。
- 未知相位贡献达到1分但另一P/LP仅一种时，输出“人工审核”，不自动给强度。该停止关口为平台安全设计，不是另创医学分值上限；同义标识仍需人工归一化。
- 不接收文件/患者资料，不请求LLM或第三方自动解读服务；审核模块教人审查自动输出，不宣称本站能完成临床自动解读。
- 六关口分工为平台教学设计；十道题是明确标注的抽象边界练习，不伪装为真实病例，不改变真实病例覆盖计数。
- 理由只校验长度，选择题只按固定参考答案评价，不宣称自动审核医学语义或临床资质。错误答案进入统一复习队列，保留原始成绩。
- 新本地记录纳入档案v5，兼容导入v1–v4；不改既有认证门槛。沿用跨窗口防覆盖、导入回滚和重置代次隔离。
- 原有2015组合台仍不模拟所有升降级，页面明确其边界；PM3不自动写入该台，避免误用。修复此前PM2只降为Supporting却漏掉PM2原文配套“VS+Supporting→LP”组合的问题；输出明确标记是2020扩展而非2015原表，按钮显示实际固定强度。增加此路径回归。

## 本地验证结果

35项测试全部通过（原有28项+新增7项），覆盖精确阈值、上限、相位、重复/未核查资料、28代码来源覆盖、新记录格式与错题收集，以及PM2扩展组合。学习应用类型检查、全项目代码检查与生产构建通过。浏览器逐项点击验证与临床专家签审不在本次已完成验证声明中。

本机Sites构建封装脚本因npm不在运行环境路径上而失败；使用项目既有build脚本对应的已安装Vinext入口完成同一生产构建，未安装依赖、改版本或改包管理器。保留已有生产预览方式。构建的路由静态推断“Unknown”是既有运行器提示；实际服务端渲染回归返回200。
