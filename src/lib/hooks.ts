import { useCallback, useEffect, useRef, useState } from 'react';
import { takeHandoff } from './handoff';

/**
 * 工具的输入框状态。会自动接收首页智能输入框传过来的内容。
 * 所有工具都用它，这样「从首页带内容跳进来」这个能力是白送的。
 */
export function useToolInput(initial = ''): [string, (v: string) => void] {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const handed = takeHandoff();
    if (handed) setValue(handed);
  }, []);

  return [value, setValue];
}

/** 复制到剪贴板，附带 1.5 秒的「已复制」状态 */
export function useCopy(): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback((text: string) => {
    const done = () => {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }, []);

  return { copied, copy };
}

function fallbackCopy(text: string, done: () => void) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    done();
  } finally {
    document.body.removeChild(ta);
  }
}

/** 防抖值，给「输入即计算」但计算较重的工具用 */
export function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/** 持久化到 localStorage 的状态（记住用户的选项偏好） */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);

  // 读取放在 effect 里：避免服务端渲染 / 首屏水合不一致
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* 忽略损坏的数据 */
    }
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* 配额满或隐私模式，忽略 */
      }
    },
    [key],
  );

  return [value, update];
}
