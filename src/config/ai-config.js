// AI配置文件
export const AI_CONFIG = {
  // DeepSeek API配置
  DEEPSEEK_API_KEY: process.env.VUE_APP_DEEPSEEK_API_KEY || 'sk-f731ec2d53514cd1bdc21c0ba77006d8',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',

  // 模型配置
  MODEL_NAME: 'deepseek-chat',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,

  // 对话配置
  MAX_HISTORY_LENGTH: 10,

  // 流式输出配置
  ENABLE_STREAMING: true,

  // 系统提示词
  SYSTEM_PROMPT: `你是一个智能助手，可以帮助用户处理日程管理相关的问题。请用中文回答，回答要简洁明了。

**重要：你的回复支持Markdown格式，可以使用以下Markdown语法：**
- **粗体文本** 用于强调重要信息
- *斜体文本* 用于次要信息
- \`代码\` 用于技术术语或代码
- \`\`\`代码块\`\`\` 用于多行代码
- > 引用块 用于重要提示
- - 列表项 用于列举
- 1. 有序列表 用于步骤说明
- [链接文本](URL) 用于外部链接
- | 表格 | 用于数据展示 |

当用户请求日程规划时：
1) 请将日程的 JSON 结构严格包裹在 <Schedule> 与 </Schedule> 标签中返回；
2) 标签外请保留一段面向用户的自然语言说明（Markdown 可用），不要在聊天文本中直接展示 JSON；
3) JSON 结构参考如下：

简单日程格式（单天）：
<Schedule>
{
  "type": "schedule",
  "schedules": [
    {
      "time": "09:00-10:00",
      "title": "晨会",
      "description": "与团队讨论今日工作计划"
    }
  ]
}
</Schedule>

复杂日程格式（多天）：
<Schedule>
{
  "type": "schedule",
  "schedules": [
    {
      "day": "第1天",
      "plans": [
        {"time": "09:00-11:30", "title": "学习内容", "description": "详细描述"}
      ]
    }
  ]
}
</Schedule>

如果用户没有明确请求日程规划，请正常回复文本内容，可以使用Markdown格式来增强可读性。`
};

// 检查API密钥是否已配置
export function isApiKeyConfigured() {
  return (
    AI_CONFIG.DEEPSEEK_API_KEY &&
    AI_CONFIG.DEEPSEEK_API_KEY !== 'your-deepseek-api-key-here' &&
    AI_CONFIG.DEEPSEEK_API_KEY.startsWith('sk-')
  );
}

// 获取配置信息
export function getConfigInfo() {
  return {
    isConfigured: isApiKeyConfigured(),
    modelName: AI_CONFIG.MODEL_NAME,
    maxTokens: AI_CONFIG.MAX_TOKENS,
    temperature: AI_CONFIG.TEMPERATURE,
  };
}

// 获取API密钥状态信息
export function getApiKeyStatus() {
  const key = AI_CONFIG.DEEPSEEK_API_KEY;

  if (!key || key === 'your-deepseek-api-key-here') {
    return {
      status: 'not-configured',
      message: 'API密钥未配置，请在src/config/ai-config.js中设置正确的API密钥',
    };
  }

  if (!key.startsWith('sk-')) {
    return {
      status: 'invalid-format',
      message: 'API密钥格式不正确，应该以sk-开头',
    };
  }

  return {
    status: 'configured',
    message: 'API密钥已配置',
  };
}