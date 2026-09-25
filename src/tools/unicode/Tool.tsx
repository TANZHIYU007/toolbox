import { useMemo } from 'react';
import Field from '../../components/ui/Field';
import IOArea from '../../components/ui/IOArea';
import Segmented from '../../components/ui/Segmented';
import Toggle from '../../components/ui/Toggle';
import { useLocalStorage, useToolInput } from '../../lib/hooks';

type Kind = 'unicode' | 'html';
type Direction = 'encode' | 'decode';

const HTML_NAMED: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

function escapeUnicode(text: string, asciiOnly: boolean): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (asciiOnly && code < 128) {
      out += ch;
      continue;
    }
    // 超出 BMP 的字符要拆成代理对，才是合法的 \uXXXX 形式
    if (code > 0xffff) {
      for (let i = 0; i < ch.length; i += 1) {
        out += `\\u${ch.charCodeAt(i).toString(16).padStart(4, '0')}`;
      }
    } else {
      out += `\\u${code.toString(16).padStart(4, '0')}`;
    }
  }
  return out;
}

function unescapeUnicode(text: string): string {
  return text
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

function encodeHtml(text: string, asciiOnly: boolean): string {
  let out = '';
  for (const ch of text) {
    if (HTML_NAMED[ch]) {
      out += HTML_NAMED[ch];
    } else if (!asciiOnly && ch.codePointAt(0)! > 127) {
      out += `&#${ch.codePointAt(0)};`;
    } else {
      out += ch;
    }
  }
  return out;
}

function decodeHtml(text: string): string {
  // 用浏览器自己的解析器处理具名实体，比维护一张表可靠
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

export default function UnicodeTool() {
  const [input, setInput] = useToolInput('');
  const [kind, setKind] = useLocalStorage<Kind>('tool:unicode:kind', 'unicode');
  const [direction, setDirection] = useLocalStorage<Direction>('tool:unicode:dir', 'encode');
  const [asciiOnly, setAsciiOnly] = useLocalStorage('tool:unicode:ascii', true);

  const output = useMemo(() => {
    if (!input) return '';
    try {
      if (kind === 'unicode') {
        return direction === 'encode' ? escapeUnicode(input, asciiOnly) : unescapeUnicode(input);
      }
      return direction === 'encode' ? encodeHtml(input, asciiOnly) : decodeHtml(input);
    } catch {
      return '';
    }
  }, [input, kind, direction, asciiOnly]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          aria-label="转换类型"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'unicode', label: 'Unicode \\u' },
            { value: 'html', label: 'HTML 实体' },
          ]}
        />
        <Segmented
          aria-label="转换方向"
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'encode', label: '编码' },
            { value: 'decode', label: '解码' },
          ]}
        />
        {direction === 'encode' && (
          <Field label="" hint={asciiOnly ? 'ASCII 字符保持原样' : '所有字符都转义'}>
            <Toggle checked={asciiOnly} onChange={setAsciiOnly} label="只转非 ASCII" />
          </Field>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <IOArea
          label={direction === 'encode' ? '原文' : '转义后的文本'}
          value={input}
          onChange={setInput}
          rows={10}
          mono={direction === 'decode'}
          placeholder={
            direction === 'encode'
              ? '你好，世界 🌏'
              : kind === 'unicode'
                ? '\\u4f60\\u597d'
                : '&lt;div&gt;'
          }
        />
        <IOArea
          label="结果"
          value={output}
          rows={10}
          readOnly
          mono={direction === 'encode'}
        />
      </div>
    </div>
  );
}
