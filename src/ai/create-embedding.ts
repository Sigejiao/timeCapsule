import "dotenv/config";

const apiKey = process.env.DASHSCOPE_API_KEY;

if (!apiKey) {
  throw new Error("没有读取到 DASHSCOPE_API_KEY，请检查 .env 文件");
}

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-v4",
        input: text,
        dimensions: 1024,
        encoding_format: "float",
      }),
    },
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Embedding API调用失败，状态码：${response.status}\n${responseText}`,
    );
  }

  const result = JSON.parse(responseText) as {
    data?: Array<{
      embedding?: number[];
    }>;
  };

  const embedding = result.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error("返回结果中没有找到向量");
  }

  return embedding;
}
