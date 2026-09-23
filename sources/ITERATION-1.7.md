# v1.7 来源、实现边界与验证

核查日期：2026-09-23。仅为新增功能/RNA主题核查，不代表全部网站规范已更新到该日期。parallel-cli不可用，本轮用网页检索及原始出版页面核查；未增加外部账户或研究依赖。

## 原始来源

1. Brnich et al. *Genome Medicine* 12:3 (2020)，2019-12-31在线发表。[DOI 10.1186/s13073-019-0690-2](https://doi.org/10.1186/s13073-019-0690-2)，Figure 4、Table 3。采纳实验适用性/验证优先和OddsPath严格边界映射；不将原始活性、p值或论文数量当作OddsPath。缺少校准时停止自动映射，并引导回Figure 4，不否认其他合规人工评估路径。
2. Walker et al. (2023)，ClinGen SVI Splicing Subgroup。[正式论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC10357475/)，Table 3、Figure 5及RNA assay considerations。采纳RNA与蛋白功能证据分路、材料/定量/残余表达审核及同一剪接信息避免重复计权。不从minigene名称自动确定强度；不制造跨基因统一的残余比例门槛。
3. *A calibrated cell-based functional assay to aide classification of MLH1 DNA mismatch repair gene variants* (2022)，[PMID 36054288 / PMC9772141](https://pmc.ncbi.nlm.nih.gov/articles/PMC9772141/)，Results 3.2、Table 2。R100Q：稳定性正常、损伤应答异常、修复功能中间、综合OddsPath 0.778；原表Ind、预测VUS。仅转述原文时间截面，不声称当前分类已重审，不补造患者资料。
4. [ClinGen功能实验审核工作表](https://www.clinicalgenome.org/docs/svi-functional-assay-documentation-worksheet/)（2020-05-08）提供实验实例/验证信息的记录思路；本站表单为自行设计的教学交互，不复制原工作簿。

## 实现范围

- 两个新增证据工作区。功能模块要求来源、底稿、校准、机制、对照、独立性及读数方向；任一缺失不输出强度。患者材料中的多变异背景须分清，勾选不是平台验证。
- RNA仅给下一步审核路线，不是自动PVS1/BP7强度算法。同一剪接效应不可重复PS3；独立下游蛋白实验、BP4/BP7组合须回规范，不一概禁止组合。
- 2份新增公开包、4个审核项；总计5包11项。软件候选输出是明示的教学假设，不计作真实病例证据或病例数量。
- 输入更改使本模块审核勾选失效；本地保存并纳入档案v7。旧档案、既有课程/测验/认证保留。审核包错误沿用统一复习队列。
- 这是学习辅助，不代替现行VCEP、实验室审核或临床签发。未新增患者上传、云端账户或自动诊断接口。

## 验证范围

新增自动测试覆盖OddsPath全部严格边界、非法数值/科学计数法、资料阻断、方向冲突、RNA分路、v7往返与旧档案、初始页面安全状态。完整构建与51项回归通过；发布前再次按最终源码构建和回归。

本地浏览器核对：18.7映射Moderate、修改数值清空审核勾选、minigene正常剪接进入BP7(RNA)评估但强度待定、刷新后恢复RNA底稿、MLH1逐步揭示和正确审核反馈。只使用明示测试文字/公开规范，不录入患者数据。测试不是临床算法验证。
