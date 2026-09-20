/** Teaching workbench: ACMG/AMP 2015 table 5 plus ClinGen PM2 v1.0's VS+Supporting extension. */
export function workbenchStrength(code: string): string {
  return code === "PM2" ? "支持（ClinGen通用）" : code === "PVS1" ? "极强" : code === "BA1" ? "独立良性" : /^(PS|BS)/.test(code) ? "强" : code.startsWith("PM") ? "中等" : "支持";
}
export function classifyTraditional(input: string[]) {
  const codes = [...new Set(input)];
  if (!codes.length) return { label: "尚未加入证据", reason: "选择证据代码开始练习。", tone: "vus" };
  const has = (code: string) => codes.includes(code);
  const pvs = has("PVS1") ? 1 : 0;
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
  if (pvs >= 1 && pp >= 1) return { label:"可能致病", reason:"满足ClinGen PM2 v1.0提出的扩展：1条极强＋1条支持。此条不是2015表5原有组合。", tone:"likely-pathogenic" };
  const likely = (pvs >= 1 && pm >= 1) || (ps >= 1 && pm >= 1) || (ps >= 1 && pp >= 2) || pm >= 3 || (pm >= 2 && pp >= 2) || (pm >= 1 && pp >= 4);
  if (likely) return { label:"可能致病", reason:"满足传统ACMG/AMP表5的可能致病组合。", tone:"likely-pathogenic" };
  return { label:"意义未明", reason:"尚未达到本练习台采用的组合；这不是对真实变异的分类，仍需审核证据适用性与完整性。", tone:"vus" };
}
