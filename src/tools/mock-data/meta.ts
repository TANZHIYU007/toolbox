import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'mock-data',
  name: '假数据生成',
  description: '生成中文姓名、手机号、邮箱、地址等测试数据，可导出 JSON/CSV。',
  category: 'generate',
  icon: 'database',
  keywords: ['mock', 'fake', 'test data', 'faker', '假数据', '测试数据', '填充', '造数据'],
  about:
    '开发和演示时需要一批看起来真实的数据来填充列表和表格。这里可以自由组合需要的字段，' +
    '一次生成几十上百条，导出成 JSON 或 CSV 直接用。所有数据都是本地随机生成的虚构内容，' +
    '与任何真实的个人信息无关。',
  faq: [
    {
      q: '生成的手机号是真实存在的吗？',
      a: '号段前缀是真实的运营商号段，但后 8 位完全随机，理论上可能与某个真实号码重合。仅用于界面填充和接口联调，不要用于发送短信或任何实际联系。',
    },
    {
      q: '为什么没有身份证号？',
      a: '刻意不做。身份证号有校验位规则，生成出来的号码可能与真实公民重合，且容易被滥用于绕过实名校验。测试实名流程请使用对接方提供的沙箱数据。',
    },
  ],
};

export default meta;
