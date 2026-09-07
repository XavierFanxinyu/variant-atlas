import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import ts from "typescript";

// Exercise the actual pure TypeScript modules without adding a test runtime dependency.
const require = createRequire(import.meta.url);
const cache = new Map();
export function loadTypescript(path) {
  const filename = resolve(path);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loaded = { exports: {} };
  cache.set(filename, loaded);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const localRequire = name => {
    if (!name.startsWith(".")) return require(name);
    const base = resolve(dirname(filename), name);
    const target = [base, base + ".ts", base + ".tsx"].find(existsSync);
    if (!target) throw new Error("Missing module " + name);
    return loadTypescript(target);
  };
  try { new Function("require", "module", "exports", output)(localRequire, loaded, loaded.exports); }
  catch (error) { throw new Error(`In ${filename}: ${error.message}`, { cause: error }); }
  return loaded.exports;
}
