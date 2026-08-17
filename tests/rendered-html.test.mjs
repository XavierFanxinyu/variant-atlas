import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Variant Atlas learning workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /<title>Variant Atlas｜遗传解读训练<\/title>/i);
  assert.match(html, /WES \/ WGS · 单基因病诊断/);
  assert.match(html, /把每条证据/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("renders the complete learning loop and safety boundary", async () => {
  const html = await (await render()).text();

  for (const label of ["课程", "证据规则", "SOP工作流", "病例库", "测验", "报告实验室"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }

  assert.match(html, /24课约11\.5小时/);
  assert.match(html, /开放病例<\/span><strong>8/);
  assert.match(html, /28<small> 条标准全覆盖/);
  assert.match(html, /变异致病性 ≠ 病例诊断/);
  assert.match(html, /不接收真实患者信息，不替代临床诊断/);
});

test("includes the SOP-derived auditable workflow without internal document-control details", async () => {
  const source = await readFile(new URL("../app/sop-workflow.ts", import.meta.url), "utf8");
  const workspace = await readFile(new URL("../app/learning-workspace.tsx", import.meta.url), "utf8");

  assert.equal((source.match(/id: "/g) ?? []).length, 22);
  assert.equal((source.match(/id: "wes-/g) ?? []).length, 12);
  for (const label of ["WES病例全流程十二步", "单变异证据底稿十步法", "规范优先级", "阈值登记表", "单变异证据记录字段", "CNV loss", "CNV gain"]) {
    assert.match(workspace, new RegExp(label));
  }
  assert.match(workspace, /不展示企业文控信息、内部职责或原文阈值/);
  assert.match(workspace, /sopChecked/);
  assert.match(workspace, /wesChecked/);
  assert.match(workspace, /sopBranch/);
  assert.doesNotMatch(workspace, /SOP-RI-047|华大BGI/);
});

test("provides structured singleton and family report training", async () => {
  const source = await readFile(new URL("../app/learning-workspace.tsx", import.meta.url), "utf8");
  const reportLab = await readFile(new URL("../app/report-lab.tsx", import.meta.url), "utf8");
  const reportData = await readFile(new URL("../app/report-lab-data.ts", import.meta.url), "utf8");

  assert.match(source, /<ReportLab bestScore=/);
  assert.match(reportLab, /variant-atlas-report-lab-v2/);
  for (const label of ["章节完整性", "病例逻辑一致性", "临床安全边界", "可追溯性", "后续行动"]) {
    assert.match(reportLab, new RegExp(label));
  }
  assert.equal((reportData.match(/id: "(?:family|single)-/g) ?? []).length, 13);
  assert.equal((reportData.match(/no: "\d{2}"/g) ?? []).length, 10);
  assert.match(reportData, /mode: "family"/);
  assert.match(reportData, /mode: "singleton"/);
  assert.match(source, /saveCaseScore\("001",score\)/);
  assert.match(source, /saveCaseScore\("002",pahScore\)/);
  assert.equal(source.match(/JSON\.stringify\(\{answer,step\}\)/g)?.length, 3);
});
