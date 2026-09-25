import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import IOArea from '../../components/ui/IOArea';
import Toggle from '../../components/ui/Toggle';
import { RefreshCw } from 'lucide-react';
import { useLocalStorage } from '../../lib/hooks';

const COUNTS = [1, 5, 10, 50];

export default function UuidTool() {
  const [count, setCount] = useLocalStorage('tool:uuid:count', 5);
  const [upper, setUpper] = useLocalStorage('tool:uuid:upper', false);
  const [dashes, setDashes] = useLocalStorage('tool:uuid:dashes', true);
  const [ids, setIds] = useState<string[]>([]);

  const generate = useCallback(() => {
    const next = Array.from({ length: count }, () => crypto.randomUUID());
    setIds(next);
  }, [count]);

  // 进页面就先给一批，不用先点按钮
  useEffect(() => {
    generate();
  }, [generate]);

  const output = ids
    .map((id) => {
      const withDashes = dashes ? id : id.replace(/-/g, '');
      return upper ? withDashes.toUpperCase() : withDashes;
    })
    .join('\n');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Field label="数量">
          <div className="flex gap-1">
            {COUNTS.map((n) => (
              <Button
                key={n}
                size="sm"
                variant={n === count ? 'primary' : 'secondary'}
                onClick={() => setCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </Field>
        <Toggle checked={dashes} onChange={setDashes} label="带连字符" />
        <Toggle checked={upper} onChange={setUpper} label="大写" />
        <div className="flex-1" />
        <Button size="md" variant="primary" onClick={generate}>
          <RefreshCw size={14} />
          重新生成
        </Button>
      </div>

      <IOArea label={`UUID v4 × ${ids.length}`} value={output} rows={Math.min(count + 2, 14)} readOnly />
    </div>
  );
}
