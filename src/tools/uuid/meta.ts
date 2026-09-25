import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'uuid',
  name: 'UUID 生成',
  description: '批量生成符合 RFC 4122 的 v4 随机 UUID。',
  category: 'generate',
  icon: 'sparkles',
  keywords: ['uuid', 'guid', 'v4', 'random', 'id', '唯一标识', '生成', '主键'],
  about:
    'UUID v4 是 122 位随机数，重复概率低到实践中可以忽略，常用作数据库主键、请求追踪 ID、' +
    '临时文件名。本工具使用 crypto.randomUUID()，走的是操作系统的密码学安全随机源，' +
    '不是 Math.random 那种伪随机。',
  faq: [
    {
      q: 'UUID 会重复吗？',
      a: '理论上会，实践中可以忽略。要产生 50% 的碰撞概率，大约需要生成 2.7 × 10^18 个 UUID。',
    },
    {
      q: '适合做数据库主键吗？',
      a: '能用，但 v4 完全随机会导致 B+ 树索引页频繁分裂、写入变慢。对写入量大的表，考虑自增主键或带时间前缀的 UUID v7。',
    },
  ],
};

export default meta;
