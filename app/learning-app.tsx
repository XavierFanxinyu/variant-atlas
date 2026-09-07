"use client";
import { useEffect, useState } from "react";
import LearningWorkspace from "./learning-workspace";
import { GENERATION_KEY, LEARNING_REPLACED_EVENT, STORAGE_ERROR_EVENT } from "./learning-record";

export default function LearningApp() {
  const [generation, setGeneration] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const refresh = () => { setGeneration(value => value + 1); setNotice("学习档案已更新，所有训练模块已重新载入。"); };
    const storage = (event: StorageEvent) => { if (event.key === GENERATION_KEY || event.key === null) refresh(); };
    const error = (event: Event) => setNotice((event as CustomEvent<string>).detail);
    window.addEventListener(LEARNING_REPLACED_EVENT, refresh);
    window.addEventListener("storage", storage);
    window.addEventListener(STORAGE_ERROR_EVENT, error);
    return () => {
      window.removeEventListener(LEARNING_REPLACED_EVENT, refresh);
      window.removeEventListener("storage", storage);
      window.removeEventListener(STORAGE_ERROR_EVENT, error);
    };
  }, []);
  return <>{notice && <div className="storage-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="关闭通知">×</button></div>}<LearningWorkspace key={generation} /></>;
}
