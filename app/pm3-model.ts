export type PM3Observation = {
  family: string; source: string; otherVariant: string;
  kind: "heterozygous" | "homozygous";
  phase: "unknown" | "trans" | "cis";
  classification: "VUS" | "LP" | "P" | "B/LB";
  verified: boolean;
};
export function emptyPM3Observation(): PM3Observation {
  return { family: "", source: "", otherVariant: "", kind: "heterozygous", phase: "unknown", classification: "VUS", verified: false };
}
export function pm3Strength(points: number): string {
  if (!Number.isFinite(points) || points < 0.5) return "未满足PM3";
  return points >= 4 ? "PM3_VeryStrong" : points >= 2 ? "PM3_Strong" : points >= 1 ? "PM3（Moderate）" : "PM3_Supporting";
}
/** PM3 v1.0 table 1/2 only. Identity checks are teaching safeguards, not a new clinical threshold. */
export function calculatePM3(observations: PM3Observation[], scopeConfirmed: boolean) {
  const normalizedId = (value: string) => value.trim().toLowerCase();
  const families = observations.map(row => normalizedId(row.family));
  let homozygous = 0, vus = 0, other = 0;
  const unknownVariants = new Set<string>();
  let unknownPoints = 0;
  const rows = observations.map((row, index) => {
    let points = 0;
    let reason = "";
    if (!scopeConfirmed) reason = "尚未确认通用PM3规范适用";
    else if (!row.verified) reason = "前提尚未核查：受累、稀有度、独立性及非循环分类";
    else if (!families[index] || !row.source.trim()) reason = "缺少去重号或来源定位";
    else if (families.filter(value => value === families[index]).length > 1) reason = "去重号重复：请合并同一家系/同一先证者记录后重算";
    else if (row.kind === "homozygous") { points = 0.5; homozygous += points; reason = "纯合观察0.5；该类总贡献封顶1"; }
    else if (!row.otherVariant.trim()) reason = "缺少另一变异标识";
    else if (row.phase === "cis") reason = "确认顺式不属于PM3反式证据";
    else if (row.classification === "B/LB") reason = "另一变异为B/LB，不计PM3";
    else if (row.classification === "VUS") {
      points = row.phase === "trans" ? 0.25 : 0;
      vus += points; reason = points ? "反式VUS：0.25；该类总贡献封顶0.5" : "VUS且相位未知：0";
    } else {
      points = row.phase === "trans" ? 1 : row.classification === "P" ? 0.5 : 0.25;
      other += points; reason = row.phase === "trans" ? "反式P/LP：1" : `相位未知${row.classification}：${points}`;
      if (row.phase === "unknown") { unknownPoints += points; unknownVariants.add(normalizedId(row.otherVariant)); }
    }
    return { points, reason };
  });
  const total = other + Math.min(1, homozygous) + Math.min(0.5, vus);
  const warnings: string[] = [];
  if (homozygous > 1) warnings.push(`纯合原始${homozygous}分，封顶后1分。`);
  if (vus > 0.5) warnings.push(`反式VUS原始${vus}分，封顶后0.5分。`);
  const needsPhaseReview = unknownPoints >= 1 && unknownVariants.size < 2;
  if (needsPhaseReview) warnings.push("未知相位累计已达1分，但只记录一种另一P/LP变异。原文要求关注至少两种不同另一变异；暂停给出强度，先核查相位、单倍型与适用VCEP。此处为学习平台防误用关口，不另创分值上限。");
  return { rows, total, homozygous: Math.min(1, homozygous), vus: Math.min(0.5, vus), other, warnings, needsPhaseReview,
    strength: !scopeConfirmed ? "待确认适用范围" : needsPhaseReview ? "需人工审核，暂不输出强度" : pm3Strength(total) };
}
