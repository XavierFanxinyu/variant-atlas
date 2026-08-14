import assert from "node:assert/strict";
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

  for (const label of ["课程", "证据规则", "病例库", "测验", "报告实验室"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }

  assert.match(html, /24课约11\.5小时/);
  assert.match(html, /开放病例<\/span><strong>8/);
  assert.match(html, /28<small> 条标准全覆盖/);
  assert.match(html, /变异致病性 ≠ 病例诊断/);
  assert.match(html, /不接收真实患者信息，不替代临床诊断/);
});
