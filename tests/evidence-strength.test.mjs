import assert from "node:assert/strict";
import test from "node:test";
import { loadTypescript } from "./load-typescript.mjs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
const { calculatePM3, emptyPM3Observation, pm3Strength } = loadTypescript("app/pm3-model.ts");
const { strengthDetails, evidenceSources } = loadTypescript("app/evidence-strength-data.ts");
const { normalizeProgress } = loadTypescript("app/progress-model.ts");
const { collectReviewItems } = loadTypescript("app/review-model.ts");
const { automationExercises } = loadTypescript("app/automation-review-data.ts");
const { classifyTraditional, workbenchStrength } = loadTypescript("app/evidence-combination.ts");
const observation = (family, patch = {}) => ({ ...emptyPM3Observation(), family, source: "公開教學來源 table 1", otherVariant: "other-" + family, classification: "P", phase: "trans", verified: true, ...patch });

test("PM3 exact thresholds and point-table cells", () => {
  for (const [points, strength] of [[0,"未满足PM3"],[0.25,"未满足PM3"],[0.5,"PM3_Supporting"],[0.75,"PM3_Supporting"],[1,"PM3（Moderate）"],[1.75,"PM3（Moderate）"],[2,"PM3_Strong"],[3.75,"PM3_Strong"],[4,"PM3_VeryStrong"]]) assert.equal(pm3Strength(points), strength);
  for (const [classification, phase, expected] of [["P","trans",1],["LP","trans",1],["P","unknown",0.5],["LP","unknown",0.25],["VUS","trans",0.25],["VUS","unknown",0],["P","cis",0],["B/LB","trans",0]]) assert.equal(calculatePM3([observation("A", { classification, phase })],true).total, expected);
});

test("workbench implements the documented PM2 extension with honest fixed-strength labels", () => {
  assert.equal(classifyTraditional([]).label,"尚未加入证据");
  assert.equal(classifyTraditional(["PVS1"]).label,"意义未明");
  assert.equal(classifyTraditional(["PVS1","PM2"]).label,"可能致病");
  assert.match(classifyTraditional(["PVS1","PM2"]).reason,/不是2015/);
  assert.equal(classifyTraditional(["PVS1","PM2","BP4"]).label,"意义未明 / 冲突");
  assert.equal(classifyTraditional(["PVS1","PM2","PM2"]).label,"可能致病");
  assert.equal(workbenchStrength("PS3"),"强");
  assert.equal(workbenchStrength("PM3"),"中等");
});

test("PM3 applies category caps before assigning strength", () => {
  const rows = Array.from({length: 8}, (_,i) => observation("H"+i,{kind:"homozygous"}));
  assert.equal(calculatePM3(rows,true).total,1);
  const vus = Array.from({length: 8}, (_,i) => observation("V"+i,{classification:"VUS"}));
  const result=calculatePM3([...rows,...vus,observation("P1")],true);
  assert.equal(result.total,2.5); assert.equal(result.homozygous,1); assert.equal(result.vus,0.5); assert.equal(result.warnings.length,2);
  assert.equal(result.strength,"PM3_Strong");
});

test("PM3 rejects unverified, incomplete, related/duplicate and wrong-scope observations", () => {
  for(const patch of [{verified:false},{family:" "},{source:" "},{otherVariant:" "}]) assert.equal(calculatePM3([observation("A",patch)],true).total,0);
  assert.equal(calculatePM3([observation("A"),observation(" a ")],true).total,0);
  assert.equal(calculatePM3([observation("A")],false).total,0);
  const result=calculatePM3([observation("A",{phase:"unknown",otherVariant:"same"}),observation("B",{phase:"unknown",otherVariant:" same "})],true);
  assert.equal(result.needsPhaseReview,true); assert.match(result.strength,/人工审核/);
  assert.equal(calculatePM3([observation("A",{phase:"unknown"}),observation("B",{phase:"unknown"})],true).strength,"PM3（Moderate）");
});

test("all 28 codes have source-linked strength guidance and rendered detail", () => {
  const codes=["PVS1",...Array.from({length:4},(_,i)=>"PS"+(i+1)),...Array.from({length:6},(_,i)=>"PM"+(i+1)),...Array.from({length:5},(_,i)=>"PP"+(i+1)),"BA1",...Array.from({length:4},(_,i)=>"BS"+(i+1)),...Array.from({length:7},(_,i)=>"BP"+(i+1))];
  assert.deepEqual(strengthDetails.map(item=>item.code).sort(),codes.sort());
  const Panel=loadTypescript("app/evidence-strength-panel.tsx").default;
  for(const item of strengthDetails){
    for(const source of item.sources) assert.match(evidenceSources[source].url,/^https:\/\//);
    const html=renderToStaticMarkup(createElement(Panel,{code:item.code}));
    assert.match(html,/升降级细则/); assert.match(html,/2026-09-20/); assert.match(html,/href=/);
  }
});

test("new progress schemas roundtrip safely and feed wrong answers into review", () => {
  const pm3={scopeConfirmed:true,observations:[observation("A")]};
  assert.deepEqual(normalizeProgress("variant-atlas-pm3-v1",pm3),pm3);
  assert.throws(()=>normalizeProgress("variant-atlas-pm3-v1",{observations:Array(31).fill(observation("A"))}));
  assert.throws(()=>normalizeProgress("variant-atlas-pm3-v1",{observations:[observation("A",{phase:"fake"})]}));
  const item=automationExercises[0];
  const saved=normalizeProgress("variant-atlas-automation-v1",{submitted:{[item.id]:(item.answer+1)%4}});
  const storage={getItem:key=>key==="variant-atlas-automation-v1"?JSON.stringify(saved):null};
  const queue=collectReviewItems(storage);
  assert.equal(queue.length,1); assert.equal(queue[0].group,"人工审核"); assert.equal(queue[0].answer,item.answer);
  assert.throws(()=>normalizeProgress("variant-atlas-automation-v1",{submitted:{[item.id]:4}}));
});

test("review training and PM3 input surface render without a browser or login", () => {
  const Review=loadTypescript("app/automation-review.tsx").default;
  const Calculator=loadTypescript("app/evidence-strength-panel.tsx").PM3Calculator;
  const html=renderToStaticMarkup(createElement(Review,{onEvidence:()=>{},onReview:()=>{}}));
  assert.match(html,/人工承担可追溯的判断/); assert.match(html,/不是真实患者病例/);
  assert.match(html,/第二步 · 揭示底层信息/); assert.doesNotMatch(html,/第三步 · 提交/);
  const pm3=renderToStaticMarkup(createElement(Calculator));
  assert.match(pm3,/待确认适用范围/); assert.match(pm3,/添加独立观察/);
});
