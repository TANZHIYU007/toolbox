import { parseAllDocuments, stringify } from 'yaml';

export function jsonToYaml(input: string, indent: number): string {
  return stringify(JSON.parse(input), { indent });
}

export function yamlToJson(input: string, indent: number): string {
  const documents = parseAllDocuments(input);
  if (documents.length !== 1) throw new Error('请输入一个 YAML 文档');
  const document = documents[0]!;
  if (document.errors.length) throw document.errors[0];
  return JSON.stringify(document.toJS(), null, indent);
}
