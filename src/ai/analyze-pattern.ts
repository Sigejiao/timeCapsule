import "dotenv/config";
import type { PatternCard } from "../types.ts";

const apiKey = process.env.DASHSCOPE_API_KEY;

if (!apiKey) {
  throw new Error("没有读取到 DASHSCOPE_API_KEY，请检查 .env 文件");
}

export async function analyzePattern(
  noteContent: string,
): Promise<PatternCard> {
  const response = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-plus",
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: `
你是时间胶囊笔记工具中的模式分析助手。

请从用户笔记中提炼一个可能跨情境重复出现的行为或思维模式。

要求：
1. 只依据笔记内容，不要进行过度的心理诊断；
2. 每个文字字段只使用一句简洁、自然的话；
3. 各字段各司其职，避免重复表达同一个意思；
4. 不要局限于笔记中的具体场景，要提炼可迁移的模式；
5. keywords 提取2到4个关键词；
6. 只返回以下格式的JSON对象；
{
  "situation": "事情发生的情境",
  "recurringPattern": "可能反复出现的行为或思维模式",
  "thinkingTension": "内在冲突、思维张力",
  "motivationNeed": "深层需要",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}

不要输出Markdown代码块，也不要输出JSON以外的解释。
            `.trim(),
          },
          {
            role: "user",
            content: noteContent,
          },
        ],
      }),
    },
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `模式分析API调用失败，状态码：${response.status}\n${responseText}`,
    );
  }

  const result = JSON.parse(responseText) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("千问返回结果中没有找到模式卡片");
  }

  return JSON.parse(content) as PatternCard;
}
