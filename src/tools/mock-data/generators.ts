/** 随机取一个元素，用密码学随机源保证分布均匀 */
function pick<T>(list: readonly T[]): T {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return list[buffer[0]! % list.length]!;
}

function randomInt(min: number, max: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return min + (buffer[0]! % (max - min + 1));
}

const SURNAMES = '王李张刘陈杨黄赵吴周徐孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭曾萧田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦付方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤';
const GIVEN = '伟芳娜秀英敏静丽强磊洋艳勇军杰娟涛明超秀霞平刚桂英文辉建华玉兰金凤俊杰志强晓明丹阳浩然子轩思远雨萱欣怡梓涵一鸣嘉豪若曦宇航博文晨曦佳宁';

const DOMAINS = ['gmail.com', 'outlook.com', 'qq.com', '163.com', 'example.com', 'foxmail.com'] as const;
const CARRIERS = ['130', '131', '133', '135', '136', '138', '139', '150', '151', '155', '156', '158', '159', '166', '176', '177', '180', '186', '188', '189', '199'] as const;

const PROVINCES = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '陕西省', '福建省', '山东省'] as const;
const CITIES = ['朝阳区', '浦东新区', '天河区', '西湖区', '鼓楼区', '武侯区', '洪山区', '雁塔区', '思明区', '历下区'] as const;
const STREETS = ['中山路', '人民路', '解放大道', '建设街', '科技园路', '长江大道', '文化路', '环湖东路'] as const;

const COMPANY_PREFIX = ['云启', '智联', '拓维', '恒信', '天工', '锐思', '万象', '星河', '瀚海', '方舟'] as const;
const COMPANY_TYPE = ['科技', '网络', '数据', '信息技术', '数字', '智能'] as const;
const COMPANY_SUFFIX = ['有限公司', '股份有限公司', '集团'] as const;

const WORDS = ['alpha', 'beta', 'delta', 'nova', 'echo', 'orbit', 'pixel', 'quartz', 'river', 'solar', 'tiger', 'vivid'] as const;

export const FIELDS = {
  name: {
    label: '中文姓名',
    generate: () => pick([...SURNAMES]) + (randomInt(0, 1) ? pick([...GIVEN]) : pick([...GIVEN]) + pick([...GIVEN])),
  },
  phone: {
    label: '手机号',
    generate: () => pick(CARRIERS) + String(randomInt(0, 99999999)).padStart(8, '0'),
  },
  email: {
    label: '邮箱',
    generate: () => `${pick(WORDS)}${randomInt(1, 9999)}@${pick(DOMAINS)}`,
  },
  username: {
    label: '用户名',
    generate: () => `${pick(WORDS)}_${pick(WORDS)}${randomInt(1, 99)}`,
  },
  address: {
    label: '地址',
    generate: () => `${pick(PROVINCES)}${pick(CITIES)}${pick(STREETS)}${randomInt(1, 999)}号`,
  },
  company: {
    label: '公司名',
    generate: () => `${pick(COMPANY_PREFIX)}${pick(COMPANY_TYPE)}${pick(COMPANY_SUFFIX)}`,
  },
  ipv4: {
    label: 'IP 地址',
    generate: () => [randomInt(1, 223), randomInt(0, 255), randomInt(0, 255), randomInt(1, 254)].join('.'),
  },
  date: {
    label: '日期时间',
    generate: () => {
      const start = Date.UTC(2020, 0, 1);
      const span = Date.now() - start;
      return new Date(start + randomInt(0, Math.floor(span / 1000)) * 1000)
        .toISOString().slice(0, 19).replace('T', ' ');
    },
  },
  uuid: {
    label: 'UUID',
    generate: () => crypto.randomUUID(),
  },
  price: {
    label: '金额',
    generate: () => (randomInt(100, 999999) / 100).toFixed(2),
  },
} as const;

export type FieldKey = keyof typeof FIELDS;
export const FIELD_KEYS = Object.keys(FIELDS) as FieldKey[];
