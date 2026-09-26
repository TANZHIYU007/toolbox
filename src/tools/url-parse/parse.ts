export interface ParsedUrl {
  fields: { label: string; value: string }[];
  params: { key: string; value: string }[];
}

export function parseUrl(input: string): { data: ParsedUrl | null; error: string | null } {
  if (!input.trim()) return { data: null, error: null };
  try {
    const url = new URL(input.trim());
    return {
      data: {
        fields: [
          { label: '协议', value: url.protocol },
          { label: '主机名', value: url.hostname },
          { label: '端口', value: url.port },
          { label: '路径', value: url.pathname },
          { label: '查询串', value: url.search },
          { label: '锚点', value: url.hash },
          { label: '来源', value: url.origin },
          { label: '用户名', value: url.username },
          { label: '密码', value: url.password },
        ],
        params: [...url.searchParams.entries()].map(([key, value]) => ({ key, value })),
      },
      error: null,
    };
  } catch {
    return { data: null, error: '请输入带协议的完整 URL，例如 https://example.com/path?q=hello' };
  }
}
