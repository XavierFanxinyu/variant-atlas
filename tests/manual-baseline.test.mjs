import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTypescript } from "./load-typescript.mjs";
const bytes = readFileSync(new URL("../public/acmg-manual-v18.html", import.meta.url));
const html = bytes.toString("utf8");
const {default: Manual, manualHash} = loadTypescript("app/manual-baseline.tsx");
test("published source is a byte-for-byte pinned authorized manual", () => {
  assert.equal(createHash("sha256").update(bytes).digest("hex"), manualHash);
  for (const code of ["PVS1","PS1","PS2","PS3","PS4","PM1","PM2","PM3","PM4","PM5","PM6","PP1","PP2","PP3","PP4","PP5","BA1","BS1","BS2","BS3","BS4","BP1","BP2","BP3","BP4","BP5","BP6","BP7"]) assert.ok(html.includes(code));
  assert.ok((html.match(/data:image\//g) ?? []).length >= 2);
});
test("manual integration distinguishes baseline, unconverted training and source rights", () => {
  const rendered = renderToStaticMarkup(createElement(Manual));
  for (const text of ["尚未逐题迁移","50%","GRCh38","独立窗口","下载原始HTML","原权利人"]) assert.ok(rendered.includes(text));
  const source = readFileSync(new URL("../app/manual-baseline.tsx", import.meta.url), "utf8");
  assert.match(source, /sandbox="allow-scripts allow-popups allow-modals allow-downloads"/);
  assert.doesNotMatch(source, /allow-same-origin|dangerouslySetInnerHTML/);
});
// Run only the inspected pure grading function, not the document's UI script.
const gradeText = html.match(/function grade\(score, nPath, nBenign, hasBA1\)\{([\s\S]*?)\r?\n  function renderCalc/)[0].replace(/\r?\n  function renderCalc$/, "");
const grade = runInNewContext(`(${gradeText})`, Object.create(null), {timeout: 1000});
test("manual grade boundaries and same-direction minimum are preserved", () => {
  for (const [score,p,b,expected] of [[10,2,0,"Pathogenic（P）"],[9,2,0,"Likely Pathogenic（LP）"],[6,2,0,"Likely Pathogenic（LP）"],[5,2,0,"VUS"],[0,2,2,"VUS"],[-1,0,2,"Likely benign（LB）"],[-6,0,2,"Likely benign（LB）"],[-7,0,2,"Benign（B）"],[8,1,0,"VUS"],[-8,0,1,"VUS"],[6,1,2,"VUS"],[-6,2,1,"VUS"]]) assert.equal(grade(score,p,b,false).label,expected);
  assert.equal(grade(0,0,0,true).label,"Benign（B）");
});
test("LOD matrix contains the complete original 11 by 11 table", () => {
  const matrix = JSON.parse(html.match(/var AR = (\[[\s\S]*?\]);/)[1]);
  assert.equal(matrix.length,11); assert.ok(matrix.every(row=>row.length===11));
  assert.equal(matrix[0][0],0); assert.equal(matrix[1][0],0.6); assert.equal(matrix[10][10],7.27);
  assert.match(html,/if\(x >= 1.5\)/); assert.match(html,/if\(x >= 1.2\)/); assert.match(html,/if\(x >= 0.6\)/);
});
