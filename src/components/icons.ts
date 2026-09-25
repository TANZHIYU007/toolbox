import {
  AlignLeft, ArrowRight, Binary, Blend, Braces, CalendarClock, CaseSensitive, Check,
  ChevronRight, Clock, CodeXml, Command, Copy, Calculator, Database, Download, Eye, EyeOff,
  Fingerprint, GitCompare, Globe, Hash, ImageDown, ImagePlus, KeyRound, Link, Lock, Moon,
  Palette, QrCode, Regex, RefreshCw, ScanQrCode, Search, ShieldCheck, Sparkles, Sun, TriangleAlert,
  Upload, Wrench, X,
} from 'lucide-react';

/**
 * 显式登记用到的图标。
 * 这样 meta.ts 里只写字符串（保持元信息可被服务端安全引入），
 * 同时 IconName 类型让拼错的图标名在编译期就报错。
 * 新增工具要用新图标时，在这里加一行即可。
 */
export const icons = {
  'align-left': AlignLeft,
  'arrow-right': ArrowRight,
  binary: Binary,
  blend: Blend,
  braces: Braces,
  calculator: Calculator,
  'calendar-clock': CalendarClock,
  case: CaseSensitive,
  check: Check,
  'chevron-right': ChevronRight,
  clock: Clock,
  code: CodeXml,
  command: Command,
  copy: Copy,
  database: Database,
  diff: GitCompare,
  download: Download,
  eye: Eye,
  'eye-off': EyeOff,
  fingerprint: Fingerprint,
  globe: Globe,
  hash: Hash,
  'image-down': ImageDown,
  'image-plus': ImagePlus,
  key: KeyRound,
  link: Link,
  lock: Lock,
  moon: Moon,
  palette: Palette,
  qrcode: QrCode,
  refresh: RefreshCw,
  regex: Regex,
  scan: ScanQrCode,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
  sun: Sun,
  upload: Upload,
  warning: TriangleAlert,
  wrench: Wrench,
  x: X,
} as const;

export type IconName = keyof typeof icons;
