export const labReviewedAt = "2026-09-21";
export const labSources = {
  denovo: "https://www.clinicalgenome.org/docs/ps2-pm6-recommendation-for-de-novo-ps2-and-pm6-acmg-amp-criteria-version-1.0/",
  segregation: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10806742/",
  pvs1: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6185798/",
  splicing: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10357475/",
  cspec: "https://cspec.clinicalgenome.org/cspec/ui/svi/",
};
export const phenotypeLabels = { specific: "高度特异", consistent: "一致但不高度特异", heterogeneous: "一致、不特异且高度遗传异质", inconsistent: "与基因–疾病不一致" };
export type DeNovoRow = { family: string; source: string; parentage: "unknown" | "confirmed" | "assumed"; parentsNegative: boolean; phenotype: keyof typeof phenotypeLabels; verified: boolean; special: boolean };
export const emptyDeNovo = (): DeNovoRow => ({ family: "", source: "", parentage: "unknown", parentsNegative: false, phenotype: "inconsistent", verified: false, special: false });
const normalizeId = (text: string) => text.trim().toLowerCase();
const duplicated = (ids: string[], value: string) => ids.filter(id => id === value).length > 1;
export function deNovoStrength(total: number, confirmed: boolean) {
  if (!Number.isFinite(total) || total < 0.5) return "未满足新发证据";
  const strength = total >= 4 ? "VeryStrong" : total >= 2 ? "Strong" : total >= 1 ? "Moderate" : "Supporting";
  return `${confirmed ? "PS2" : "PM6"}_${strength}`;
}
/** ClinGen PS2/PM6 v1.1 tables 1–2. Special inheritance cases are deliberately routed to review. */
export function calculateDeNovo(rows: DeNovoRow[], scope: boolean) {
  const ids = rows.map(row => normalizeId(row.family));
  let ordinary = 0, heterogeneous = 0, confirmed = false;
  const details = rows.map((row, index) => {
    let points = 0, reason = "";
    if (!scope) reason = "未确认通用规则适用";
    else if (!ids[index] || !row.source.trim()) reason = "缺少家系去重号或原文定位";
    else if (duplicated(ids, ids[index])) reason = "同一家系重复，合并后再计分";
    else if (row.special) reason = "特殊遗传模式/疑似生殖系嵌合，须专项审核";
    else if (!row.verified) reason = "独立性、变异质量或表型依据未核查";
    else if (!row.parentsNegative) reason = "未证实双亲均检测该变异且阴性";
    else if (row.parentage === "unknown") reason = "亲缘确认状态尚未核实";
    else {
      const base = { specific: 2, consistent: 1, heterogeneous: 0.5, inconsistent: 0 }[row.phenotype];
      points = base * (row.parentage === "confirmed" ? 1 : 0.5);
      reason = `${phenotypeLabels[row.phenotype]}；${row.parentage === "confirmed" ? "亲缘已确认" : "亲缘仅假定"} → ${points}分`;
      if (row.phenotype === "heterogeneous") heterogeneous += points; else ordinary += points;
      if (points > 0 && row.parentage === "confirmed") confirmed = true;
    }
    return { points, reason };
  });
  const total = ordinary + Math.min(1, heterogeneous);
  const pending = !scope || rows.some((row, i) => row.special || !row.verified || !row.parentsNegative || row.parentage === "unknown" || !ids[i] || !row.source.trim() || duplicated(ids, ids[i]));
  return { details, ordinary, heterogeneous, capped: Math.min(1, heterogeneous), total, pending,
    strength: pending ? "待人工补齐/复核，不输出最终强度" : deNovoStrength(total, confirmed) };
}

