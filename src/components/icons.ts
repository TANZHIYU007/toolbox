import {
  ArrowRight, Binary, Braces, Check, ChevronRight, Clock, Command, Copy, Download,
  Fingerprint, Hash, KeyRound, Link, Moon, Palette, QrCode, RefreshCw, Search,
  Sparkles, Sun, TriangleAlert, Wrench, X,
} from 'lucide-react';

/**
 * 显式登记用到的图标。
 * 这样 meta.ts 里只写字符串（保持元信息可被服务端安全引入），
 * 同时 IconName 类型让拼错的图标名在编译期就报错。
 * 新增工具要用新图标时，在这里加一行即可。
 */
export const icons = {
  'arrow-right': ArrowRight,
  binary: Binary,
  braces: Braces,
  check: Check,
  'chevron-right': ChevronRight,
  clock: Clock,
  command: Command,
  copy: Copy,
  download: Download,
  fingerprint: Fingerprint,
  hash: Hash,
  key: KeyRound,
  link: Link,
  moon: Moon,
  palette: Palette,
  qrcode: QrCode,
  refresh: RefreshCw,
  search: Search,
  sparkles: Sparkles,
  sun: Sun,
  warning: TriangleAlert,
  wrench: Wrench,
  x: X,
} as const;

export type IconName = keyof typeof icons;
