"use client";

import { useEffect, useRef, useState } from "react";
import { beginProgressSession, persistProgress, notifyLearningProgress, reportStorageError } from "./learning-record";
import { normalizeProgress } from "./progress-model";

/** Hydrate first; never write a default render over the saved draft. */
export function useProgressPersistence<T extends object>(key: string, snapshot: T, hydrate: (saved: T) => void) {
  const hydrateRef = useRef(hydrate);
  const [readyKey, setReadyKey] = useState("");
  const session = useRef<ReturnType<typeof beginProgressSession> | null>(null);
  useEffect(() => { hydrateRef.current = hydrate; });
  useEffect(() => {
    try {
      session.current = beginProgressSession(window.localStorage, key);
      const saved = session.current.previous;
      hydrateRef.current(normalizeProgress(key, saved === null ? undefined : JSON.parse(saved)) as T);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- finish one-time local hydration before enabling writes
      setReadyKey(key);
    } catch { session.current = null; reportStorageError("本地记录无法读取。当前内容不会覆盖旧记录；请检查浏览器存储权限，或到学习档案导入有效备份。不要清除尚未备份的数据。"); }
  }, [key]);
  useEffect(() => {
    if (readyKey !== key || !session.current) return;
    try {
      if (persistProgress(window.localStorage, session.current, snapshot)) notifyLearningProgress();
    } catch { reportStorageError("学习进度暂未保存：存储空间不足、权限受限，或另一窗口更新了记录。请复制当前未保存的文字，再重新加载；已有记录不会被覆盖。"); }
  }, [key, snapshot, readyKey]);
}