// Biesecker et al., 2024, Table 2; select the lower supported yield, never interpolate upward.
export const yieldPoints: ReadonlyArray<readonly [number, number]> = [[19.1,1],[25.4,1.5],[33,2],[41.5,2.5],[50.6,3],[59.6,3.5],[68,4],[75.4,4.5],[81.6,5],[86.4,5.5],[90.2,6],[93,6.5],[95,7],[96.5,7.5],[97.5,8],[98.3,8.5],[98.8,9],[99.2,9.5],[99.4,10],[99.6,10.5],[99.7,11],[99.8,11.5],[99.9,12]];
export function phenotypePoints(yieldPercent: number) {
  if (!Number.isFinite(yieldPercent) || yieldPercent < 0 || yieldPercent > 100) return null;
  return [...yieldPoints].reverse().find(([yieldValue]) => yieldValue <= yieldPercent)?.[1] ?? 0;
}
export type SegregationRow = { person: string; source: string; affected: boolean; verified: boolean };
export type SegregationInput = { scope: boolean; mode: "AD" | "AR" | "XLR"; yieldPercent: string; yieldSource: string; yieldVerified: boolean; homogeneous: boolean; fullyPenetrant: boolean; complex: boolean; variants: string; rows: SegregationRow[] };
export const emptySegregation = (): SegregationInput => ({ scope: false, mode: "AD", yieldPercent: "", yieldSource: "", yieldVerified: false, homogeneous: false, fullyPenetrant: false, complex: false, variants: "1", rows: [] });
export function combinedLocusStrength(points: number) {
  return points < 1 ? "未满足PP1/PP4" : points < 2 ? "Supporting" : points < 3 ? "Moderate 或 Supporting＋Supporting" : points < 4 ? "Moderate＋Supporting" : points < 5 ? "Strong 或 Moderate＋Moderate" : "Strong＋Supporting（共享上限）";
}
export function calculateSegregation(input: SegregationInput) {
  const issues: string[] = [];
  if (!input.scope) issues.push("未确认强/确定的基因–疾病关联及通用简单家系模型适用。");
  if (input.complex) issues.push("低外显率、拟表型、矛盾分离、近亲婚配/复杂家系：转正式连锁或专科分析，不机械赋BS4。");
  const count = Number(input.variants);
  if (!Number.isInteger(count) || count < 1 || count > 30) issues.push("同一等位基因的合理候选数须为1–30的整数；这是输入范围，不是医学阈值。");
  const hasYield = input.yieldPercent.trim() !== "";
  const yieldValue = hasYield ? Number(input.yieldPercent) : null;
  let pp4 = 0;
  if (hasYield) {
    const points = phenotypePoints(yieldValue!);
    if (points === null) issues.push("检出率须在0–100%之间。");
    else if (!input.yieldVerified || !input.yieldSource.trim()) issues.push("检出率缺少原文或表型/检测方法匹配确认。");
    else pp4 = points;
  }
  const noSegregation = input.homogeneous && yieldValue !== null && yieldValue > 90;
  const ids = input.rows.map(row => normalizeId(row.person));
  const details = input.rows.map((row, index) => {
    let points = 0, reason = "";
    if (!ids[index] || !row.source.trim() || !row.verified || duplicated(ids, ids[index])) {
      reason = "记录未核查、来源缺失或家系-个体去重号重复";
      issues.push(`观察${index + 1}需补齐或去重。`);
    } else if (noSegregation) reason = "高检出率位点同质：不再叠加共分离";
    else if (!row.affected && !input.fullyPenetrant) {
      reason = "未确认完全外显，不纳入未受累者";
      issues.push(`观察${index + 1}涉及未受累者，请确认外显率/年龄，或转专项分析。`);
    } else {
      points = input.mode === "AR" ? row.affected ? 2 : 0.4 : 1;
      reason = `${input.mode}有效${row.affected ? "受累" : "未受累"}共分离 → ${points}分`;
    }
    return { points, reason };
  });
  const pp1 = Math.round(details.reduce((sum, row) => sum + row.points, 0) * 10) / 10;
  const raw = pp1 + pp4;
  const divided = Number.isInteger(count) && count >= 1 && count <= 30 ? raw / count : 0;
  const total = Math.min(5, divided);
  return { pp1, pp4, raw, divided, total, noSegregation, details, issues,
    strength: issues.length ? "待人工审核，不输出强度" : combinedLocusStrength(total) };
}
