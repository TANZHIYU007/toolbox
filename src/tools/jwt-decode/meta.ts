import type { ToolMeta } from '../types';
import { base64ToUtf8 } from '../../lib/codec';

const JWT_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;

const meta: ToolMeta = {
  id: 'jwt-decode',
  name: 'JWT 解码',
  description: '解析 JWT 的头部与载荷，并把 exp / iat 换算成可读时间。',
  category: 'encode',
  icon: 'key',
  keywords: ['jwt', 'token', 'json web token', 'decode', 'bearer', '解码', '令牌', '鉴权'],
  featured: true,
  about:
    'JWT 由三段用点号分隔的 Base64URL 组成：头部（算法）、载荷（业务声明）、签名。' +
    '前两段只是编码不是加密，任何人都能直接解开，所以载荷里不该放密码之类的敏感信息。' +
    '本工具只做解码，不校验签名 —— 校验需要服务端密钥，把密钥贴进任何网页工具都是危险操作。',
  faq: [
    {
      q: '为什么不验证签名？',
      a: '验证签名需要 HMAC 密钥或 RSA 公钥。私钥绝不该贴进网页，所以这件事应该在你自己的服务端做。本工具只负责让你看清 token 里装了什么。',
    },
    {
      q: 'JWT 里的内容安全吗？',
      a: '不安全。载荷是明文 Base64，浏览器控制台里两行代码就能解开。签名只保证内容没被篡改，不保证保密。',
    },
    {
      q: 'exp 显示已过期但接口还能用？',
      a: '检查一下服务器时间和本地时间是否有偏差，另外部分网关会有几十秒的时钟容差（leeway）。',
    },
  ],
  detect(input) {
    const text = input.trim().replace(/^Bearer\s+/i, '');
    if (!JWT_SHAPE.test(text)) return null;
    try {
      const header = JSON.parse(base64ToUtf8(text.split('.')[0]!)) as { alg?: string };
      if (!header.alg) return null;
      return { score: 0.99, hint: `JWT（算法 ${header.alg}），可解析头部和载荷` };
    } catch {
      return null;
    }
  },
};

export default meta;
