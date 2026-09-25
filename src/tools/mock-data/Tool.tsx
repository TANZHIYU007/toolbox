import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import IOArea from '../../components/ui/IOArea';
import Segmented from '../../components/ui/Segmented';
import { cn } from '../../lib/cn';
import { useLocalStorage } from '../../lib/hooks';
import { FIELDS, FIELD_KEYS, type FieldKey } from './generators';

type Format = 'json' | 'csv' | 'sql';

const DEFAULT_FIELDS: FieldKey[] = ['name', 'phone', 'email', 'address'];

function toCsv(rows: Record<string, string>[], keys: FieldKey[]): string {
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const header = keys.map((k) => FIELDS[k].label).join(',');
  const body = rows.map((row) => keys.map((k) => escape(row[k] ?? '')).join(','));
  return [header, ...body].join('\n');
}

function toSql(rows: Record<string, string>[], keys: FieldKey[]): string {
  const columns = keys.join(', ');
  const values = rows
    .map((row) => `  (${keys.map((k) => `'${(row[k] ?? '').replace(/'/g, "''")}'`).join(', ')})`)
    .join(',\n');
  return `INSERT INTO mock_table (${columns}) VALUES\n${values};`;
}

export default function MockDataTool() {
  const [selected, setSelected] = useLocalStorage<FieldKey[]>('tool:mock:fields', DEFAULT_FIELDS);
  const [count, setCount] = useLocalStorage('tool:mock:count', 10);
  const [format, setFormat] = useLocalStorage<Format>('tool:mock:format', 'json');
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    const keys = selected.filter((k) => FIELD_KEYS.includes(k));
    if (keys.length === 0) {
      setOutput('');
      return;
    }

    const rows = Array.from({ length: count }, () => {
      const row: Record<string, string> = {};
      for (const key of keys) row[key] = FIELDS[key].generate();
      return row;
    });

    setOutput(
      format === 'json' ? JSON.stringify(rows, null, 2)
      : format === 'csv' ? toCsv(rows, keys)
      : toSql(rows, keys),
    );
  }, [selected, count, format]);

  useEffect(() => {
    generate();
  }, [generate]);

  const toggleField = (key: FieldKey) => {
    setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  return (
    <div className="space-y-5">
      <Field label="字段">
        <div className="flex flex-wrap gap-1.5">
          {FIELD_KEYS.map((key) => {
            const active = selected.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleField(key)}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-border bg-surface text-fg-muted hover:border-fg-subtle hover:text-fg',
                )}
              >
                {FIELDS[key].label}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Field label="条数">
          <div className="flex gap-1">
            {[5, 10, 50, 100].map((n) => (
              <Button key={n} size="sm" variant={n === count ? 'primary' : 'secondary'} onClick={() => setCount(n)}>
                {n}
              </Button>
            ))}
          </div>
        </Field>

        <Field label="格式">
          <Segmented
            aria-label="输出格式"
            value={format}
            onChange={setFormat}
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'csv', label: 'CSV' },
              { value: 'sql', label: 'SQL' },
            ]}
          />
        </Field>

        <div className="flex-1" />
        <Button variant="primary" onClick={generate} disabled={selected.length === 0}>
          <RefreshCw size={14} />
          重新生成
        </Button>
      </div>

      {selected.length === 0 ? (
        <p className="rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
          至少要选一个字段
        </p>
      ) : (
        <IOArea label={`${count} 条数据`} value={output} rows={16} readOnly />
      )}

      <p className="text-xs leading-relaxed text-fg-subtle">
        全部为本地随机生成的虚构数据，仅用于开发测试与界面填充。
        刻意不提供身份证号等可能与真实公民重合、且易被滥用的字段。
      </p>
    </div>
  );
}
