import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'hmac',
  name: 'HMAC 签名',
  description: '用密钥对消息做 HMAC 签名，支持 SHA-1/256/384/512。',
  category: 'crypto',
  icon: 'shield',
  keywords: ['hmac', 'sign', 'signature', 'secret', 'webhook', '签名', '密钥', '验签', '接口'],
  about:
    'HMAC 用一个共享密钥为消息生成签名，接收方用同样的密钥重算一遍就能确认消息没被篡改、' +
    '且确实来自持有密钥的一方。常见于开放平台的接口签名、Webhook 回调验签、支付通知校验。' +
    '与普通哈希的关键区别是：没有密钥就无法伪造签名。',
  faq: [
    {
      q: '可以贴生产环境的密钥进来吗？',
      a: '不建议。虽然本页完全在你的浏览器本地运行、不发送任何数据，但养成「生产密钥不贴进任何网页」的习惯更重要。调试请用测试密钥。',
    },
    {
      q: 'HMAC 和直接哈希「密钥+消息」有什么区别？',
      a: 'HMAC 用两轮哈希和特定的内外填充，能防住长度扩展攻击。简单拼接 secret+message 再哈希的做法在 MD5/SHA-1/SHA-256 上是可以被攻击的。',
    },
    {
      q: '输出该用 hex 还是 base64？',
      a: '看对接方要求。国内开放平台多用 hex（小写），AWS 和很多国际服务用 base64。两种都给出了。',
    },
  ],
};

export default meta;
