/** 极简 className 拼接（不想为此引入 clsx） */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
