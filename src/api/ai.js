import OpenAI from 'openai';
import {
    AI_CONFIG,
    getApiKeyStatus
} from '../config/ai-config.js';

// 检查API密钥状态
const apiKeyStatus = getApiKeyStatus();
if (apiKeyStatus.status !== 'configured') {
    console.warn(`⚠️ ${apiKeyStatus.message}`);
}

// 创建OpenAI客户端实例，配置DeepSeek API
const openai = new OpenAI({
    apiKey: AI_CONFIG.DEEPSEEK_API_KEY,
    baseURL: AI_CONFIG.DEEPSEEK_BASE_URL,
    dangerouslyAllowBrowser: true, // 允许在浏览器中使用（仅用于开发）
});

// AI聊天服务类
class AIService {
    constructor() {
        this.conversationHistory = [];
        this.maxHistoryLength = AI_CONFIG.MAX_HISTORY_LENGTH;
    }

    // 添加消息到历史记录
    addMessage(role, content) {
        this.conversationHistory.push({
            role,
            content
        });

        // 保持历史记录在合理长度内
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
    }

    // 清空对话历史
    clearHistory() {
        this.conversationHistory = [];
    }

    // 发送消息到DeepSeek AI（流式输出）
    async sendMessageStream(userMessage, onChunk) {
        try {
            // 添加用户消息到历史记录
            this.addMessage('user', userMessage);

            // 准备发送给API的消息
            const messages = [{
                    role: 'system',
                    content: AI_CONFIG.SYSTEM_PROMPT
                },
                ...this.conversationHistory
            ];

            // 调用DeepSeek API（流式）
            const response = await openai.chat.completions.create({
                model: AI_CONFIG.MODEL_NAME,
                messages: messages,
                max_tokens: AI_CONFIG.MAX_TOKENS,
                temperature: AI_CONFIG.TEMPERATURE,
                stream: true
            });

            let fullResponse = '';

            // 处理流式响应
            for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content || '';
                const finishReason = chunk.choices[0]?.finish_reason;
                if (content) {
                    fullResponse += content;
                    // 调用回调函数传递当前内容
                    onChunk(content, fullResponse);
                }
                // 新增：判断流式结束
                if (finishReason === 'stop') {
                    break;
                }
            }

            // 尝试解析JSON响应
            let parsedResponse = this.parseScheduleResponse(fullResponse);

            // 添加完整的AI回复到历史记录
            this.addMessage('assistant', fullResponse);

            return {
                success: true,
                content: parsedResponse.content,
                type: parsedResponse.type,
                schedules: parsedResponse.schedules
            };

        } catch (error) {
            console.error('AI服务错误:', error);

            // 返回错误信息
            return {
                success: false,
                error: error.message || 'AI服务暂时不可用，请稍后重试',
                content: '抱歉，我现在无法回答您的问题。请检查网络连接或稍后重试。'
            };
        }
    }

    // 发送消息到DeepSeek AI（非流式，保持兼容性）
    async sendMessage(userMessage) {
        try {
            // 添加用户消息到历史记录
            this.addMessage('user', userMessage);

            // 准备发送给API的消息
            const messages = [{
                    role: 'system',
                    content: AI_CONFIG.SYSTEM_PROMPT
                },
                ...this.conversationHistory
            ];

            // 调用DeepSeek API
            const response = await openai.chat.completions.create({
                model: AI_CONFIG.MODEL_NAME,
                messages: messages,
                max_tokens: AI_CONFIG.MAX_TOKENS,
                temperature: AI_CONFIG.TEMPERATURE,
                stream: false
            });

            const aiResponse = response.choices[0].message.content;

            // 尝试解析JSON响应
            let parsedResponse = this.parseScheduleResponse(aiResponse);

            // 添加AI回复到历史记录
            this.addMessage('assistant', aiResponse);

            return {
                success: true,
                content: parsedResponse.content,
                type: parsedResponse.type,
                schedules: parsedResponse.schedules,
                usage: response.usage
            };

        } catch (error) {
            console.error('AI服务错误:', error);

            // 返回错误信息
            return {
                success: false,
                error: error.message || 'AI服务暂时不可用，请稍后重试',
                content: '抱歉，我现在无法回答您的问题。请检查网络连接或稍后重试。'
            };
        }
    }

    // 获取对话历史
    getHistory() {
        return [...this.conversationHistory];
    }

    // 解析日程响应
    parseScheduleResponse(response) {
        try {
            // 尝试从响应中提取JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                const parsed = JSON.parse(jsonStr);

                if (parsed.type === 'schedule' && Array.isArray(parsed.schedules)) {
                    // 处理复杂日程格式（多天）
                    if (parsed.schedules.length > 0 && parsed.schedules[0].plans) {
                        // 将多天日程扁平化为单天日程
                        const flattenedSchedules = [];
                        parsed.schedules.forEach(daySchedule => {
                            daySchedule.plans.forEach(plan => {
                                flattenedSchedules.push({
                                    ...plan,
                                    day: daySchedule.day
                                });
                            });
                        });

                        return {
                            content: '我为您生成了以下日程规划：',
                            type: 'schedule',
                            schedules: flattenedSchedules,
                            originalData: parsed // 保留原始数据
                        };
                    } else {
                        // 处理简单日程格式（单天）
                        return {
                            content: '我为您生成了以下日程规划：',
                            type: 'schedule',
                            schedules: parsed.schedules
                        };
                    }
                }
            }
        } catch (error) {
            console.log('解析日程响应失败，返回普通文本:', error);
        }

        // 如果不是日程规划或解析失败，返回普通文本
        return {
            content: response,
            type: 'text',
            schedules: null
        };
    }
}

// 创建单例实例
const aiService = new AIService();

export default aiService;