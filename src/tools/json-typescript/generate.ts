export type DeclarationStyle = 'interface' | 'type';

interface Options {
  rootName: string;
  style: DeclarationStyle;
  readonly: boolean;
}

type JsonObject = Record<string, unknown>;

function typeName(value: string): string {
  const words = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean);
  const name = words.map((word) => word[0]!.toUpperCase() + word.slice(1)).join('');
  return /^[A-Za-z_$]/.test(name) ? name : `Type${name || 'Value'}`;
}

function propertyName(value: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(value) ? value : JSON.stringify(value);
}

function singular(value: string): string {
  if (/ies$/i.test(value)) return value.slice(0, -3) + 'y';
  if (/ses$/i.test(value)) return value.slice(0, -2);
  if (/s$/i.test(value) && !/ss$/i.test(value)) return value.slice(0, -1);
  return `${value}Item`;
}

function unique(types: string[]): string {
  return [...new Set(types)].sort((a, b) => a.localeCompare(b)).join(' | ');
}

export function jsonToTypeScript(value: unknown, options: Options): string {
  const declarations = new Map<string, string>();
  const readonly = options.readonly ? 'readonly ' : '';

  const inferObjects = (objects: JsonObject[], suggestedName: string): string => {
    const name = typeName(suggestedName);
    const keys = [...new Set(objects.flatMap((object) => Object.keys(object)))];
    const fields = keys.map((key) => {
      const values = objects.filter((object) => key in object).map((object) => object[key]);
      const optional = values.length < objects.length ? '?' : '';
      const fieldType = unique(values.map((child) => infer(child, typeName(key))));
      return `  ${readonly}${propertyName(key)}${optional}: ${fieldType};`;
    });
    const body = fields.length ? `\n${fields.join('\n')}\n` : '';
    declarations.set(name, options.style === 'interface'
      ? `export interface ${name} {${body}}`
      : `export type ${name} = {${body}};`);
    return name;
  };

  function infer(current: unknown, suggestedName: string): string {
    if (current === null) return 'null';
    if (Array.isArray(current)) {
      if (current.length === 0) return 'unknown[]';
      const itemName = typeName(singular(suggestedName));
      if (current.every((item): item is JsonObject =>
        typeof item === 'object' && item !== null && !Array.isArray(item))) {
        return `${inferObjects(current, itemName)}[]`;
      }
      const itemTypes = current.map((item) => infer(item, itemName));
      const combined = unique(itemTypes);
      return combined.includes(' | ') ? `(${combined})[]` : `${combined}[]`;
    }
    if (typeof current === 'object') {
      return inferObjects([current as JsonObject], suggestedName);
    }
    if (typeof current === 'string') return 'string';
    if (typeof current === 'number') return 'number';
    if (typeof current === 'boolean') return 'boolean';
    return 'unknown';
  }

  const root = typeName(options.rootName || 'Root');
  const inferred = infer(value, root);
  if (!declarations.has(root)) {
    declarations.set(root, `export type ${root} = ${inferred};`);
  }
  return [...declarations.values()].reverse().join('\n\n');
}
