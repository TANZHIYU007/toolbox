/**
 * 跨页面传递输入内容。
 * 首页智能输入框识别出「这是个 JWT」后，跳到 JWT 工具页要把原文带过去。
 * 用 sessionStorage 而不是 URL：内容可能很长，也不该进浏览历史。
 */
const KEY = 'toolbox:handoff';

export function setHandoff(text: string): void {
  try {
    sessionStorage.setItem(KEY, text);
  } catch {
    /* 隐私模式下可能抛错，忽略即可 */
  }
}

/** 读取并清空（只消费一次，刷新后不会再自动填充） */
export function takeHandoff(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value !== null) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
