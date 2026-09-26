import assert from 'node:assert/strict';
import { jsonToTypeScript } from '../src/tools/json-typescript/generate.ts';
import { jsonToYaml, yamlToJson } from '../src/tools/json-yaml/convert.ts';
import { parseUrl } from '../src/tools/url-parse/parse.ts';

const url = parseUrl('https://user:pass@example.com:8080/docs?q=%E5%B7%A5%E5%85%B7%E7%AE%B1&tag=a&tag=b#intro');
assert.equal(url.error, null);
assert.equal(url.data?.fields.find(({ label }) => label === '主机名')?.value, 'example.com');
assert.deepEqual(url.data?.params, [
  { key: 'q', value: '工具箱' },
  { key: 'tag', value: 'a' },
  { key: 'tag', value: 'b' },
]);
assert.match(parseUrl('not a url').error ?? '', /完整 URL/);

const yaml = jsonToYaml('{"name":"toolbox","enabled":true}', 2);
assert.match(yaml, /name: toolbox/);
assert.deepEqual(JSON.parse(yamlToJson(yaml, 2)), { name: 'toolbox', enabled: true });
assert.throws(() => yamlToJson('---\na: 1\n---\nb: 2', 2), /一个 YAML 文档/);

const generated = jsonToTypeScript(
  { users: [{ id: 1 }, { id: 2, name: 'Alice' }], metadata: { active: true } },
  { rootName: 'api response', style: 'interface', readonly: true },
);
assert.match(generated, /export interface ApiResponse/);
assert.match(generated, /readonly users: User\[\]/);
assert.match(generated, /readonly id: number/);
assert.match(generated, /readonly name\?: string/);
assert.match(generated, /export interface Metadata/);

const union = jsonToTypeScript([1, 'two', null], {
  rootName: 'Values', style: 'type', readonly: false,
});
assert.match(union, /export type Values = \(null \| number \| string\)\[\]/);

console.log('unit checks passed');
